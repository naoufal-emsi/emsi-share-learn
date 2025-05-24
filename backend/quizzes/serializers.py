
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
    
    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        instance = super().update(instance, validated_data)
        
        if options_data:
            instance.options.all().delete()
            for option_data in options_data:
                Option.objects.create(question=instance, **option_data)
        
        return instance

class QuizResourceSerializer(serializers.ModelSerializer):
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizResource
        fields = ['id', 'title', 'file', 'filename', 'uploaded_by', 'uploaded_at', 'file_size']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size']
    
    def get_file_size(self, obj):
        return obj.file.size if obj.file else None

class QuizSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()
    resources_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'room', 'created_by', 'created_at', 
                 'is_public', 'questions_count', 'resources_count']
        read_only_fields = ['id', 'created_by', 'created_at']
    
    def get_questions_count(self, obj):
        return obj.questions.count()
    
    def get_resources_count(self, obj):
        return obj.quiz_resources.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

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
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'student', 'start_time', 'end_time', 
                 'score', 'questions_total', 'questions_correct']
    
    def get_questions_total(self, obj):
        return obj.quiz.questions.count()
    
    def get_questions_correct(self, obj):
        correct_count = 0
        for answer in obj.answers.all():
            if answer.selected_option and answer.selected_option.is_correct:
                correct_count += 1
        return correct_count
