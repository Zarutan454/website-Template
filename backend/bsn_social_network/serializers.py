import logging
logger = logging.getLogger(__name__)

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import *

# ========== Authentication & User Management ==========

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm', 'wallet_address'
        )
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create related objects
        Wallet.objects.create(user=user)
        UserSettings.objects.create(user=user)
        NotificationSettings.objects.create(user=user)
        MiningProgress.objects.create(user=user)
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=False)  # Frontend sendet 'email'
    username = serializers.CharField(required=False)  # Alternative für Username
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        username = attrs.get('username')
        password = attrs.get('password')
        logger = logging.getLogger('django')
        
        # Verwende email oder username
        email_or_username = email or username
        
        if email_or_username and password:
            user = None
            # Versuche zuerst als Email
            try:
                user = User.objects.get(email=email_or_username)
                username_for_auth = user.username
            except User.DoesNotExist:
                # Versuche als Username
                try:
                    user = User.objects.get(username=email_or_username)
                    username_for_auth = user.username
                except User.DoesNotExist:
                    logger.warning(f'Login failed: User {email_or_username} not found')
                    raise serializers.ValidationError({'detail': 'Benutzer nicht gefunden'})
            
            # Authenticate
            user = authenticate(username=username_for_auth, password=password)
            if not user:
                logger.warning(f'Login failed: Invalid password for user {email_or_username}')
                raise serializers.ValidationError({'detail': 'Falsches Passwort'})
            if not user.is_active:
                logger.warning(f'Login failed: User {email_or_username} is inactive')
                raise serializers.ValidationError({'detail': 'Benutzerkonto ist deaktiviert'})
            attrs['user'] = user
            return attrs
        
        logger.warning('Login failed: Email/Username oder Passwort fehlt')
        raise serializers.ValidationError({'detail': 'Bitte Email/Username und Passwort angeben'})

