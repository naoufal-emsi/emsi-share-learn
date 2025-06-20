from rest_framework import serializers
from .models import PlatformSettings, DatabaseStats

class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = [
            'platform_name', 'logo', 
            'resources_per_page', 'forum_posts_per_page', 'events_per_page', 'users_per_page',
            'enable_registration', 'maintenance_mode', 'public_profiles',
            'password_policy', 'session_timeout'
        ]
    
    def to_representation(self, instance):
        """Convert to frontend-friendly format"""
        data = super().to_representation(instance)
        
        return {
            'platformName': data['platform_name'],
            'logo': data['logo'],
            'pageSizes': {
                'resources': data['resources_per_page'],
                'forumPosts': data['forum_posts_per_page'],
                'events': data['events_per_page'],
                'users': data['users_per_page'],
            },
            'generalSettings': {
                'enableRegistration': data['enable_registration'],
                'maintenanceMode': data['maintenance_mode'],
                'publicProfiles': data['public_profiles'],
            },
            'securitySettings': {
                'passwordPolicy': data['password_policy'],
                'sessionTimeout': data['session_timeout'],
            }
        }

class DatabaseStatsSerializer(serializers.Serializer):
    """Serializer for real-time database statistics"""
    
    def to_representation(self, instance):
        """Convert real database stats to frontend format"""
        if isinstance(instance, dict):
            stats = instance
        else:
            stats = DatabaseStats.get_real_stats()
        
        return {
            'database': {
                'size': stats['database_size']['size_pretty'],
                'sizeGB': stats['database_size']['size_gb']
            },
            'records': stats['record_counts'],
            'resources': stats['resource_types']
        }