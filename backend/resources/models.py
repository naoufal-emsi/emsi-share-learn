
from django.db import models
from django.conf import settings
from rooms.models import Room

def resource_upload_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/resources/room_<id>/<filename>
    return f'resources/room_{instance.room.id}/{filename}'

class Resource(models.Model):
    RESOURCE_TYPES = (
        ('pdf', 'PDF Document'),
        ('video', 'Video'),
        ('doc', 'Word Document'),
        ('ppt', 'PowerPoint'),
        ('zip', 'ZIP Archive'),
        ('other', 'Other'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to=resource_upload_path)
    type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
