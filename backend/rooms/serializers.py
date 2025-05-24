from rest_framework import serializers
from .models import Room, RoomParticipant
import random
import string

class RoomSerializer(serializers.ModelSerializer):
    participants_count = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    resources_count = serializers.SerializerMethodField()
    quizzes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'name', 'subject', 'description', 'created_at', 
                 'participants_count', 'is_owner', 'resources_count', 'quizzes_count']
        read_only_fields = ['id', 'created_at']
    
    def get_participants_count(self, obj):
        return obj.participants.count()
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner == request.user
        return False
    
    def get_resources_count(self, obj):
        return obj.resources.count()
    
    def get_quizzes_count(self, obj):
        return obj.quizzes.count()
    
    def create(self, validated_data):
        # Generate a random room ID
        room_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        validated_data['id'] = room_id
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

class RoomDetailSerializer(RoomSerializer):
    participants = serializers.SerializerMethodField()
    
    class Meta(RoomSerializer.Meta):
        fields = RoomSerializer.Meta.fields + ['participants', 'owner']
    
    def get_participants(self, obj):
        from users.serializers import UserSerializer
        return UserSerializer(obj.participants.all(), many=True).data

class JoinRoomSerializer(serializers.Serializer):
    room_id = serializers.CharField(max_length=8)
    
    def validate_room_id(self, value):
        try:
            room = Room.objects.get(id=value)
            return value
        except Room.DoesNotExist:
            raise serializers.ValidationError("Room with this ID does not exist.")
