
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Count
from .models import Quiz, Question, Answer, QuizAttempt, UserAnswer
from .serializers import (
    QuizSerializer, QuestionSerializer, AnswerSerializer,
    QuizAttemptSerializer, UserAnswerSerializer, QuizResultsSerializer
)
from .permissions import IsTeacherOrReadOnly

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsTeacherOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['teacher', 'admin']:
            return Quiz.objects.all()
        return Quiz.objects.filter(is_active=True)
    
    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        quiz = self.get_object()
        if not quiz.is_active:
            return Response({'detail': 'This quiz is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a new attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user
        )
        
        return Response({
            'attempt_id': attempt.id,
            'quiz_id': quiz.id,
            'started_at': attempt.started_at
        })
    
    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, pk=None):
        quiz = self.get_object()
        attempt_id = request.data.get('attempt_id')
        answers = request.data.get('answers', [])
        
        try:
            attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user, quiz=quiz)
        except QuizAttempt.DoesNotExist:
            return Response({'detail': 'Attempt not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if attempt.completed_at:
            return Response({'detail': 'This attempt has already been submitted'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process answers
        total_points = 0
        earned_points = 0
        
        for answer_data in answers:
            question_id = answer_data.get('question_id')
            answer_id = answer_data.get('answer_id')
            
            try:
                question = Question.objects.get(id=question_id, quiz=quiz)
                answer = Answer.objects.get(id=answer_id, question=question)
                
                total_points += question.points
                is_correct = answer.is_correct
                
                if is_correct:
                    earned_points += question.points
                
                UserAnswer.objects.create(
                    attempt=attempt,
                    question=question,
                    answer=answer,
                    is_correct=is_correct
                )
                
            except (Question.DoesNotExist, Answer.DoesNotExist):
                continue
        
        # Calculate score
        score = (earned_points / total_points * 100) if total_points > 0 else 0
        
        # Complete the attempt
        attempt.completed_at = timezone.now()
        attempt.score = score
        attempt.save()
        
        return Response({
            'attempt_id': attempt.id,
            'score': score,
            'completed_at': attempt.completed_at
        })
    
    @action(detail=False, methods=['get'])
    def my_results(self, request):
        attempts = QuizAttempt.objects.filter(user=request.user, completed_at__isnull=False).order_by('-completed_at')
        serializer = QuizResultsSerializer(attempts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        quiz = self.get_object()
        if request.user.role not in ['teacher', 'admin'] and request.user != quiz.author:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        attempts = QuizAttempt.objects.filter(quiz=quiz, completed_at__isnull=False)
        avg_score = attempts.aggregate(avg_score=Avg('score'))
        num_attempts = attempts.count()
        completion_rate = attempts.count() / QuizAttempt.objects.filter(quiz=quiz).count() * 100 if QuizAttempt.objects.filter(quiz=quiz).count() > 0 else 0
        
        return Response({
            'quiz_id': quiz.id,
            'title': quiz.title,
            'avg_score': avg_score['avg_score'] or 0,
            'num_attempts': num_attempts,
            'completion_rate': completion_rate
        })

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrReadOnly]

class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsTeacherOrReadOnly]

class QuizAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuizAttemptSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['teacher', 'admin']:
            return QuizAttempt.objects.all()
        return QuizAttempt.objects.filter(user=user)
