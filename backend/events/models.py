from django.db import models
from django.conf import settings
from rooms.models import Room
import base64

class Event(models.Model):
    EVENT_TYPES = (
        ('lecture', 'Lecture'),
        ('workshop', 'Workshop'),
        ('exam', 'Exam'),
        ('deadline', 'Deadline'),
        ('meeting', 'Meeting'),
        ('other', 'Other'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='other')
    is_online = models.BooleanField(default=False)
    meeting_link = models.URLField(blank=True, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Event media fields
    image_data = models.BinaryField(null=True, blank=True)
    image_name = models.CharField(max_length=255, null=True, blank=True)
    image_type = models.CharField(max_length=100, null=True, blank=True)
    
    video_data = models.BinaryField(null=True, blank=True)
    video_name = models.CharField(max_length=255, null=True, blank=True)
    video_type = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return self.title
    
    @property
    def image_base64(self):
        if self.image_data:
            return base64.b64encode(self.image_data).decode('utf-8')
        return None
    
    @property
    def video_base64(self):
        if self.video_data:
            return base64.b64encode(self.video_data).decode('utf-8')
        return None
        
    class Meta:
        ordering = ['start_time']

class EventAttendee(models.Model):
    ATTENDANCE_STATUS = (
        ('attending', 'Attending'),
        ('maybe', 'Maybe'),
        ('declined', 'Declined'),
    )
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_attendances')
    status = models.CharField(max_length=10, choices=ATTENDANCE_STATUS, default='attending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('event', 'user')
        
    def __str__(self):
        return f"{self.user.username} - {self.event.title} ({self.status})"