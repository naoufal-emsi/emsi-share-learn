from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings

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

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only allow teachers and admins to see user lists
        user = self.request.user
        if user.role in ['teacher', 'admin']:
            return User.objects.all().order_by('date_joined')
        return User.objects.filter(id=user.id)

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
