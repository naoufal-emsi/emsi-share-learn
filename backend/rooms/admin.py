
from django.contrib import admin
from .models import Room, RoomParticipant

class RoomParticipantInline(admin.TabularInline):
    model = RoomParticipant
    extra = 0

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'subject', 'owner', 'created_at')
    search_fields = ('id', 'name', 'subject')
    list_filter = ('created_at',)
    inlines = [RoomParticipantInline]
