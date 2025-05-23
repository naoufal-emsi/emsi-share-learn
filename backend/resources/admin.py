
from django.contrib import admin
from .models import Resource

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'room', 'uploaded_by', 'uploaded_at')
    list_filter = ('type', 'uploaded_at')
    search_fields = ('title', 'description')
