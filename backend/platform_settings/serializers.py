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
        
        # Format the data to match frontend expectations
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


class DatabaseStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseStats
        fields = [
            'last_updated', 'used_space_gb', 'total_space_gb',
            'documents_mb', 'videos_mb', 'images_mb', 'code_mb'
        ]
    
    def to_representation(self, instance):
        """Convert to frontend-friendly format"""
        data = super().to_representation(instance)
        
        # Format the data to match frontend expectations
        return {
            'used': data['used_space_gb'],
            'total': data['total_space_gb'],
            'resources': {
                'documents': data['documents_mb'],
                'videos': data['videos_mb'],
                'images': data['images_mb'],
                'code': data['code_mb'],
            },
            'lastUpdated': data['last_updated']
        }