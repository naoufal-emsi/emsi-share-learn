
from rest_framework import serializers
from .models import Event, EventRegistration

class EventRegistrationSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    user_email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = EventRegistration
        fields = ['id', 'event', 'user', 'user_name', 'user_email', 'registered_at', 'attended']
        read_only_fields = ['user', 'registered_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    registrations_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'location', 'start_date', 'end_date',
                 'created_by', 'created_by_name', 'created_at', 'updated_at', 
                 'image', 'is_featured', 'registrations_count', 'is_registered']
        read_only_fields = ['created_by']
    
    def get_registrations_count(self, obj):
        return obj.registrations.count()
    
    def get_is_registered(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        return obj.registrations.filter(user=user).exists()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class EventDetailSerializer(EventSerializer):
    registrations = EventRegistrationSerializer(many=True, read_only=True)
    
    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['registrations']
