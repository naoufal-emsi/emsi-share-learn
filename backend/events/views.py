from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.http import HttpResponse
from .models import Event, EventAttendee
from .serializers import EventSerializer, EventAttendeeSerializer
from rooms.permissions import IsOwnerOrReadOnly
from datetime import datetime, timedelta

class IsTeacherOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow teachers to create events.
    Students can only read events and attend them.
    """
    def has_permission(self, request, view):
        # Allow read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to teachers
        return request.user.role == 'teacher'
        
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the teacher who created the event
        return request.user.role == 'teacher' and obj.created_by == request.user

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
    
    @action(detail=True, methods=['get'])
    def image(self, request, pk=None):
        event = self.get_object()
        
        if not event.image_data:
            return Response({"error": "No image found"}, status=status.HTTP_404_NOT_FOUND)
        
        response = HttpResponse(
            event.image_data,
            content_type=event.image_type
        )
        
        # Set filename for download
        filename = event.image_name or 'event_image'
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        
        return response
    
    @action(detail=True, methods=['get'])
    def video(self, request, pk=None):
        event = self.get_object()
        
        if not event.video_data:
            return Response({"error": "No video found"}, status=status.HTTP_404_NOT_FOUND)
        
        response = HttpResponse(
            event.video_data,
            content_type=event.video_type
        )
        
        # Set filename for download
        filename = event.video_name or 'event_video'
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        
        return response
    
    def get_queryset(self):
        queryset = Event.objects.all()
        
        # Filter by room
        room_id = self.request.query_params.get('room', None)
        if room_id:
            queryset = queryset.filter(room=room_id)
        
        # Filter by event type
        event_type = self.request.query_params.get('type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date__gte=start_date)
            except ValueError:
                pass
                
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date__lte=end_date)
            except ValueError:
                pass
        
        # Filter by search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        
        # Filter by time period
        period = self.request.query_params.get('period', None)
        today = datetime.now().date()
        
        if period == 'today':
            queryset = queryset.filter(start_time__date=today)
        elif period == 'tomorrow':
            tomorrow = today + timedelta(days=1)
            queryset = queryset.filter(start_time__date=tomorrow)
        elif period == 'week':
            week_end = today + timedelta(days=7)
            queryset = queryset.filter(start_time__date__gte=today, start_time__date__lte=week_end)
        elif period == 'month':
            month_end = today + timedelta(days=30)
            queryset = queryset.filter(start_time__date__gte=today, start_time__date__lte=month_end)
        elif period == 'past':
            queryset = queryset.filter(end_time__date__lt=today)
        
        # Filter by attendance
        attendance = self.request.query_params.get('attendance', None)
        if attendance and self.request.user.is_authenticated:
            if attendance == 'attending':
                queryset = queryset.filter(attendees__user=self.request.user, attendees__status='attending')
            elif attendance == 'maybe':
                queryset = queryset.filter(attendees__user=self.request.user, attendees__status='maybe')
            elif attendance == 'declined':
                queryset = queryset.filter(attendees__user=self.request.user, attendees__status='declined')
            elif attendance == 'all':
                queryset = queryset.filter(attendees__user=self.request.user)
        
        return queryset.distinct()
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def attend(self, request, pk=None):
        event = self.get_object()
        status_value = request.data.get('status', 'attending')
        
        if status_value not in ['attending', 'maybe', 'declined']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        attendance, created = EventAttendee.objects.update_or_create(
            event=event,
            user=request.user,
            defaults={'status': status_value}
        )
        
        serializer = EventAttendeeSerializer(attendance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel_attendance(self, request, pk=None):
        event = self.get_object()
        
        try:
            attendance = EventAttendee.objects.get(event=event, user=request.user)
            attendance.delete()
            return Response({'status': 'attendance cancelled'})
        except EventAttendee.DoesNotExist:
            return Response({'error': 'Not attending this event'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def attendees(self, request, pk=None):
        event = self.get_object()
        attendees = event.attendees.all()
        
        status_filter = request.query_params.get('status', None)
        if status_filter:
            attendees = attendees.filter(status=status_filter)
        
        serializer = EventAttendeeSerializer(attendees, many=True)
        return Response(serializer.data)