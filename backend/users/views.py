from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, AdminUserCreateSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from django.contrib.auth.hashers import make_password
import os
from django.http import HttpResponse
import base64

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        # Support avatar upload via PATCH as multipart
        user = self.get_object()
        avatar_file = request.FILES.get('avatar')
        if avatar_file:
            if user.avatar:
                user.avatar.delete(save=False)
            user.avatar = avatar_file
            user.save()
        return super().patch(request, *args, **kwargs)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only allow teachers, admins, and administration to see user lists
        user = self.request.user
        if user.role in ['teacher', 'admin', 'administration']:
            return User.objects.all().order_by('date_joined')
        return User.objects.filter(id=user.id)


class AdminUserCreateView(generics.CreateAPIView):
    serializer_class = AdminUserCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Only allow admins and administration to create users
        if request.user.role not in ['admin', 'administration']:
            return Response({'detail': 'You do not have permission to create users.'},
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role
        }, status=status.HTTP_201_CREATED)


class UserDeleteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, user_id):
        # Only allow admins and administration to delete users
        if request.user.role not in ['admin', 'administration']:
            return Response({'detail': 'You do not have permission to delete users.'}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        try:
            user_to_delete = User.objects.get(id=user_id)
            
            # Prevent self-deletion
            if user_to_delete.id == request.user.id:
                return Response({'detail': 'You cannot delete your own account.'}, 
                                status=status.HTTP_400_BAD_REQUEST)
                
            user_to_delete.delete()
            return Response({'detail': 'User deleted successfully.'}, 
                            status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, 
                            status=status.HTTP_404_NOT_FOUND)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            data = response.data
            access = data.get('access')
            refresh = data.get('refresh')
            max_age_access = 60 * 60 * 24  # 1 day
            max_age_refresh = 60 * 60 * 24 * 14  # 14 days
            response.set_cookie(
                settings.SIMPLE_JWT.get('AUTH_COOKIE', 'emsi_access'),
                access,
                max_age=max_age_access,
                httponly=True,
                secure=settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
                domain=settings.SIMPLE_JWT.get('AUTH_COOKIE_DOMAIN', None),
            )
            response.set_cookie(
                settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'emsi_refresh'),
                refresh,
                max_age=max_age_refresh,
                httponly=True,
                secure=settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
                domain=settings.SIMPLE_JWT.get('AUTH_COOKIE_DOMAIN', None),
            )
        return response

class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'detail': 'New password required.'}, status=status.HTTP_400_BAD_REQUEST)
        user.password = make_password(new_password)
        user.save()
        return Response({'detail': 'Password changed successfully.'})

class ProfilePictureDBUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        file = request.FILES.get('avatar')
        if not file:
            return Response({'detail': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        user.profile_picture = file.read()
        user.save()
        return Response({'detail': 'Profile picture uploaded.'})

class ProfilePictureDBGetView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.profile_picture:
            return Response({'detail': 'No profile picture.'}, status=404)
        mime = 'image/png'  # Default, could be improved by storing mime type
        b64 = base64.b64encode(user.profile_picture).decode('utf-8')
        return Response({'image': f'data:{mime};base64,{b64}'})

class ProfilePictureDBDeleteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.profile_picture = None
        user.save()
        return Response({'detail': 'Profile picture deleted.'})

class UserProfilePictureView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            requested_user = User.objects.get(id=user_id)
            if not requested_user.profile_picture:
                return Response({'detail': 'No profile picture.'}, status=404)
            
            mime = 'image/png'  # Default, could be improved by storing mime type
            b64 = base64.b64encode(requested_user.profile_picture).decode('utf-8')
            return Response({'image': f'data:{mime};base64,{b64}'})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)