
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        TEACHER = 'teacher', 'Teacher'
        ADMIN = 'admin', 'Admin'
    
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    class Meta:
        db_table = 'auth_user'
