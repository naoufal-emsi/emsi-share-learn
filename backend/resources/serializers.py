
from rest_framework import serializers
from .models import Resource, ResourceCategory

class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = ['id', 'name', 'description']

class ResourceSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.get_full_name')
    category_name = serializers.ReadOnlyField(source='category.name')
    
    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'file', 'external_link', 'resource_type', 
                  'category', 'category_name', 'author', 'author_name', 'created_at', 
                  'updated_at', 'status', 'views']
        read_only_fields = ['author', 'status', 'views']
        
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
