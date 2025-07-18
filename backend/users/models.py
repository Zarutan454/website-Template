from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()

class UserProfile(models.Model):
    """
    Extended user profile information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Additional profile fields
    occupation = models.CharField(max_length=100, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    interests = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    
    # Privacy settings
    profile_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('friends', 'Friends Only'),
            ('private', 'Private'),
        ],
        default='public'
    )
    post_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('friends', 'Friends Only'),
            ('private', 'Private'),
        ],
        default='public'
    )
    allow_followers = models.BooleanField(default=True)
    allow_messages = models.BooleanField(default=True)
    show_online_status = models.BooleanField(default=True)
    show_last_seen = models.BooleanField(default=True)
    allow_tagging = models.BooleanField(default=True)
    
    # Notification settings
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    notify_on_mention = models.BooleanField(default=True)
    notify_on_follow = models.BooleanField(default=True)
    notify_on_like = models.BooleanField(default=True)
    notify_on_comment = models.BooleanField(default=True)
    
    # Social media links
    website = models.URLField(blank=True, null=True)
    twitter_handle = models.CharField(max_length=50, blank=True, null=True)
    github_handle = models.CharField(max_length=50, blank=True, null=True)
    linkedin_handle = models.CharField(max_length=50, blank=True, null=True)
    instagram_handle = models.CharField(max_length=50, blank=True, null=True)
    facebook_handle = models.CharField(max_length=50, blank=True, null=True)
    youtube_handle = models.CharField(max_length=50, blank=True, null=True)
    tiktok_handle = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"Profile for {self.user.username}"


class UserSession(models.Model):
    """
    Track user sessions and login history
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'user_sessions'
    
    def __str__(self):
        return f"Session for {self.user.username}"


class EmailVerification(models.Model):
    """
    Email verification tokens
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verifications')
    token = models.CharField(max_length=100, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'email_verifications'
    
    def __str__(self):
        return f"Email verification for {self.user.email}"


class PasswordReset(models.Model):
    """
    Password reset tokens
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_resets')
    token = models.CharField(max_length=100, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'password_resets'
    
    def __str__(self):
        return f"Password reset for {self.user.email}"
