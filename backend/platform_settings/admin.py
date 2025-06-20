from django.contrib import admin
from .models import PlatformSettings, DatabaseStats

@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = ('platform_name', 'maintenance_mode', 'enable_registration')
    fieldsets = (
        ('Platform Info', {
            'fields': ('platform_name', 'logo')
        }),
        ('Page Sizes', {
            'fields': ('resources_per_page', 'forum_posts_per_page', 'events_per_page', 'users_per_page')
        }),
        ('General Settings', {
            'fields': ('enable_registration', 'maintenance_mode', 'public_profiles')
        }),
        ('Security Settings', {
            'fields': ('password_policy', 'session_timeout')
        }),
    )

@admin.register(DatabaseStats)
class DatabaseStatsAdmin(admin.ModelAdmin):
    list_display = ('last_updated',)
    readonly_fields = ('last_updated',)