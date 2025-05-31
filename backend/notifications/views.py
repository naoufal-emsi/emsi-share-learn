from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Notification, NotificationType
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        include_archived = self.request.query_params.get('include_archived', 'false').lower() == 'true'
        
        queryset = Notification.objects.filter(recipient=self.request.user)
        
        if not include_archived:
            queryset = queryset.filter(is_archived=False)
        
        # Print debug info
        count = queryset.count()
        print(f"Found {count} notifications for user {self.request.user.username}")
        for notification in queryset[:5]:  # Print first 5 for debugging
            print(f"Notification {notification.id}: {notification.title} (read: {notification.is_read})")
            
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        print(f"Marked notification {notification.id} as read")
        return Response({'status': 'success'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        print(f"Marked {count} notifications as read for user {request.user.username}")
        return Response({'status': 'success'})