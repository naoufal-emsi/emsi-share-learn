from django.db import models
from django.conf import settings

class PlatformSettings(models.Model):
    """
    Stores platform-wide settings
    """
    platform_name = models.CharField(max_length=100, default="EMSI Share")
    logo = models.TextField(null=True, blank=True)  # Base64 encoded logo
    
    # Page size settings
    resources_per_page = models.IntegerField(default=20)
    forum_posts_per_page = models.IntegerField(default=15)
    events_per_page = models.IntegerField(default=10)
    users_per_page = models.IntegerField(default=25)
    
    # General settings
    enable_registration = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    public_profiles = models.BooleanField(default=True)
    
    # Security settings
    password_policy = models.BooleanField(default=True)
    session_timeout = models.BooleanField(default=True)
    
    # Singleton pattern - only one settings object
    @classmethod
    def get_settings(cls):
        settings, created = cls.objects.get_or_create(id=1)
        return settings
    
    def __str__(self):
        return f"Platform Settings: {self.platform_name}"


class DatabaseStats(models.Model):
    """
    Stores database statistics
    """
    last_updated = models.DateTimeField(auto_now=True)
    used_space_gb = models.FloatField(default=1.2)
    total_space_gb = models.FloatField(default=5.0)
    
    # Resource type usage
    documents_mb = models.FloatField(default=450.0)
    videos_mb = models.FloatField(default=650.0)
    images_mb = models.FloatField(default=80.0)
    code_mb = models.FloatField(default=20.0)
    
    # Singleton pattern - only one stats object
    @classmethod
    def get_stats(cls):
        stats, created = cls.objects.get_or_create(id=1)
        return stats
    
    def __str__(self):
        return f"Database Stats: {self.used_space_gb}GB / {self.total_space_gb}GB"