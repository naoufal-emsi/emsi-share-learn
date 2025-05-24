
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, Http404
from .models import Resource
from .serializers import ResourceSerializer
from rooms.permissions import IsOwnerOrReadOnly

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room', None)
        if room_id:
            return Resource.objects.filter(room_id=room_id).order_by('uploaded_at')
        return Resource.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        try:
            resource = self.get_object()
            if resource.file:
                # Increment download count
                resource.download_count += 1
                resource.save()
                
                response = FileResponse(
                    resource.file.open(), 
                    as_attachment=True, 
                    filename=resource.file.name.split('/')[-1]
                )
                return response
            else:
                raise Http404("File not found")
        except Resource.DoesNotExist:
            raise Http404("Resource not found")
