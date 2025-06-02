#!/usr/bin/env python
"""
Script to populate event categories in the database.
This script adds sample events with different event types.
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models after Django setup
from events.models import Event
from django.contrib.auth import get_user_model
from rooms.models import Room

User = get_user_model()

def create_sample_events():
    """Create sample events with different event types"""
    
    # Get or create a sample user for event creation
    try:
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            print("No admin user found. Please create an admin user first.")
            return
    except Exception as e:
        print(f"Error finding admin user: {e}")
        return
    
    # Get a room if available
    try:
        room = Room.objects.first()
    except:
        room = None
    
    # Event types from the model
    event_types = [choice[0] for choice in Event.EVENT_TYPES]
    
    # Sample event data
    sample_events = [
        {
            'title': 'Introduction to Python Programming',
            'description': 'Learn the basics of Python programming language',
            'event_type': 'lecture',
            'is_online': True,
            'meeting_link': 'https://meet.google.com/sample-link'
        },
        {
            'title': 'Web Development Workshop',
            'description': 'Hands-on workshop on building web applications',
            'event_type': 'workshop',
            'is_online': False,
            'location': 'Computer Lab 101'
        },
        {
            'title': 'Final Exam: Data Structures',
            'description': 'End of semester examination',
            'event_type': 'exam',
            'is_online': False,
            'location': 'Examination Hall'
        },
        {
            'title': 'Project Submission Deadline',
            'description': 'Submit your semester projects',
            'event_type': 'deadline',
            'is_online': True
        },
        {
            'title': 'Department Meeting',
            'description': 'Monthly department coordination meeting',
            'event_type': 'meeting',
            'is_online': True,
            'meeting_link': 'https://zoom.us/sample-meeting'
        },
        {
            'title': 'Hackathon',
            'description': '24-hour coding competition',
            'event_type': 'other',
            'is_online': False,
            'location': 'Main Auditorium'
        }
    ]
    
    # Create events
    events_created = 0
    now = datetime.now()
    
    for event_data in sample_events:
        # Generate random start time in the next 30 days
        days_ahead = random.randint(1, 30)
        hours = random.randint(8, 17)  # Between 8 AM and 5 PM
        start_time = now + timedelta(days=days_ahead)
        start_time = start_time.replace(hour=hours, minute=0, second=0, microsecond=0)
        
        # End time is 1-3 hours after start time
        duration = random.randint(1, 3)
        end_time = start_time + timedelta(hours=duration)
        
        try:
            event = Event.objects.create(
                title=event_data['title'],
                description=event_data['description'],
                start_time=start_time,
                end_time=end_time,
                event_type=event_data['event_type'],
                is_online=event_data['is_online'],
                meeting_link=event_data.get('meeting_link'),
                location=event_data.get('location'),
                room=room,
                created_by=admin_user
            )
            events_created += 1
            print(f"Created event: {event.title} ({event.event_type})")
        except Exception as e:
            print(f"Error creating event {event_data['title']}: {e}")
    
    print(f"\nSuccessfully created {events_created} sample events.")

if __name__ == "__main__":
    print("Starting to populate event categories...")
    create_sample_events()
    print("Done!")