from rest_framework import serializers
from .models import Notification, NotificationType

class NotificationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationType
        fields = ['id', 'name', 'description', 'icon', 'color']

class NotificationSerializer(serializers.ModelSerializer):
    notification_type = NotificationTypeSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'sender', 'notification_type', 
            'title', 'message', 'priority', 'is_read', 'is_archived',
            'action_url', 'action_text', 'metadata', 'created_at', 'read_at'
        ]
        read_only_fields = ['recipient', 'sender', 'created_at', 'read_at']