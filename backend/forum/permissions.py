
from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the author or teachers/admins
        return (
            obj.author == request.user or  # For Post, Reply
            getattr(obj, 'created_by', None) == request.user or  # For Topic
            request.user.role in ['teacher', 'admin']
        )

class IsTeacherOrModerateOnly(permissions.BasePermission):
    """
    Custom permission to only allow teachers to moderate content.
    """
    
    def has_permission(self, request, view):
        if view.action not in ['pin', 'mark_as_solution', 'delete']:
            return True
        
        return request.user.is_authenticated and request.user.role in ['teacher', 'admin']
