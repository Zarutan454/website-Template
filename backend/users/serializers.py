from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, UserSession, EmailVerification, PasswordReset

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    full_name = serializers.SerializerMethodField()
    # avatar_url und cover_url direkt aus dem Modell serialisieren
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'wallet_address', 'created_at', 'updated_at', 'last_login',
            'is_alpha_user', 'alpha_access_granted_at', 'alpha_access_reason',
            'referral_count_for_alpha', 'ico_investment_amount', 'influencer_category',
            'follower_count', 'social_media_links', 'avatar_url', 'cover_url'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login', 'full_name', 'avatar_url', 'cover_url']
    
    def get_full_name(self, obj):
        """Get the full name of the user."""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'occupation', 'company', 'interests', 'skills',
            'profile_visibility', 'push_notifications', 'sms_notifications',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login - accepts both username and email
    """
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        email = attrs.get('email')
        
        if not username and not email:
            raise serializers.ValidationError("Either username or email is required")
        
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs


class EmailVerificationSerializer(serializers.ModelSerializer):
    """
    Serializer for email verification
    """
    class Meta:
        model = EmailVerification
        fields = ['token']


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request
    """
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation
    """
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs


class UserSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for user sessions
    """
    class Meta:
        model = UserSession
        fields = [
            'id', 'session_key', 'ip_address', 'user_agent',
            'is_active', 'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'session_key', 'ip_address', 'user_agent', 'created_at', 'expires_at'] 