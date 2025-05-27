from django.urls import path
from .views import (
    RegisterView, UserDetailView, UserListView, ChangePasswordView, ProfilePictureUploadView, ProfilePictureDeleteView,
    ProfilePictureDBUploadView, ProfilePictureDBGetView, ProfilePictureDBDeleteView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile-picture/upload/', ProfilePictureUploadView.as_view(), name='profile-picture-upload'),
    path('profile-picture/delete/', ProfilePictureDeleteView.as_view(), name='profile-picture-delete'),
    path('profile/upload-picture', ProfilePictureDBUploadView.as_view(), name='profile-picture-db-upload'),
    path('profile/picture', ProfilePictureDBGetView.as_view(), name='profile-picture-db-get'),
    path('profile/picture', ProfilePictureDBDeleteView.as_view(), name='profile-picture-db-delete'),
]
