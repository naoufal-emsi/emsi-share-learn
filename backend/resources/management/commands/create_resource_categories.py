from django.core.management.base import BaseCommand
from resources.models import ResourceCategory

class Command(BaseCommand):
    help = "Create default resource categories"

    def handle(self, *args, **kwargs):
        categories = [
            {
                "name": "Academic Papers",
                "description": "Research papers, journal articles, and academic publications",
                "icon": "book",
                "color": "#3B82F6",
                "order": 1
            },
            {
                "name": "Lecture Notes",
                "description": "Notes from lectures and classes",
                "icon": "file-text",
                "color": "#10B981",
                "order": 2
            },
            {
                "name": "Tutorials",
                "description": "Step-by-step guides and tutorials",
                "icon": "graduation-cap",
                "color": "#F59E0B",
                "order": 3
            },
            {
                "name": "Exercises",
                "description": "Practice exercises and problem sets",
                "icon": "clipboard",
                "color": "#8B5CF6",
                "order": 4
            },
            {
                "name": "Projects",
                "description": "Project files and documentation",
                "icon": "folder",
                "color": "#EC4899",
                "order": 5
            },
            {
                "name": "Reference Materials",
                "description": "Reference guides, cheat sheets, and documentation",
                "icon": "bookmark",
                "color": "#6366F1",
                "order": 6
            },
            {
                "name": "Presentations",
                "description": "Slides and presentation materials",
                "icon": "presentation",
                "color": "#EF4444",
                "order": 7
            },
            {
                "name": "Code Samples",
                "description": "Code examples and snippets",
                "icon": "code",
                "color": "#14B8A6",
                "order": 8
            },
            {
                "name": "Datasets",
                "description": "Data files and datasets for analysis",
                "icon": "database",
                "color": "#F97316",
                "order": 9
            },
            {
                "name": "Other",
                "description": "Miscellaneous resources",
                "icon": "file",
                "color": "#6B7280",
                "order": 10
            }
        ]

        for category_data in categories:
            ResourceCategory.objects.get_or_create(
                name=category_data["name"],
                defaults={
                    "description": category_data["description"],
                    "icon": category_data["icon"],
                    "color": category_data["color"],
                    "order": category_data["order"]
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f"Created {len(categories)} resource categories"))