class UserProfileSerializer(serializers.ModelSerializer):
    alpha_access_status = serializers.SerializerMethodField()
    wallet_balance = serializers.SerializerMethodField()
    mining_stats = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    profile_complete = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'display_name',
            'wallet_address', 'is_alpha_user', 'alpha_access_status',
            'influencer_category', 'follower_count', 'social_media_links',
            'wallet_balance', 'mining_stats', 'created_at',
            'avatar_url', 'cover_url', 'is_verified', 'profile_complete'
        )
        read_only_fields = ('id', 'is_alpha_user', 'created_at', 'avatar_url', 'cover_url')
    
    def get_display_name(self, obj):
        """Get display name from first_name + last_name or fallback to username"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        elif obj.last_name:
            return obj.last_name
        else:
            return obj.username
    
    def get_is_verified(self, obj):
        """Frontend erwartet is_verified Feld"""
        return obj.is_active  # Verwende is_active als is_verified
    
    def get_profile_complete(self, obj):
        """Frontend erwartet profile_complete Feld"""
        return bool(obj.first_name and obj.last_name)  # Profil ist vollständig wenn Name vorhanden
    
    def get_alpha_access_status(self, obj):
        return {
            'has_access': obj.can_access_alpha(),
            'granted_at': obj.alpha_access_granted_at,
            'reason': obj.alpha_access_reason
        }
    
    def get_wallet_balance(self, obj):
        try:
            return str(obj.wallet.balance)
        except:
            return "0"
    
    def get_mining_stats(self, obj):
        try:
            mining = obj.mining_progress.first()
            return {
                'mining_power': str(mining.mining_power),
                'accumulated_tokens': str(mining.accumulated_tokens),
                'total_mined': str(mining.total_mined),
                'streak_days': mining.streak_days,
                'last_claim_time': mining.last_claim_time
            }
        except:
            return None

class AlphaAccessRequestSerializer(serializers.Serializer):
    reason = serializers.ChoiceField(choices=[
        ('referral', 'Referral Validation'),
        ('investment', 'ICO Investment'),
        ('influencer', 'Influencer Status')
    ])
    referral_count = serializers.IntegerField(required=False)
    investment_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    influencer_data = serializers.JSONField(required=False)

# ========== Social Network ==========

class PostSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    shares_count = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    is_bookmarked_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = (
            'id', 'author', 'group', 'content', 'media_url', 'media_type', 'hashtags',
            'likes_count', 'comments_count', 'shares_count', 'is_liked_by_user', 
            'is_bookmarked_by_user', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'author', 'shares_count', 'created_at', 'updated_at')
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_shares_count(self, obj):
        return obj.shares_count
    
    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_is_bookmarked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(user=request.user).exists()
        return False

class CommentSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = (
            'id', 'post', 'author', 'content', 'like_count', 
            'user_liked', 'created_at'
        )
        read_only_fields = ('id', 'author', 'post', 'created_at')
    
    def get_like_count(self, obj):
        return obj.likes.count()
    
    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

class GroupSerializer(serializers.ModelSerializer):
    creator = UserProfileSerializer(read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    posts_count = serializers.IntegerField(read_only=True)
    is_member = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Group
        fields = (
            'id', 'name', 'description', 'creator', 'privacy',
            'member_count', 'posts_count', 'is_member', 'created_at'
        )
        read_only_fields = ('id', 'creator', 'created_at', 'member_count', 'posts_count', 'is_member')

class FriendshipSerializer(serializers.ModelSerializer):
    requester = UserProfileSerializer(read_only=True)
    receiver = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Friendship
        fields = ('id', 'requester', 'receiver', 'status', 'created_at')
        read_only_fields = ('id', 'requester', 'created_at')

# ========== Token & Wallet ==========

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ('id', 'balance', 'address', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class TokenTransactionSerializer(serializers.ModelSerializer):
    from_user = serializers.SerializerMethodField()
    to_user = serializers.SerializerMethodField()
    
    class Meta:
        model = TokenTransaction
        fields = (
            'id', 'transaction_hash', 'from_user', 'to_user', 'amount',
            'transaction_type', 'status', 'metadata', 'created_at', 'completed_at'
        )
        read_only_fields = ('id', 'transaction_hash', 'created_at', 'completed_at')
    
    def get_from_user(self, obj):
        return obj.from_wallet.user.username if obj.from_wallet else None
    
    def get_to_user(self, obj):
        return obj.to_wallet.user.username if obj.to_wallet else None

class TokenTransferSerializer(serializers.Serializer):
    to_user = serializers.CharField()
    amount = serializers.DecimalField(max_digits=18, decimal_places=8)
    note = serializers.CharField(required=False, max_length=200)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value
    
    def validate_to_user(self, value):
        try:
            User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        return value

# ========== Mining ==========

class MiningProgressSerializer(serializers.ModelSerializer):
    claimable_tokens = serializers.SerializerMethodField()
    next_claim_time = serializers.SerializerMethodField()
    
    class Meta:
        model = MiningProgress
        fields = (
            'id', 'mining_power', 'last_claim_time', 'accumulated_tokens',
            'total_mined', 'streak_days', 'claimable_tokens', 'next_claim_time',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_claimable_tokens(self, obj):
        # Calculate claimable tokens based on time since last claim
        from django.utils import timezone
        import datetime
        
        now = timezone.now()
        time_diff = now - obj.last_claim_time
        hours_passed = time_diff.total_seconds() / 3600
        
        # Base mining rate: 1 token per hour * mining_power
        base_rate = float(obj.mining_power)
        claimable = min(hours_passed * base_rate, 24 * base_rate)  # Max 24 hours
        
        return str(claimable)
    
    def get_next_claim_time(self, obj):
        from django.utils import timezone
        import datetime
        
        return obj.last_claim_time + datetime.timedelta(hours=1)

class MiningClaimSerializer(serializers.Serializer):
    pass  # No input needed for claiming

# ========== DAO & Governance ==========

class DAOSerializer(serializers.ModelSerializer):
    creator = UserProfileSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    user_membership = serializers.SerializerMethodField()
    
    class Meta:
        model = DAO
        fields = (
            'id', 'name', 'description', 'creator', 'governance_token',
            'status', 'rules', 'logo_url', 'member_count', 'user_membership',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'creator', 'created_at', 'updated_at')
    
    def get_member_count(self, obj):
        return obj.memberships.count()
    
    def get_user_membership(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            if membership:
                return {
                    'role': membership.role,
                    'voting_power': str(membership.voting_power),
                    'joined_at': membership.joined_at
                }
        return None

class ProposalSerializer(serializers.ModelSerializer):
    creator = UserProfileSerializer(read_only=True)
    dao = DAOSerializer(read_only=True)
    vote_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    voting_results = serializers.SerializerMethodField()
    
    class Meta:
        model = Proposal
        fields = (
            'id', 'dao', 'creator', 'title', 'description', 'start_date',
            'end_date', 'status', 'quorum', 'vote_count', 'user_vote',
            'voting_results', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'creator', 'created_at', 'updated_at')
    
    def get_vote_count(self, obj):
        return obj.votes.count()
    
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.votes.filter(voter=request.user).first()
            return vote.vote if vote else None
        return None
    
    def get_voting_results(self, obj):
        votes = obj.votes.all()
        results = {'for': 0, 'against': 0, 'abstain': 0}
        total_power = 0
        
        for vote in votes:
            results[vote.vote] += float(vote.voting_power)
            total_power += float(vote.voting_power)
        
        return {
            'results': results,
            'total_voting_power': total_power,
            'quorum_reached': total_power >= obj.quorum
        }

class VoteSerializer(serializers.ModelSerializer):
    voter = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Vote
        fields = ('id', 'proposal', 'voter', 'vote', 'voting_power', 'reason', 'created_at')
        read_only_fields = ('id', 'voter', 'voting_power', 'created_at')

class CreateVoteSerializer(serializers.Serializer):
    vote = serializers.ChoiceField(choices=[('for', 'For'), ('against', 'Against'), ('abstain', 'Abstain')])
    reason = serializers.CharField(required=False, max_length=500)

# ========== ICO & Investment ==========

class ICOTokenReservationSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = ICOTokenReservation
        fields = (
            'id', 'user', 'amount_usd', 'tokens_reserved', 'payment_method',
            'payment_address', 'transaction_hash', 'status', 'payment_amount',
            'payment_currency', 'exchange_rate', 'expires_at', 'is_expired',
            'confirmed_at', 'completed_at', 'notes', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'user', 'payment_address', 'transaction_hash', 'confirmed_at',
            'completed_at', 'created_at', 'updated_at'
        )
    
    def get_is_expired(self, obj):
        return obj.is_expired()

class CreateICOReservationSerializer(serializers.Serializer):
    amount_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=[
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
    ])
    
    def validate_amount_usd(self, value):
        if value < 10:  # Minimum investment
            raise serializers.ValidationError("Minimum investment is $10")
        if value > 100000:  # Maximum investment
            raise serializers.ValidationError("Maximum investment is $100,000")
        return value

# ========== NFT ==========

class NFTSerializer(serializers.ModelSerializer):
    owner = UserProfileSerializer(read_only=True)
    creator = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = NFT
        fields = (
            'id', 'token_id', 'name', 'description', 'owner', 'creator',
            'nft_type', 'media_url', 'metadata', 'rarity', 'is_locked',
            'transaction_hash', 'created_at'
        )
        read_only_fields = ('id', 'token_id', 'owner', 'creator', 'created_at')

# ========== Notifications ==========

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'type', 'reference_id', 'is_read', 'created_at')
        read_only_fields = ('id', 'created_at')

# ========== Settings ==========

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = (
            'theme', 'email_notifications', 'push_notifications',
            'privacy_settings', 'two_factor_auth_enabled', 'auto_staking'
        )

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = (
            'likes', 'comments', 'friend_requests', 'messages',
            'group_invites', 'system_notifications', 'token_transactions',
            'mining_rewards', 'governance_alerts'
        )

# ========== Demo System ==========

class DemoTokenSerializer(serializers.ModelSerializer):
    influencer = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = DemoToken
        fields = (
            'id', 'influencer', 'token_name', 'token_symbol', 'total_supply',
            'demo_balance', 'token_color', 'token_logo_url', 'created_at'
        )
        read_only_fields = ('id', 'influencer', 'created_at')

class DemoTransactionSerializer(serializers.ModelSerializer):
    from_user = UserProfileSerializer(read_only=True)
    to_user = UserProfileSerializer(read_only=True)
    demo_token = DemoTokenSerializer(read_only=True)
    
    class Meta:
        model = DemoTransaction
        fields = ('id', 'demo_token', 'from_user', 'to_user', 'amount', 'created_at')
        read_only_fields = ('id', 'created_at')

class StoryViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryView
        fields = ['user', 'viewed_at']

class StorySerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    is_viewed = serializers.SerializerMethodField()
    viewed = serializers.SerializerMethodField()  # Frontend expects 'viewed' field
    views_count = serializers.SerializerMethodField()
    type = serializers.CharField(source='story_type')

    class Meta:
        model = Story
        fields = ('id', 'author', 'media_url', 'caption', 'type', 'expires_at', 'created_at', 'is_viewed', 'viewed', 'views_count')
        read_only_fields = ('id', 'author', 'created_at', 'is_viewed', 'viewed', 'views_count')

    def get_views_count(self, obj):
        return obj.views.count()

    def get_is_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StoryView.objects.filter(story=obj, user=request.user).exists()
        return False

    def get_viewed(self, obj):
        # Alias for is_viewed to match frontend expectations
        return self.get_is_viewed(obj)

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = [
            'id', 
            'achievement', 
            'unlocked_at', 
            'progress', 
            'max_progress', 
            'is_completed',
            'token_reward',
            'points_reward'
        ] 