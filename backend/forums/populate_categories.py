from django.core.management.base import BaseCommand
from forums.models import ForumCategory

def create_forum_categories():
    categories = [
        {"name": "General Discussion", "description": "General topics", "color": "#3B82F6", "order": 1},
        {"name": "Questions & Answers", "description": "Ask and answer questions", "color": "#10B981", "order": 2},
        {"name": "Announcements", "description": "Important announcements", "color": "#F59E0B", "order": 3},
        {"name": "Homework Help", "description": "Get help with assignments", "color": "#8B5CF6", "order": 4},
        {"name": "Projects", "description": "Project discussions", "color": "#EC4899", "order": 5},
        {"name": "Resources", "description": "Sharing useful resources", "color": "#6366F1", "order": 6},
        {"name": "Events", "description": "Events and meetups", "color": "#EF4444", "order": 7},
        {"name": "Technical", "description": "Technical discussions", "color": "#14B8A6", "order": 8},
        {"name": "Off-Topic", "description": "Non-academic discussions", "color": "#F97316", "order": 9},
        {"name": "Feedback", "description": "Feedback and suggestions", "color": "#6B7280", "order": 10}
    ]
    
    created_count = 0
    for category_data in categories:
        category, created = ForumCategory.objects.get_or_create(
            name=category_data["name"],
            defaults={
                "description": category_data["description"],
                "color": category_data["color"],
                "order": category_data["order"],
                "is_active": True
            }
        )
        if created:
            created_count += 1
            print(f'Created category: {category.name}')
        else:
            print(f'Category already exists: {category.name}')
    
    print(f'Successfully created {created_count} categories')

if __name__ == "__main__":
    # This allows the script to be run directly
    import django
    import os
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
    django.setup()
    create_forum_categories()