
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
        return obj.owner == request.user or request.user.role == 'admin'
class IsAdminOrTargetTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.role == 'admin':
            return True
            
        teacher_id = request.query_params.get('teacher_id')
        return (request.user.role == 'teacher' and 
                str(request.user.id) == teacher_id)