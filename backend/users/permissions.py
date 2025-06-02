from rest_framework import permissions

class IsAdministrationUser(permissions.BasePermission):
    """
    Permission to only allow administration users to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'administration'
        
class IsAdminOrAdministrationUser(permissions.BasePermission):
    """
    Permission to only allow admin or administration users to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'administration']