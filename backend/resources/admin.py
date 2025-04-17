
from django.contrib import admin
from .models import Resource, ResourceCategory

@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource_type', 'category', 'author', 'created_at', 'status', 'views')
    list_filter = ('resource_type', 'category', 'status', 'created_at')
    search_fields = ('title', 'description', 'author__username')
    readonly_fields = ('views',)
    date_hierarchy = 'created_at'
