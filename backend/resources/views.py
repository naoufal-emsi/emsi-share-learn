from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, Http404
from django.utils.encoding import smart_str
from .models import Resource
from .serializers import ResourceSerializer
from rooms.permissions import IsOwnerOrReadOnly

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room', None)
        if room_id:
            return Resource.objects.filter(room=room_id).order_by('-uploaded_at')
        # If no room_id, return all resources (or public ones, depending on your logic)
        # For now, let's assume it means resources not tied to any specific room, or all resources.
        # If you want to distinguish public resources, you might add a boolean field e.g. `is_public` to the Resource model.
        return Resource.objects.filter(room__isnull=True).order_by('-uploaded_at') # Example: fetch only room-less resources
        # Or to fetch all: return Resource.objects.all().order_by('-uploaded_at')
    # return Resource.objects.none() # Removed this line which caused SyntaxError
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """
        GET /api/resources/<room_code>/download/
        Returns the resource file as a downloadable response, or 404 if not found.
        """
        # pk is now the room code (Room primary key)
        try:
            # Find the resource by room code (pk) and optionally by file name or other identifier
            resource = Resource.objects.filter(room__pk=pk).order_by('-uploaded_at').first()
            if resource and resource.file:
                resource.download_count += 1
                resource.save()
                response = FileResponse(
                    resource.file.open('rb'),
                    as_attachment=True,
                    filename=resource.file.name.split('/')[-1]
                )
                response['Content-Disposition'] = f'attachment; filename="{smart_str(resource.file.name.split("/")[-1])}"'
                response['Content-Type'] = 'application/octet-stream'
                return response
            else:
                raise Http404("File not found")
        except Resource.DoesNotExist:
            raise Http404("Resource not found")
