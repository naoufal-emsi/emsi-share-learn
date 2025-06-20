#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/home/school/Documents/3.2/PFA/emsi-share-learn/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from resources.models import ResourceCategory
from events.models import Event
from forums.models import ForumCategory

def add_resource_categories():
    """Add 10 resource categories"""
    categories = [
        {'name': 'Programming', 'description': 'Code files, programming tutorials, and software development resources', 'icon': 'code', 'color': '#10B981'},
        {'name': 'Mathematics', 'description': 'Mathematical formulas, equations, and problem-solving resources', 'icon': 'calculator', 'color': '#3B82F6'},
        {'name': 'Science', 'description': 'Scientific papers, research, and laboratory materials', 'icon': 'flask', 'color': '#8B5CF6'},
        {'name': 'Literature', 'description': 'Books, articles, essays, and literary analysis', 'icon': 'book', 'color': '#F59E0B'},
        {'name': 'History', 'description': 'Historical documents, timelines, and cultural studies', 'icon': 'clock', 'color': '#EF4444'},
        {'name': 'Languages', 'description': 'Language learning materials, dictionaries, and grammar guides', 'icon': 'globe', 'color': '#06B6D4'},
        {'name': 'Business', 'description': 'Business plans, case studies, and management resources', 'icon': 'briefcase', 'color': '#84CC16'},
        {'name': 'Design', 'description': 'Design templates, graphics, and creative resources', 'icon': 'palette', 'color': '#EC4899'},
        {'name': 'Engineering', 'description': 'Technical drawings, specifications, and engineering materials', 'icon': 'cog', 'color': '#6B7280'},
        {'name': 'General', 'description': 'Miscellaneous educational resources and materials', 'icon': 'folder', 'color': '#9CA3AF'}
    ]
    
    created_count = 0
    for i, cat_data in enumerate(categories):
        category, created = ResourceCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'icon': cat_data['icon'],
                'color': cat_data['color'],
                'order': i + 1
            }
        )
        if created:
            created_count += 1
            print(f"✓ Created resource category: {category.name}")
        else:
            print(f"- Resource category already exists: {category.name}")
    
    print(f"\nResource Categories: {created_count} created, {len(categories) - created_count} already existed")

def add_forum_categories():
    """Add 10 forum categories"""
    categories = [
        {'name': 'General Discussion', 'description': 'General topics and conversations', 'icon': 'message-circle', 'color': '#3B82F6'},
        {'name': 'Q&A', 'description': 'Questions and answers from the community', 'icon': 'help-circle', 'color': '#10B981'},
        {'name': 'Study Groups', 'description': 'Form and join study groups', 'icon': 'users', 'color': '#8B5CF6'},
        {'name': 'Technical Support', 'description': 'Get help with technical issues', 'icon': 'tool', 'color': '#F59E0B'},
        {'name': 'Project Collaboration', 'description': 'Collaborate on projects and assignments', 'icon': 'folder', 'color': '#EF4444'},
        {'name': 'Career Advice', 'description': 'Career guidance and job opportunities', 'icon': 'briefcase', 'color': '#06B6D4'},
        {'name': 'Course Reviews', 'description': 'Share and read course reviews', 'icon': 'star', 'color': '#84CC16'},
        {'name': 'Events & Announcements', 'description': 'Campus events and important announcements', 'icon': 'calendar', 'color': '#EC4899'},
        {'name': 'Resources Sharing', 'description': 'Share and request learning resources', 'icon': 'share', 'color': '#6B7280'},
        {'name': 'Off-Topic', 'description': 'Non-academic discussions and casual chat', 'icon': 'coffee', 'color': '#9CA3AF'}
    ]
    
    created_count = 0
    for i, cat_data in enumerate(categories):
        category, created = ForumCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'icon': cat_data['icon'],
                'color': cat_data['color'],
                'order': i + 1,
                'is_active': True
            }
        )
        if created:
            created_count += 1
            print(f"✓ Created forum category: {category.name}")
        else:
            print(f"- Forum category already exists: {category.name}")
    
    print(f"\nForum Categories: {created_count} created, {len(categories) - created_count} already existed")

def add_event_types():
    """Update event types in the database"""
    # Since events don't have categories, we'll just show the available event types
    event_types = [
        'lecture', 'workshop', 'exam', 'deadline', 'meeting', 
        'conference', 'seminar', 'project', 'social', 'competition', 
        'training', 'other'
    ]
    
    print("\nEvent Types (built into Event model):")
    for event_type in event_types:
        print(f"✓ {event_type.title()}")
    
    print(f"\nTotal Event Types: {len(event_types)} available")

def main():
    print("Adding categories to EMSI Share database...")
    print("=" * 50)
    
    try:
        add_resource_categories()
        add_forum_categories()
        add_event_types()
        
        print("\n" + "=" * 50)
        print("✅ Categories added successfully!")
        
        # Show summary
        total_resource_categories = ResourceCategory.objects.count()
        total_forum_categories = ForumCategory.objects.count()
        print(f"\nSummary:")
        print(f"- Resource Categories in database: {total_resource_categories}")
        print(f"- Forum Categories in database: {total_forum_categories}")
        print(f"- Event Types available: 12")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()