
from django.db import models
from django.conf import settings
from rooms.models import Room

class Quiz(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True, blank=True, related_name='quizzes')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_quizzes')
    is_public = models.BooleanField(default=False)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    time_limit = models.IntegerField(null=True, blank=True, help_text='Time limit in minutes')
    max_attempts = models.IntegerField(default=1)
    passing_score = models.FloatField(default=60.0)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
    ]
    
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple_choice')
    points = models.FloatField(default=1.0)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}..."

class Option(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.text} - {'Correct' if self.is_correct else 'Incorrect'}"

class QuizAttempt(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='in_progress')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.username} - {self.quiz.title} - {self.score}%"

class Answer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, null=True, blank=True, on_delete=models.SET_NULL)
    is_correct = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['attempt', 'question']
    
    def __str__(self):
        return f"Answer to {self.question.text[:30]}..."

class QuizResource(models.Model):
    RESOURCE_TYPES = [
        ('pdf', 'PDF Document'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('image', 'Image'),
        ('doc', 'Word Document'),
        ('ppt', 'PowerPoint'),
        ('excel', 'Excel'),
        ('zip', 'ZIP Archive'),
        ('other', 'Other'),
    ]
    
    quiz = models.ForeignKey(Quiz, related_name='quiz_resources', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='quiz_resources/')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=RESOURCE_TYPES, default='other')
    file_size = models.BigIntegerField(null=True, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_quiz_resources')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.quiz.title}"
