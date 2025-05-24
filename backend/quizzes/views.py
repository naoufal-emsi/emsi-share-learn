
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Quiz, Question, Option, QuizAttempt, Answer
from .serializers import (
    QuizSerializer, QuizDetailSerializer, QuestionSerializer, 
    QuizSubmitSerializer, QuizResultSerializer
)
from rooms.permissions import IsOwnerOrReadOnly

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room', None)
        if room_id:
            return Quiz.objects.filter(room_id=room_id)
        return Quiz.objects.none()
    
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
                    
                    Answer.objects.create(
                        attempt=attempt,
                        question=question,
                        selected_option=option
                    )
                    
                    if option.is_correct:
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
            attempt.save()
            
            # Return the results
            result_serializer = QuizResultSerializer(attempt)
            return Response(result_serializer.data, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        quiz_id = self.request.query_params.get('quiz', None)
        if quiz_id:
            return Question.objects.filter(quiz_id=quiz_id)
        return Question.objects.none()
