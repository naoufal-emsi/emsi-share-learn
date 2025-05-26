
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.http import FileResponse, Http404
from .models import Quiz, Question, Option, QuizAttempt, Answer, QuizResource
from .serializers import (
    QuizSerializer, QuizDetailSerializer, QuestionSerializer, 
    QuizSubmitSerializer, QuizResultSerializer, QuizResourceSerializer
)
from rooms.permissions import IsOwnerOrReadOnly

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all().order_by('id')
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.action == 'list':
            room_id = self.request.query_params.get('room', None)
            is_public = self.request.query_params.get('public', None)
            
            if is_public == 'true':
                return Quiz.objects.filter(is_public=True, room__isnull=True).order_by('created_at')
            elif room_id:
                return Quiz.objects.filter(room_id=room_id).order_by('created_at')
            else:
                return Quiz.objects.none()
        # For other actions (retrieve, update, etc.), return all quizzes
        return Quiz.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'], url_path='submit')
    def submit_quiz(self, request, pk=None):
        quiz = self.get_object()
        serializer = QuizSubmitSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create or get the quiz attempt
            attempt, created = QuizAttempt.objects.get_or_create(
                quiz=quiz,
                student=request.user,
                defaults={'start_time': timezone.now()}
            )
            
            if not created and attempt.end_time:
                return Response(
                    {"error": "You have already completed this quiz"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process answers
            correct_count = 0
            total_questions = quiz.questions.count()
            
            # Delete any existing answers for this attempt
            Answer.objects.filter(attempt=attempt).delete()
            
            # Process new answers
            for answer_data in serializer.validated_data['answers']:
                question_id = answer_data['question_id']
                option_id = answer_data['option_id']
                
                try:
                    question = Question.objects.get(id=question_id, quiz=quiz)
                    option = Option.objects.get(id=option_id, question=question)
                    
                    is_correct = option.is_correct
                    Answer.objects.create(
                        attempt=attempt,
                        question=question,
                        selected_option=option,
                        is_correct=is_correct
                    )
                    
                    if is_correct:
                        correct_count += 1
                        
                except (Question.DoesNotExist, Option.DoesNotExist):
                    continue
            
            # Calculate score
            if total_questions > 0:
                score = (correct_count / total_questions) * 100
            else:
                score = 0
            
            # Update attempt with end time and score
            attempt.end_time = timezone.now()
            attempt.score = score
            attempt.status = 'completed'
            attempt.save()
            
            # Return the results
            result_serializer = QuizResultSerializer(attempt)
            return Response(result_serializer.data, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], url_path='resources')
    def get_resources(self, request, pk=None):
        quiz = self.get_object()
        resources = QuizResource.objects.filter(quiz=quiz)
        serializer = QuizResourceSerializer(resources, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='resource/(?P<resource_id>[^/.]+)/download')
    def download_resource(self, request, resource_id=None):
        try:
            resource = QuizResource.objects.get(id=resource_id)
            if resource.file:
                response = FileResponse(resource.file.open(), as_attachment=True, filename=resource.filename)
                return response
            else:
                raise Http404("File not found")
        except QuizResource.DoesNotExist:
            raise Http404("Resource not found")

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        quiz_id = self.request.query_params.get('quiz', None)
        if quiz_id:
            return Question.objects.filter(quiz_id=quiz_id).order_by('order')
        return Question.objects.none()
