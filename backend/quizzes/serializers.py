
from rest_framework import serializers
from .models import Quiz, Question, Answer, QuizAttempt, UserAnswer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, required=False)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'image', 'video_url', 'points', 'answers']
    
    def create(self, validated_data):
        answers_data = validated_data.pop('answers', [])
        question = Question.objects.create(**validated_data)
        
        for answer_data in answers_data:
            Answer.objects.create(question=question, **answer_data)
        
        return question

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    author_name = serializers.ReadOnlyField(source='author.get_full_name')
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'author', 'author_name', 
                 'created_at', 'updated_at', 'is_active', 'duration_minutes', 'questions']
        read_only_fields = ['author']
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        validated_data['author'] = self.context['request'].user
        quiz = Quiz.objects.create(**validated_data)
        
        for question_data in questions_data:
            answers_data = question_data.pop('answers', [])
            question = Question.objects.create(quiz=quiz, **question_data)
            
            for answer_data in answers_data:
                Answer.objects.create(question=question, **answer_data)
        
        return quiz

class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = ['id', 'question', 'answer', 'is_correct']

class QuizAttemptSerializer(serializers.ModelSerializer):
    user_answers = UserAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'user', 'started_at', 'completed_at', 'score', 'user_answers']
        read_only_fields = ['user', 'started_at', 'completed_at', 'score']

class QuizResultsSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'started_at', 'completed_at', 'score']
