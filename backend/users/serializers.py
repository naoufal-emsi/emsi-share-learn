from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import base64

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_picture_data = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'profile_picture_data']
        read_only_fields = ['id', 'username', 'email']
    
    def get_profile_picture_data(self, obj):
        if obj.profile_picture:
            mime = 'image/png'  # Default, could be improved by storing mime type
            b64 = base64.b64encode(obj.profile_picture).decode('utf-8')
            return f'data:{mime};base64,{b64}'
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user