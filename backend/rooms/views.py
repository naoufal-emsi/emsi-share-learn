from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Room, RoomParticipant
from .serializers import RoomSerializer, RoomDetailSerializer, JoinRoomSerializer
from .permissions import IsOwnerOrReadOnly , IsAdminOrTargetTeacher
from django.contrib.auth import get_user_model

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly, IsAdminOrTargetTeacher]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'teacher':
            # Teachers see rooms they created
            return Room.objects.filter(owner=user).order_by('created_at')
        elif user.role == 'student':
            # Students see rooms they joined
            return Room.objects.filter(roomparticipant__user=user).order_by('created_at')
        elif user.role == 'admin':
            # Admins see all rooms
            return Room.objects.all().order_by('created_at')
        
        return Room.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RoomDetailSerializer
        return RoomSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def join(self, request):
        serializer = JoinRoomSerializer(data=request.data)
        if serializer.is_valid():
            room_id = serializer.validated_data['room_id']
            try:
                room = Room.objects.get(id=room_id)
                if request.user in room.participants.all():
                    return Response({"message": "You are already a participant in this room"}, 
                                   status=status.HTTP_400_BAD_REQUEST)
                
                RoomParticipant.objects.create(user=request.user, room=room)
                return Response({"message": "Successfully joined the room"}, 
                               status=status.HTTP_200_OK)
            except Room.DoesNotExist:
                return Response({"error": "Room not found"}, 
                               status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        room = self.get_object()
        try:
            participant = RoomParticipant.objects.get(user=request.user, room=room)
            participant.delete()
            return Response({"message": "Successfully left the room"}, 
                           status=status.HTTP_200_OK)
        except RoomParticipant.DoesNotExist:
            return Response({"error": "You are not a participant in this room"}, 
                           status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='teacher-students')
    def teacher_students(self, request):
        User = get_user_model()
        
        # Get teacher_id from query params
        teacher_id = request.query_params.get('teacher_id')
        
        # Validate teacher_id
        if not teacher_id:
            return Response(
                {"error": "teacher_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify the teacher exists
            teacher = User.objects.get(id=teacher_id, role='teacher')
        except User.DoesNotExist:
            return Response(
                {"error": "Teacher not found or not a teacher"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all students in teacher's rooms
        students = User.objects.filter(
        roomparticipant__room__owner=teacher,
        roomparticipant__role='student'  # Now correctly referencing RoomParticipant's role
    ).distinct()
        
        # Serialize the results
        from users.serializers import UserSerializer  # Import your UserSerializer
        serializer = UserSerializer(students, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)