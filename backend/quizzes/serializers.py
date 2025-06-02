from rest_framework import serializers
from .models import Quiz, Question, Option, QuizAttempt, Answer, QuizResource

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']
        extra_kwargs = {
            'is_correct': {'write_only': True}
        }

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'options']
    
    def create(self, validated_data):
        options_data = validated_data.pop('options')
        question = Question.objects.create(**validated_data)
        
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
        
        return question

class QuizResourceSerializer(serializers.ModelSerializer):
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizResource
        fields = ['id', 'title', 'file', 'filename', 'uploaded_by', 'uploaded_at', 'file_size']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']
    
    def get_file_size(self, obj):
        return obj.file.size if obj.file else None

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    questions_count = serializers.SerializerMethodField()
    resources_count = serializers.SerializerMethodField()
    student_attempts = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'room', 'created_by', 'created_at',
                 'is_public', 'questions_count', 'resources_count', 'questions', 
                 'is_active', 'max_attempts', 'student_attempts']
        read_only_fields = ['id', 'created_by', 'created_at']
    
    def get_questions_count(self, obj):
        return obj.questions.count()
    
    def get_resources_count(self, obj):
        return obj.quiz_resources.count()
        
    def get_student_attempts(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_student_attempts(request.user)
        return 0
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])  # Extract questions data
        validated_data['created_by'] = self.context['request'].user
        
        # Create the Quiz instance
        quiz = super().create(validated_data)
        
        # Create nested Questions and Options
        for question_data in questions_data:
            options_data = question_data.pop('options')
            question = Question.objects.create(quiz=quiz, **question_data)
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)
        
        return quiz

class QuizDetailSerializer(QuizSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    quiz_resources = QuizResourceSerializer(many=True, read_only=True)
    
    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions', 'quiz_resources']

class QuizSubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    option_id = serializers.IntegerField()

class QuizSubmitSerializer(serializers.Serializer):
    answers = QuizSubmitAnswerSerializer(many=True)

class QuizResultSerializer(serializers.ModelSerializer):
    questions_total = serializers.SerializerMethodField()
    questions_correct = serializers.SerializerMethodField()
    max_attempts = serializers.IntegerField(source='quiz.max_attempts')
    attempts_used = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'student', 'start_time', 'end_time', 
                 'score', 'questions_total', 'questions_correct', 
                 'max_attempts', 'attempts_used']
    
    def get_questions_total(self, obj):
        return obj.quiz.questions.count()
    
    def get_questions_correct(self, obj):
        return obj.answers.filter(is_correct=True).count()
        
    def get_attempts_used(self, obj):
        return obj.quiz.get_student_attempts(obj.student)

class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    selected_option_text = serializers.CharField(source='selected_option.text', read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'question', 'question_text', 'selected_option', 'selected_option_text', 'is_correct']

class QuizAttemptDetailSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'quiz_title', 'student', 'student_username', 'start_time', 'end_time', 'score', 'status', 'answers']