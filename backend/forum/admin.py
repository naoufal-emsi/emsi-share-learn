
from django.contrib import admin
from .models import Topic, Post, Reply

class PostInline(admin.TabularInline):
    model = Post
    extra = 0

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at', 'is_pinned', 'views')
    list_filter = ('is_pinned', 'created_at')
    search_fields = ('title', 'description', 'created_by__username')
    inlines = [PostInline]

class ReplyInline(admin.TabularInline):
    model = Reply
    extra = 0

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('topic', 'author', 'created_at', 'is_solution')
    list_filter = ('is_solution', 'created_at')
    search_fields = ('content', 'topic__title', 'author__username')
    inlines = [ReplyInline]

@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'post__topic__title', 'author__username')
