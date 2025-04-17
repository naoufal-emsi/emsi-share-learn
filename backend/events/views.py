
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Event, EventRegistration
from .serializers import EventSerializer, EventDetailSerializer, EventRegistrationSerializer
from .permissions import IsTeacherOrReadOnly

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsTeacherOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_date', 'created_at', 'title']
    
    def get_queryset(self):
        queryset = Event.objects.all()
        
        # Filter for upcoming events
        upcoming = self.request.query_params.get('upcoming')
        if upcoming:
            queryset = queryset.filter(start_date__gte=timezone.now())
        
        # Filter for past events
        past = self.request.query_params.get('past')
        if past:
            queryset = queryset.filter(end_date__lt=timezone.now())
        
        # Filter for featured events
        featured = self.request.query_params.get('featured')
        if featured:
            queryset = queryset.filter(is_featured=True)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        # Check if event is in the future
        if event.start_date < timezone.now():
            return Response(
                {'detail': 'Cannot register for a past event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is already registered
        if EventRegistration.objects.filter(event=event, user=user).exists():
            return Response(
                {'detail': 'You are already registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create registration
        registration = EventRegistration.objects.create(event=event, user=user)
        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def unregister(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        # Check if event is in the future
        if event.start_date < timezone.now():
            return Response(
                {'detail': 'Cannot unregister from a past event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is registered
        try:
            registration = EventRegistration.objects.get(event=event, user=user)
            registration.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except EventRegistration.DoesNotExist:
            return Response(
                {'detail': 'You are not registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        event = self.get_object()
        user_id = request.data.get('user_id')
        attended = request.data.get('attended', True)
        
        if request.user.role not in ['teacher', 'admin']:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            registration = EventRegistration.objects.get(event=event, user_id=user_id)
            registration.attended = attended
            registration.save()
            serializer = EventRegistrationSerializer(registration)
            return Response(serializer.data)
        except EventRegistration.DoesNotExist:
            return Response(
                {'detail': 'Registration not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def my_events(self, request):
        # Get events the user is registered for
        user = request.user
        registered_events = Event.objects.filter(registrations__user=user)
        serializer = self.get_serializer(registered_events, many=True)
        return Response(serializer.data)

class EventRegistrationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['teacher', 'admin']:
            return EventRegistration.objects.all()
        return EventRegistration.objects.filter(user=user)
