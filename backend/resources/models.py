
from django.db import models
from django.conf import settings

class ResourceCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name_plural = "Resource Categories"

class Resource(models.Model):
    RESOURCE_TYPES = (
        ('document', 'Document'),
        ('video', 'Video'),
        ('link', 'External Link'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    file = models.FileField(upload_to='resources/', null=True, blank=True)
    external_link = models.URLField(null=True, blank=True)
    resource_type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, related_name='resources')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resources')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    views = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return self.title
