from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.utils.encoding import smart_str
from .models import Resource
from .serializers import ResourceSerializer
from rooms.permissions import IsOwnerOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
import logging

logger = logging.getLogger(__name__)

class ResourceViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room', None)
        if room_id:
            return Resource.objects.filter(room=room_id).order_by('-uploaded_at')
        return Resource.objects.filter(room__isnull=True).order_by('-uploaded_at')
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request files: {request.FILES}")
        
        # Check if file_data is in FILES
        if 'file_data' not in request.FILES:
            return Response(
                {'error': 'No file provided. Please include file_data field.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        try:
            resource = Resource.objects.get(pk=pk)
            if resource.file_data:
                # Increment download count
                resource.download_count += 1
                resource.save(update_fields=['download_count'])
                
                # Create response with binary data
                response = HttpResponse(
                    resource.file_data,
                    content_type=resource.file_type or 'application/octet-stream'
                )
                
                # Set proper filename in Content-Disposition header
                filename = resource.file_name or f"resource_{resource.id}"
                response['Content-Disposition'] = f'attachment; filename="{smart_str(filename)}"'
                response['Content-Length'] = len(resource.file_data)
                
                return response
            else:
                return Response(
                    {'error': 'No file data available for this resource'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Resource.DoesNotExist:
            raise Http404("Resource not found")