
from django.db import models
from django.conf import settings
from rooms.models import Room

def resource_upload_path(instance, filename):
    return f'resources/room_{instance.room.id}/{filename}'

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
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to=resource_upload_path, null=True, blank=True)
    external_url = models.URLField(null=True, blank=True)
    type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='resources')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_resources')
    file_size = models.BigIntegerField(null=True, blank=True)
    download_count = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
