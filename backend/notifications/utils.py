from .models import Notification, NotificationType
from django.contrib.auth import get_user_model

User = get_user_model()

def create_notification(
    recipient: User,
    notification_type_name: str,
    title: str,
    message: str,
    sender: User = None,
    priority: str = 'medium',
    action_url: str = None,
    action_text: str = None,
    metadata: dict = None,
    expires_at = None,
):
    """
    Helper function to create a new notification.
    """
    try:
        notification_type = NotificationType.objects.get(name=notification_type_name)
    except NotificationType.DoesNotExist:
        notification_type = NotificationType.objects.create(name=notification_type_name)

    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        action_url=action_url,
        action_text=action_text,
        metadata=metadata,
        expires_at=expires_at,
    )
    return notification