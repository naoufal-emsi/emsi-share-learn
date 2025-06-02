from django.urls import path
from .views import (
    RegisterView, UserDetailView, UserListView, ChangePasswordView,
    ProfilePictureDBUploadView, ProfilePictureDBGetView, ProfilePictureDBDeleteView, 
    UserDeleteView, AdminUserCreateView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('', UserDeleteView.as_view(), name='user-delete'),
    path('create/', AdminUserCreateView.as_view(), name='user-create'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/upload-picture', ProfilePictureDBUploadView.as_view(), name='profile-picture-db-upload'),
    path('profile/picture', ProfilePictureDBGetView.as_view(), name='profile-picture-db-get'),
    path('profile/picture/delete', ProfilePictureDBDeleteView.as_view(), name='profile-picture-db-delete'),
]
