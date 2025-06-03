import base64
from rest_framework import serializers
from .models import Resource, ResourceCategory
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_picture_data = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar', 'profile_picture_data']
    
    def get_profile_picture_data(self, obj):
        if obj.profile_picture:
            mime = 'image/png'  # Default, could be improved by storing mime type
            b64 = base64.b64encode(obj.profile_picture).decode('utf-8')
            return f'data:{mime};base64,{b64}'
        return None

class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'order']

class ResourceSerializer(serializers.ModelSerializer):
    file_size = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    file_data = serializers.FileField(write_only=True)
    category_name = serializers.SerializerMethodField()
    uploaded_by = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)

    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'file_data', 'file_name', 'file_type',
                 'type', 'category', 'category_name', 'room', 'uploaded_by', 'uploaded_at', 
                 'file_size', 'bookmark_count', 'status', 'rejection_reason', 'reviewed_by', 'reviewed_at']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size', 'bookmark_count', 
                           'category_name', 'status', 'rejection_reason', 'reviewed_by', 'reviewed_at']
        extra_kwargs = {
            'room': {'required': False, 'allow_null': True},
            'category': {'required': False, 'allow_null': True}
        }

    def get_file_name(self, obj):
        return obj.file_name

    def get_file_size(self, obj):
        return obj.file_size
        
    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return None

    def create(self, validated_data):
        file_data = validated_data.pop('file_data', None)
        
        # Extract file metadata if file_data is provided and is a file object
        if file_data and hasattr(file_data, 'read'):
            validated_data['file_name'] = file_data.name
            validated_data['file_type'] = getattr(file_data, 'content_type', 'application/octet-stream')
            validated_data['file_size'] = file_data.size
            
            # Determine resource type based on file type
            content_type = validated_data['file_type'].lower()
            if 'pdf' in content_type:
                validated_data['type'] = 'pdf'
            elif 'video' in content_type:
                validated_data['type'] = 'video'
            elif 'audio' in content_type:
                validated_data['type'] = 'audio'
            elif 'image' in content_type:
                validated_data['type'] = 'image'
            elif 'word' in content_type or 'document' in content_type:
                validated_data['type'] = 'doc'
            elif 'powerpoint' in content_type or 'presentation' in content_type:
                validated_data['type'] = 'ppt'
            elif 'excel' in content_type or 'spreadsheet' in content_type:
                validated_data['type'] = 'excel'
            elif 'zip' in content_type or 'compressed' in content_type:
                validated_data['type'] = 'zip'
            elif 'text/plain' in content_type or 'application/json' in content_type or 'text/html' in content_type:
                validated_data['type'] = 'code'
            else:
                validated_data['type'] = 'other'
                
            # Read the binary data
            file_data.seek(0)  # Ensure we're at the beginning
            validated_data['file_data'] = file_data.read()
        elif isinstance(file_data, str):
            # Handle base64 data
            try:
                validated_data['file_data'] = base64.b64decode(file_data)
            except Exception as e:
                raise serializers.ValidationError(f"Invalid base64 data: {str(e)}")

        user = self.context['request'].user
        validated_data['uploaded_by'] = user
        
        # Set status based on user role
        if user.role == 'student':
            validated_data['status'] = 'pending'
        else:
            validated_data['status'] = 'approved'
            
        return super().create(validated_data)