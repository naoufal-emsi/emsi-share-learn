from django.db import models
from django.conf import settings
from rooms.models import Room

def resource_upload_path(instance, filename):
    if instance.room:
        return f'resources/room_{instance.room.pk}/{filename}'
    return f'resources/general/{filename}'

class ResourceCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=20, default="#3B82F6")
    order = models.IntegerField(default=0)
    
    class Meta:
        verbose_name_plural = "Resource Categories"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class Resource(models.Model):
    RESOURCE_TYPES = (
        ('document', 'Document'),
        ('video', 'Video'),
        ('code', 'Code'),
        ('pdf', 'PDF Document'),
        ('audio', 'Audio'),
        ('image', 'Image'),
        ('doc', 'Word Document'),
        ('ppt', 'PowerPoint'),
        ('excel', 'Excel'),
        ('zip', 'ZIP Archive'),
        ('link', 'External Link'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file_data = models.BinaryField(null=True, blank=True)  # Stores binary data directly
    file_name = models.CharField(max_length=255, null=True, blank=True)  # Store original filename
    file_type = models.CharField(max_length=100, null=True, blank=True)  # Store MIME type
    external_url = models.URLField(null=True, blank=True)
    type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    category = models.ForeignKey(ResourceCategory, on_delete=models.SET_NULL, related_name='resources', null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='resources', null=True, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_resources')
    file_size = models.BigIntegerField(null=True, blank=True)
    bookmark_count = models.IntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='approved')
    rejection_reason = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                   related_name='reviewed_resources', null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Only calculate file_size if file_data is bytes and not already set
        if self.file_data and isinstance(self.file_data, (bytes, memoryview)) and not self.file_size:
            self.file_size = len(self.file_data)
        super().save(*args, **kwargs)
    
    @property
    def has_file(self):
        """Check if resource has file data"""
        return bool(self.file_data)
    
    @property
    def file_size_mb(self):
        """Get file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0