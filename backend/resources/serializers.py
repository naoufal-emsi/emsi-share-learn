
from rest_framework import serializers
from .models import Resource

class ResourceSerializer(serializers.ModelSerializer):
    file_size = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'file', 'type', 'room', 
                 'uploaded_by', 'uploaded_at', 'file_size', 'file_name']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size', 'file_name']
        extra_kwargs = {
            'room': {'required': False, 'allow_null': True}
        }
    
    def get_file_size(self, obj):
        return obj.file.size if obj.file else None
    
    def get_file_name(self, obj):
        return obj.file.name.split('/')[-1] if obj.file else None
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)
