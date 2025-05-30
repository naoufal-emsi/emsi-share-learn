
import base64
from rest_framework import serializers
from .models import Resource

class ResourceSerializer(serializers.ModelSerializer):
    file_size = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    file_data = serializers.FileField(write_only=True)

    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'file_data', 'file_name', 'file_type',
                 'type', 'room', 'uploaded_by', 'uploaded_at', 'file_size', 'download_count']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size', 'download_count']
        extra_kwargs = {
            'room': {'required': False, 'allow_null': True}
        }

    def get_file_name(self, obj):
        return obj.file_name

    def get_file_size(self, obj):
        return obj.file_size

    def create(self, validated_data):
        file_data = validated_data.pop('file_data', None)
        
        # Extract file metadata if file_data is provided and is a file object
        if file_data and hasattr(file_data, 'read'):
            validated_data['file_name'] = file_data.name
            validated_data['file_type'] = getattr(file_data, 'content_type', 'application/octet-stream')
            validated_data['file_size'] = file_data.size
            # Read the binary data
            file_data.seek(0)  # Ensure we're at the beginning
            validated_data['file_data'] = file_data.read()
        elif isinstance(file_data, str):
            # Handle base64 data
            try:
                validated_data['file_data'] = base64.b64decode(file_data)
            except Exception as e:
                raise serializers.ValidationError(f"Invalid base64 data: {str(e)}")

        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)