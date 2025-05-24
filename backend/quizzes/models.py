
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
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    shuffle_questions = models.BooleanField(default=False)
    shuffle_options = models.BooleanField(default=False)
    show_results_immediately = models.BooleanField(default=True)
    allow_review = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
        ('fill_blank', 'Fill in the Blank'),
    ]
    
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple_choice')
    points = models.FloatField(default=1.0)
    order = models.IntegerField(default=0)
    explanation = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='question_images/', null=True, blank=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.text[:30]}..."

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
        ('expired', 'Expired'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='in_progress')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    percentage = models.FloatField(null=True, blank=True)
    total_points = models.FloatField(null=True, blank=True)
    earned_points = models.FloatField(null=True, blank=True)
    time_taken = models.IntegerField(null=True, blank=True, help_text='Time taken in seconds')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ['quiz', 'student']
    
    def __str__(self):
        return f"{self.student.username} - {self.quiz.title}"

class Answer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, null=True, blank=True, on_delete=models.SET_NULL)
    text_answer = models.TextField(null=True, blank=True)  # For short answer/essay questions
    is_correct = models.BooleanField(null=True, blank=True)
    points_earned = models.FloatField(default=0.0)
    time_spent = models.IntegerField(null=True, blank=True, help_text='Time spent on question in seconds')
    
    class Meta:
        unique_together = ['attempt', 'question']
    
    def __str__(self):
        return f"Answer to {self.question}"

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
    is_downloadable = models.BooleanField(default=True)
    download_count = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.title} - {self.quiz.title}"

class QuizCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    icon = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Quiz Categories'
    
    def __str__(self):
        return self.name

class QuizTag(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='tags')
    category = models.ForeignKey(QuizCategory, on_delete=models.CASCADE, related_name='quiz_tags')
    
    class Meta:
        unique_together = ['quiz', 'category']
