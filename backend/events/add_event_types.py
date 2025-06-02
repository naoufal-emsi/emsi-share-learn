#!/usr/bin/env python
"""
Script to add new event types to the Event model.
"""

import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models after Django setup
from django.db import connection
from events.models import Event

def add_event_types():
    """Add new event types to the Event model's choices"""
    
    # Current event types in the model
    current_types = [choice[0] for choice in Event.EVENT_TYPES]
    print(f"Current event types: {', '.join(current_types)}")
    
    # New event types to add
    new_types = [
        ('conference', 'Conference'),
        ('seminar', 'Seminar'),
        ('project', 'Project'),
        ('social', 'Social Event'),
        ('competition', 'Competition'),
        ('training', 'Training')
    ]
    
    # Check which types are new
    types_to_add = [t for t in new_types if t[0] not in current_types]
    
    if not types_to_add:
        print("No new event types to add.")
        return
    
    print(f"\nAdding {len(types_to_add)} new event types:")
    for event_type, display_name in types_to_add:
        print(f"- {event_type}: {display_name}")
    
    print("\nTo add these event types, you need to:")
    print("1. Add them to the EVENT_TYPES tuple in events/models.py")
    print("2. Run migrations to update the database schema")
    
    print("\nUpdate your models.py with this EVENT_TYPES definition:")
    
    # Create updated EVENT_TYPES tuple
    all_types = Event.EVENT_TYPES + tuple(t for t in new_types if t[0] not in current_types)
    
    print("\nEVENT_TYPES = (")
    for event_type, display_name in all_types:
        print(f"    ('{event_type}', '{display_name}'),")
    print(")")
    
    print("\nAfter updating the model, run:")
    print("python manage.py makemigrations")
    print("python manage.py migrate")

if __name__ == "__main__":
    print("Analyzing event types...")
    add_event_types()