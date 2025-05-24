
from django.db import models
from django.conf import settings
from rooms.models import Room

class EventCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    icon = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        verbose_name_plural = 'Event Categories'
    
    def __str__(self):
        return self.name

class Event(models.Model):
    EVENT_TYPES = [
        ('lecture', 'Lecture'),
        ('workshop', 'Workshop'),
        ('seminar', 'Seminar'),
        ('exam', 'Exam'),
        ('quiz', 'Quiz'),
        ('meeting', 'Meeting'),
        ('conference', 'Conference'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('postponed', 'Postponed'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    event_type = models.CharField(max_length=15, choices=EVENT_TYPES, default='lecture')
    category = models.ForeignKey(EventCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True, blank=True, related_name='events')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_events')
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True)
    online_link = models.URLField(blank=True, null=True)
    is_online = models.BooleanField(default=False)
    max_attendees = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    is_public = models.BooleanField(default=False)
    requires_approval = models.BooleanField(default=False)
    reminder_sent = models.BooleanField(default=False)
    image = models.ImageField(upload_to='event_images/', null=True, blank=True)
    tags = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_datetime']
    
    def __str__(self):
        return self.title

class EventAttendance(models.Model):
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('confirmed', 'Confirmed'),
        ('attended', 'Attended'),
        ('no_show', 'No Show'),
        ('cancelled', 'Cancelled'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_attendances')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='registered')
    registered_at = models.DateTimeField(auto_now_add=True)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['event', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title}"

class EventResource(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='event_resources/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_event_resources')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.title} - {self.event.title}"

class EventReminder(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reminders')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_reminders')
    remind_minutes_before = models.IntegerField(default=30)
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['event', 'user']
    
    def __str__(self):
        return f"Reminder for {self.user.username} - {self.event.title}"

class EventFeedback(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_feedback')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    would_recommend = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['event', 'user']
    
    def __str__(self):
        return f"Feedback by {self.user.username} for {self.event.title}"
