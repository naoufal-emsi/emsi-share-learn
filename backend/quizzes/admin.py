
from django.contrib import admin
from .models import Quiz, Question, Answer, QuizAttempt, UserAnswer

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 4

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'quiz', 'question_type', 'points')
    list_filter = ('quiz', 'question_type')
    search_fields = ('text', 'quiz__title')
    inlines = [AnswerInline]

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'is_active', 'duration_minutes')
    list_filter = ('is_active', 'author', 'created_at')
    search_fields = ('title', 'description', 'author__username')
    inlines = [QuestionInline]

class UserAnswerInline(admin.TabularInline):
    model = UserAnswer
    extra = 0
    readonly_fields = ('question', 'answer', 'is_correct')

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'user', 'started_at', 'completed_at', 'score')
    list_filter = ('quiz', 'user', 'completed_at')
    search_fields = ('quiz__title', 'user__username')
    inlines = [UserAnswerInline]
