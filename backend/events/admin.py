from django.contrib import admin
from .models import Event, EventAttendee, EventCollaborator

class EventAttendeeInline(admin.TabularInline):
    model = EventAttendee
    extra = 0
    readonly_fields = ['created_at', 'updated_at']

class EventCollaboratorInline(admin.TabularInline):
    model = EventCollaborator
    extra = 0
    readonly_fields = ['added_at']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'start_time', 'end_time', 'created_by']
    list_filter = ['event_type', 'is_online']
    search_fields = ['title', 'description', 'location']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [EventCollaboratorInline, EventAttendeeInline]

@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['event__title', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(EventCollaborator)
class EventCollaboratorAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'is_admin', 'added_at']
    list_filter = ['is_admin']
    search_fields = ['event__title', 'user__username', 'user__email']
    readonly_fields = ['added_at']