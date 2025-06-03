from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.utils.encoding import smart_str
from django.utils import timezone
from django.db.models import Q
from .models import Resource, ResourceCategory
from .serializers import ResourceSerializer, ResourceCategorySerializer
from rooms.permissions import IsOwnerOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
import logging

logger = logging.getLogger(__name__)

class ResourceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ResourceViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Resource.objects.all().order_by('-uploaded_at')
        user = self.request.user
        
        # Filter by status - only show approved resources by default
        # Admins can see pending resources with a specific filter
        status = self.request.query_params.get('status', None)
        
        # By default, only show approved resources to everyone
        if not status:
            queryset = queryset.filter(status='approved')
        # Allow admins to filter by status
        elif user.role in ['admin', 'administration'] and status in ['pending', 'rejected', 'all']:
            if status == 'all':
                pass  # Don't filter by status
            else:
                queryset = queryset.filter(status=status)
        # Students can see their own pending/rejected resources
        elif status == 'my-pending' and user.role == 'student':
            queryset = queryset.filter(uploaded_by=user, status='pending')
        elif status == 'my-rejected' and user.role == 'student':
            queryset = queryset.filter(uploaded_by=user, status='rejected')
        else:
            # Default to approved resources for any other status parameter
            queryset = queryset.filter(status='approved')
        
        # Basic filters
        room_id = self.request.query_params.get('room', None)
        resource_type = self.request.query_params.get('type', None)
        category_id = self.request.query_params.get('category', None)
        search_query = self.request.query_params.get('search', None)
        
        # Apply filters
        if room_id:
            queryset = queryset.filter(room=room_id)
        else:
            # This is the default behavior for resources not in a room
            queryset = queryset.filter(room__isnull=True)
            
        if resource_type:
            if resource_type == 'document':
                # Group all document types
                queryset = queryset.filter(
                    Q(type='document') | Q(type='pdf') | Q(type='doc') | 
                    Q(type='ppt') | Q(type='excel')
                )
            else:
                queryset = queryset.filter(type=resource_type)
                
        if category_id:
            queryset = queryset.filter(category=category_id)
            
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(description__icontains=search_query)
            )
            
        return queryset
    
    @action(detail=False, methods=['get'], url_path='all')
    def all_resources(self, request): # 'request' is intentionally kept for DRF action signature
        # This action should return ALL resources, regardless of room association
        queryset = Resource.objects.filter(status='approved').order_by('-uploaded_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'], url_path='pending', permission_classes=[permissions.IsAuthenticated])
    def pending_resources(self, request):
        """Get all pending resources for admin approval"""
        user = request.user
        if user.role not in ['admin', 'administration']:
            return Response(
                {"detail": "You do not have permission to view pending resources."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        queryset = Resource.objects.filter(status='pending').order_by('-uploaded_at')
        serializer = self.get_serializer(queryset, many=True)
        
        # Create notification for admin about pending resources if there are any
        if queryset.exists() and not request.query_params.get('no_notification'):
            from notifications.models import Notification, NotificationType
            notification_type, _ = NotificationType.objects.get_or_create(
                name='pending_resources',
                defaults={
                    'description': 'Pending resources notifications',
                    'icon': 'clock',
                    'color': '#FF9800'
                }
            )
            
            # Check if there's already a recent notification (within last 24 hours)
            recent_notification = Notification.objects.filter(
                recipient=user,
                notification_type=notification_type,
                created_at__gte=timezone.now() - timezone.timedelta(hours=24)
            ).exists()
            
            if not recent_notification:
                Notification.objects.create(
                    recipient=user,
                    notification_type=notification_type,
                    title="Pending Resources",
                    message=f"There are {queryset.count()} resources waiting for your approval.",
                    action_url="/admin/resources/pending",
                    action_text="Review Resources"
                )
        
        return Response(serializer.data)
    
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
            
    @action(detail=True, methods=['post'], url_path='bookmark')
    def bookmark(self, request, pk=None):
        try:
            resource = Resource.objects.get(pk=pk)
            # Increment bookmark count
            resource.bookmark_count += 1
            resource.save(update_fields=['bookmark_count'])
            
            return Response({
                'status': 'success',
                'bookmark_count': resource.bookmark_count
            })
        except Resource.DoesNotExist:
            raise Http404("Resource not found")
    
    @action(detail=True, methods=['post'], url_path='approve', permission_classes=[permissions.IsAuthenticated])
    def approve_resource(self, request, pk=None):
        """Approve a pending resource"""
        user = request.user
        if user.role not in ['admin', 'administration']:
            return Response(
                {"detail": "You do not have permission to approve resources."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            resource = Resource.objects.get(pk=pk)
            
            if resource.status != 'pending':
                return Response(
                    {"detail": "Only pending resources can be approved."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            resource.status = 'approved'
            resource.reviewed_by = user
            resource.reviewed_at = timezone.now()
            resource.save()
            
            # Create notification for the student
            from notifications.models import Notification, NotificationType
            notification_type, _ = NotificationType.objects.get_or_create(
                name='resource_approved',
                defaults={
                    'description': 'Resource approval notifications',
                    'icon': 'check-circle',
                    'color': '#4CAF50'
                }
            )
            
            Notification.objects.create(
                recipient=resource.uploaded_by,
                sender=user,
                notification_type=notification_type,
                title="Resource Approved",
                message=f"Your resource '{resource.title}' has been approved and is now available.",
                action_url=f"/resources/{resource.id}",
                action_text="View Resource"
            )
            
            return Response({"detail": "Resource approved successfully."})
            
        except Resource.DoesNotExist:
            raise Http404("Resource not found")
    
    @action(detail=True, methods=['post'], url_path='reject', permission_classes=[permissions.IsAuthenticated])
    def reject_resource(self, request, pk=None):
        """Reject a pending resource"""
        user = request.user
        if user.role not in ['admin', 'administration']:
            return Response(
                {"detail": "You do not have permission to reject resources."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            resource = Resource.objects.get(pk=pk)
            
            if resource.status != 'pending':
                return Response(
                    {"detail": "Only pending resources can be rejected."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            reason = request.data.get('reason', '')
            if not reason:
                return Response(
                    {"detail": "Rejection reason is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            resource.status = 'rejected'
            resource.rejection_reason = reason
            resource.reviewed_by = user
            resource.reviewed_at = timezone.now()
            resource.save()
            
            # Create notification for the student
            from notifications.models import Notification, NotificationType
            notification_type, _ = NotificationType.objects.get_or_create(
                name='resource_rejected',
                defaults={
                    'description': 'Resource rejection notifications',
                    'icon': 'x-circle',
                    'color': '#F44336'
                }
            )
            
            Notification.objects.create(
                recipient=resource.uploaded_by,
                sender=user,
                notification_type=notification_type,
                title="Resource Rejected",
                message=f"Your resource '{resource.title}' was not approved. Reason: {reason}",
                action_url=f"/resources/my-rejected",
                action_text="View Rejected Resources"
            )
            
            return Response({"detail": "Resource rejected successfully."})
            
        except Resource.DoesNotExist:
            raise Http404("Resource not found")
            