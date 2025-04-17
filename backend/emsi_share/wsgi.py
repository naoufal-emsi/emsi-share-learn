
"""
WSGI config for emsi_share project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emsi_share.settings')

application = get_wsgi_application()
