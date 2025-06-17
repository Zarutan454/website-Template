from rest_framework import serializers
from bsn_social_network.models import (
    User, ProfileSettings, Friendship, Group, GroupMembership,
    Post, Comment, Like, Story, Notification, Message,
    Achievement, UserAchievement, Invite, Wallet, TokenTransaction,
    MiningProgress, NFT, UserSettings, NotificationSettings, DAO,
    DAOMembership, Proposal, Vote
)

# User Serializers
class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    
    def get_avatar_url(self, obj):
        # Temporäre Lösung: Gravatar-ähnliche URL basierend auf der Benutzer-ID
        return f"https://i.pravatar.cc/150?u={obj.id}"
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'wallet_address', 'avatar_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProfileSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileSettings
        fields = ['user', 'is_public', 'notification_preferences', 'language']
        read_only_fields = ['user']

class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ['id', 'requester', 'receiver', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

# Group Serializers
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'creator', 'privacy', 'created_at', 'updated_at']
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']

class GroupMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembership
        fields = ['id', 'group', 'user', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']

# Content Serializers
class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    class Meta:
        model = Post
        fields = [
            'id', 'author', 'group', 'content', 'media_url', 
            'likes_count', 'comments_count', 'is_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'likes_count', 'comments_count', 'is_liked', 'created_at', 'updated_at']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'likes_count', 'is_liked', 'created_at']
        read_only_fields = ['id', 'author', 'likes_count', 'is_liked', 'created_at']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class StorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = ['id', 'author', 'media_url', 'expires_at', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']

# Notification Serializers
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'type', 'reference_id', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

# Message Serializers
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'group', 'content', 'media_url', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']

# Achievement Serializers
class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'criteria', 'reward']
        read_only_fields = ['id']

class UserAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAchievement
        fields = ['id', 'user', 'achievement', 'unlocked_at']
        read_only_fields = ['id', 'user', 'unlocked_at']

# Invite Serializers
class InviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invite
        fields = ['id', 'code', 'inviter', 'invitee_email', 'is_used', 'created_at', 'used_at']
        read_only_fields = ['id', 'code', 'inviter', 'created_at']

# Wallet Serializers
class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'user', 'balance', 'address', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'balance', 'created_at', 'updated_at']

class TokenTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenTransaction
        fields = [
            'id', 'transaction_hash', 'from_wallet', 'to_wallet', 
            'amount', 'transaction_type', 'status', 'metadata', 
            'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'transaction_hash', 'created_at']

# Mining Serializers
class MiningProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiningProgress
        fields = [
            'id', 'user', 'mining_power', 'last_claim_time', 
            'accumulated_tokens', 'total_mined', 'streak_days', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

# NFT Serializers
class NFTSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFT
        fields = [
            'id', 'token_id', 'name', 'description', 'owner', 'creator',
            'nft_type', 'media_url', 'metadata', 'rarity', 'is_locked',
            'transaction_hash', 'created_at'
        ]
        read_only_fields = ['id', 'token_id', 'creator', 'created_at']

# Settings Serializers
class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            'user', 'theme', 'email_notifications', 'push_notifications',
            'privacy_settings', 'two_factor_auth_enabled', 'auto_staking', 'updated_at'
        ]
        read_only_fields = ['user', 'updated_at']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'user', 'likes', 'comments', 'friend_requests', 'messages',
            'group_invites', 'system_notifications', 'token_transactions',
            'mining_rewards', 'governance_alerts', 'updated_at'
        ]
        read_only_fields = ['user', 'updated_at']

# DAO Serializers
class DAOSerializer(serializers.ModelSerializer):
    class Meta:
        model = DAO
        fields = [
            'id', 'name', 'description', 'creator', 'governance_token',
            'status', 'rules', 'logo_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']

class DAOMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = DAOMembership
        fields = ['id', 'dao', 'user', 'role', 'voting_power', 'joined_at']
        read_only_fields = ['id', 'joined_at']

class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            'id', 'dao', 'creator', 'title', 'description', 'start_date',
            'end_date', 'status', 'execution_script', 'quorum', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'proposal', 'voter', 'vote', 'voting_power', 'reason', 'created_at']
        read_only_fields = ['id', 'voter', 'created_at'] 