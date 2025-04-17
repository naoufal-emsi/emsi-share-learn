
#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emsi_share.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

def create_admin_user():
    try:
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@emsi.ma',
            password='adminpassword',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        print(f"Admin user created successfully: {admin_user.username}")
    except IntegrityError:
        print("Admin user already exists")

if __name__ == "__main__":
    create_admin_user()
