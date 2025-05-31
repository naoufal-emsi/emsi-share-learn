from django.contrib import admin
from .models import Notification, NotificationType

@admin.register(NotificationType)
class NotificationTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon', 'color', 'is_active')
    search_fields = ('name', 'description')
    list_filter = ('is_active',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient', 'sender', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'is_archived', 'notification_type', 'priority')
    search_fields = ('title', 'message', 'recipient__username', 'sender__username')
    raw_id_fields = ('recipient', 'sender')
    date_hierarchy = 'created_at'