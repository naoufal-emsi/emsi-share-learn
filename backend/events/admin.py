
from django.contrib import admin
from .models import Event, EventRegistration

class EventRegistrationInline(admin.TabularInline):
    model = EventRegistration
    extra = 0

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'start_date', 'end_date', 'created_by', 'is_featured')
    list_filter = ('is_featured', 'start_date')
    search_fields = ('title', 'description', 'location')
    date_hierarchy = 'start_date'
    inlines = [EventRegistrationInline]

@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'registered_at', 'attended')
    list_filter = ('attended', 'registered_at')
    search_fields = ('event__title', 'user__username')
