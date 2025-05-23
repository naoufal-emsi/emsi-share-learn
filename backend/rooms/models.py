
from django.db import models
from django.conf import settings

class Room(models.Model):
    id = models.CharField(primary_key=True, max_length=8, editable=False)
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_rooms')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, through='RoomParticipant', related_name='joined_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.id})"

class RoomParticipant(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'room']
        
    def __str__(self):
        return f"{self.user.username} in {self.room.name}"
