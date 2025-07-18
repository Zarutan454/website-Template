from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import UserProfile, UserSession, EmailVerification, PasswordReset

User = get_user_model()


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    UserProfile admin interface
    """
    list_display = [
        'user', 'occupation', 'company', 'profile_visibility',
        'push_notifications', 'sms_notifications', 'created_at'
    ]
    list_filter = [
        'profile_visibility', 'push_notifications', 'sms_notifications',
        'created_at', 'updated_at'
    ]
    search_fields = ['user__username', 'user__email', 'occupation', 'company']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Profile Information', {
            'fields': ('occupation', 'company', 'interests', 'skills')
        }),
        ('Privacy Settings', {
            'fields': ('profile_visibility',)
        }),
        ('Notification Settings', {
            'fields': ('push_notifications', 'sms_notifications')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """
    UserSession admin interface
    """
    list_display = [
        'user', 'session_key', 'ip_address', 'is_active',
        'created_at', 'expires_at'
    ]
    list_filter = ['is_active', 'created_at', 'expires_at']
    search_fields = ['user__username', 'user__email', 'session_key', 'ip_address']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Session Information', {
            'fields': ('user', 'session_key', 'ip_address', 'user_agent')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'expires_at']


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    """
    EmailVerification admin interface
    """
    list_display = [
        'user', 'token', 'is_used', 'created_at', 'expires_at'
    ]
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['user__username', 'user__email', 'token']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Verification Information', {
            'fields': ('user', 'token', 'is_used')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'expires_at']


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    """
    PasswordReset admin interface
    """
    list_display = [
        'user', 'token', 'is_used', 'created_at', 'expires_at'
    ]
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['user__username', 'user__email', 'token']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Reset Information', {
            'fields': ('user', 'token', 'is_used')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'expires_at']
