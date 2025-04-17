
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Resource, ResourceCategory
from .serializers import ResourceSerializer, ResourceCategorySerializer
from .permissions import IsTeacherOrReadOnly

class ResourceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    permission_classes = [IsTeacherOrReadOnly]

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['created_at', 'views', 'title']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher' or user.role == 'admin':
            return Resource.objects.all()
        return Resource.objects.filter(Q(status='approved') | Q(author=user))
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        resource = self.get_object()
        if request.user.role not in ['teacher', 'admin']:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        resource.status = 'approved'
        resource.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        resource = self.get_object()
        if request.user.role not in ['teacher', 'admin']:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        resource.status = 'rejected'
        resource.save()
        return Response({'status': 'rejected'})
    
    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        resource = self.get_object()
        resource.views += 1
        resource.save()
        return Response({'views': resource.views})
