
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner or admin
        # Check if the object has an 'uploaded_by' attribute (for resources) or 'owner' (for rooms)
        if hasattr(obj, 'uploaded_by'):
            return obj.uploaded_by == request.user or request.user.role == 'admin'
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user or request.user.role == 'admin'
        return False # Default to false if neither attribute exists
class IsAdminOrTargetTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.role == 'admin':
            return True
            
        teacher_id = request.query_params.get('teacher_id')
        return (request.user.role == 'teacher' and 
                str(request.user.id) == teacher_id)

class IsAuthenticatedAndTeacher(permissions.BasePermission):
    """
    Allows access only to authenticated teachers.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'teacher'