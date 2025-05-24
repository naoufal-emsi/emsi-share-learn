
from django.db import models
from django.conf import settings
from rooms.models import Room
from quizzes.models import Quiz
from resources.models import Resource

class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('room_join', 'Room Join'),
        ('room_leave', 'Room Leave'),
        ('quiz_start', 'Quiz Start'),
        ('quiz_complete', 'Quiz Complete'),
        ('resource_view', 'Resource View'),
        ('resource_download', 'Resource Download'),
        ('forum_post', 'Forum Post'),
        ('event_register', 'Event Register'),
        ('profile_update', 'Profile Update'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True, null=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_activities')
    quiz = models.ForeignKey(Quiz, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_activities')
    resource = models.ForeignKey(Resource, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_activities')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text='Duration in seconds')
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type}"

class RoomAnalytics(models.Model):
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='analytics')
    total_participants = models.IntegerField(default=0)
    active_participants = models.IntegerField(default=0)
    total_quizzes = models.IntegerField(default=0)
    completed_quizzes = models.IntegerField(default=0)
    total_resources = models.IntegerField(default=0)
    total_downloads = models.IntegerField(default=0)
    average_quiz_score = models.FloatField(null=True, blank=True)
    engagement_score = models.FloatField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.room.name}"

class QuizAnalytics(models.Model):
    quiz = models.OneToOneField(Quiz, on_delete=models.CASCADE, related_name='analytics')
    total_attempts = models.IntegerField(default=0)
    completed_attempts = models.IntegerField(default=0)
    average_score = models.FloatField(null=True, blank=True)
    average_time_taken = models.IntegerField(null=True, blank=True, help_text='Average time in seconds')
    highest_score = models.FloatField(null=True, blank=True)
    lowest_score = models.FloatField(null=True, blank=True)
    pass_rate = models.FloatField(null=True, blank=True)
    difficulty_rating = models.FloatField(null=True, blank=True)
    question_analytics = models.JSONField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.quiz.title}"

class SystemMetrics(models.Model):
    date = models.DateField(unique=True)
    total_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    total_rooms = models.IntegerField(default=0)
    active_rooms = models.IntegerField(default=0)
    total_quizzes = models.IntegerField(default=0)
    quiz_attempts = models.IntegerField(default=0)
    resource_uploads = models.IntegerField(default=0)
    resource_downloads = models.IntegerField(default=0)
    forum_posts = models.IntegerField(default=0)
    events_created = models.IntegerField(default=0)
    storage_used = models.BigIntegerField(default=0, help_text='Storage used in bytes')
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Metrics for {self.date}"

class UserEngagement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='engagement_metrics')
    date = models.DateField()
    login_count = models.IntegerField(default=0)
    session_duration = models.IntegerField(default=0, help_text='Total session duration in seconds')
    quiz_attempts = models.IntegerField(default=0)
    resources_accessed = models.IntegerField(default=0)
    forum_interactions = models.IntegerField(default=0)
    events_attended = models.IntegerField(default=0)
    engagement_score = models.FloatField(default=0.0)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} engagement on {self.date}"
