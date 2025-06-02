from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission

User = get_user_model()

@receiver(post_save, sender=User)
def set_administration_permissions(sender, instance, created, **kwargs):
    """
    Signal to automatically grant all permissions to users with the 'administration' role
    """
    if instance.role == 'administration':
        # Make the user a superuser
        if not instance.is_superuser:
            instance.is_superuser = True
            instance.is_staff = True
            # Save without triggering the signal again
            User.objects.filter(pk=instance.pk).update(is_superuser=True, is_staff=True)