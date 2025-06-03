from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import PlatformSettings, DatabaseStats
from .serializers import PlatformSettingsSerializer, DatabaseStatsSerializer
import json

class PlatformSettingsView(APIView):
    """
    API endpoint for platform settings
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get platform settings"""
        # Only admins and administration can access settings
        if not request.user.is_staff and request.user.role not in ['admin', 'administration']:
            return Response(
                {"detail": "You do not have permission to access platform settings."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings = PlatformSettings.get_settings()
        serializer = PlatformSettingsSerializer(settings)
        return Response(serializer.data)
    
    def post(self, request):
        """Update platform settings"""
        # Only admins and administration can update settings
        if not request.user.is_staff and request.user.role not in ['admin', 'administration']:
            return Response(
                {"detail": "You do not have permission to modify platform settings."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings = PlatformSettings.get_settings()
        
        # Parse the incoming data
        data = request.data
        
        # Update platform name
        if 'platformName' in data:
            settings.platform_name = data['platformName']
        
        # Update page sizes
        if 'pageSizes' in data:
            page_sizes = data['pageSizes']
            if 'resources' in page_sizes:
                settings.resources_per_page = page_sizes['resources']
            if 'forumPosts' in page_sizes:
                settings.forum_posts_per_page = page_sizes['forumPosts']
            if 'events' in page_sizes:
                settings.events_per_page = page_sizes['events']
            if 'users' in page_sizes:
                settings.users_per_page = page_sizes['users']
        
        # Update general settings
        if 'generalSettings' in data:
            general_settings = data['generalSettings']
            if 'enableRegistration' in general_settings:
                settings.enable_registration = general_settings['enableRegistration']
            if 'maintenanceMode' in general_settings:
                settings.maintenance_mode = general_settings['maintenanceMode']
            if 'publicProfiles' in general_settings:
                settings.public_profiles = general_settings['publicProfiles']
        
        # Update security settings
        if 'securitySettings' in data:
            security_settings = data['securitySettings']
            if 'passwordPolicy' in security_settings:
                settings.password_policy = security_settings['passwordPolicy']
            if 'sessionTimeout' in security_settings:
                settings.session_timeout = security_settings['sessionTimeout']
        
        # Save the settings
        settings.save()
        
        # Return the updated settings
        serializer = PlatformSettingsSerializer(settings)
        return Response(serializer.data)


class PlatformLogoView(APIView):
    """
    API endpoint for platform logo
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Update platform logo"""
        # Only admins and administration can update logo
        if not request.user.is_staff and request.user.role not in ['admin', 'administration']:
            return Response(
                {"detail": "You do not have permission to modify platform logo."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings = PlatformSettings.get_settings()
        
        # Parse the incoming data
        data = request.data
        
        if 'logo' in data:
            settings.logo = data['logo']
            settings.save()
            
            return Response({
                "message": "Logo updated successfully",
                "logo": settings.logo
            })
        
        return Response(
            {"detail": "No logo provided."},
            status=status.HTTP_400_BAD_REQUEST
        )


class DatabaseStatsView(APIView):
    """
    API endpoint for database statistics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get database statistics"""
        # Only admins and administration can access stats
        if not request.user.is_staff and request.user.role not in ['admin', 'administration']:
            return Response(
                {"detail": "You do not have permission to access database statistics."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = DatabaseStats.get_stats()
        serializer = DatabaseStatsSerializer(stats)
        return Response(serializer.data)
    
    def post(self, request):
        """Update database statistics (for testing/demo purposes)"""
        # Only admins and administration can update stats
        if not request.user.is_staff and request.user.role not in ['admin', 'administration']:
            return Response(
                {"detail": "You do not have permission to modify database statistics."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = DatabaseStats.get_stats()
        
        # Parse the incoming data
        data = request.data
        
        # Update stats
        if 'used' in data:
            stats.used_space_gb = data['used']
        if 'total' in data:
            stats.total_space_gb = data['total']
        
        # Update resource type usage
        if 'resources' in data:
            resources = data['resources']
            if 'documents' in resources:
                stats.documents_mb = resources['documents']
            if 'videos' in resources:
                stats.videos_mb = resources['videos']
            if 'images' in resources:
                stats.images_mb = resources['images']
            if 'code' in resources:
                stats.code_mb = resources['code']
        
        # Save the stats
        stats.save()
        
        # Return the updated stats
        serializer = DatabaseStatsSerializer(stats)
        return Response(serializer.data)