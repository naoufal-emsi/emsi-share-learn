
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']
    
    def __str__(self):
        return self.email

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    institution = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    skills = models.TextField(blank=True, null=True)  # JSON field for skills list
    interests = models.TextField(blank=True, null=True)  # JSON field for interests
    social_links = models.TextField(blank=True, null=True)  # JSON field for social media links
    timezone = models.CharField(max_length=50, default='UTC')
    language_preference = models.CharField(max_length=10, default='en')
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    quiz_reminders = models.BooleanField(default=True)
    forum_notifications = models.BooleanField(default=True)
    event_notifications = models.BooleanField(default=True)
    theme_preference = models.CharField(max_length=10, choices=[('light', 'Light'), ('dark', 'Dark'), ('auto', 'Auto')], default='auto')
    privacy_level = models.CharField(max_length=10, choices=[('public', 'Public'), ('friends', 'Friends'), ('private', 'Private')], default='public')
    
    def __str__(self):
        return f"{self.user.username}'s Settings"
