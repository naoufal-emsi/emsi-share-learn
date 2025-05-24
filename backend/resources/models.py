
from django.db import models
from django.conf import settings
from rooms.models import Room

def resource_upload_path(instance, filename):
    return f'resources/room_{instance.room.id}/{filename}'

class ResourceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    
    class Meta:
        verbose_name_plural = 'Resource Categories'
    
    def __str__(self):
        return self.name

class Resource(models.Model):
    RESOURCE_TYPES = (
        ('pdf', 'PDF Document'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('image', 'Image'),
        ('doc', 'Word Document'),
        ('ppt', 'PowerPoint'),
        ('excel', 'Excel'),
        ('zip', 'ZIP Archive'),
        ('link', 'External Link'),
        ('other', 'Other'),
    )
    
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('room_only', 'Room Only'),
        ('private', 'Private'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to=resource_upload_path, null=True, blank=True)
    external_url = models.URLField(null=True, blank=True)
    type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    category = models.ForeignKey(ResourceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='resources')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_resources')
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='room_only')
    file_size = models.BigIntegerField(null=True, blank=True)
    download_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    tags = models.CharField(max_length=500, blank=True, null=True)  # Comma-separated tags
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class ResourceAccess(models.Model):
    ACCESS_TYPES = [
        ('view', 'View'),
        ('download', 'Download'),
        ('share', 'Share'),
    ]
    
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='access_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resource_accesses')
    access_type = models.CharField(max_length=10, choices=ACCESS_TYPES)
    accessed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} {self.access_type} {self.resource.title}"

class ResourceComment(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resource_comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.resource.title}"

class ResourceRating(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resource_ratings')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['resource', 'user']
    
    def __str__(self):
        return f"{self.user.username} rated {self.resource.title} - {self.rating}/5"
