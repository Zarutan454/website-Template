import logging
logger = logging.getLogger(__name__)

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import *
from .models import PhotoAlbum, Photo
from .models import PostPoll

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
        read_only_fields = ('id', 'is_alpha_user', 'created_at')
    
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

class StoryPollSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryPoll
        fields = ['id', 'question', 'options', 'votes']

class PostPollSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostPoll
        fields = ['id', 'question', 'options', 'votes', 'expires_at']

class PostSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    shares_count = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    is_bookmarked_by_user = serializers.SerializerMethodField()
    privacy = serializers.ChoiceField(choices=Post.PRIVACY_CHOICES, default='public')
    author_role = serializers.SerializerMethodField()
    poll = PostPollSerializer(read_only=True)
    
    class Meta:
        model = Post
        fields = (
            'id', 'author', 'group', 'content', 'media_url', 'media_type', 'privacy', 'hashtags',
            'likes_count', 'comments_count', 'shares_count', 'is_liked_by_user', 
            'is_bookmarked_by_user', 'author_role', 'created_at', 'updated_at', 'poll'
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
    
    def get_author_role(self, obj):
        """Get the role of the post author in the group"""
        if not obj.group:
            return None
        
        try:
            membership = GroupMembership.objects.get(group=obj.group, user=obj.author)
            return membership.role
        except GroupMembership.DoesNotExist:
            return None

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
    is_admin = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    pinned_post = PostSerializer(read_only=True)
    token_gated = serializers.BooleanField(default=False)
    required_token_contract = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def get_is_admin(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        membership = obj.memberships.filter(user=request.user).first()
        return membership and membership.role == 'admin'

    def get_role(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        membership = obj.memberships.filter(user=request.user).first()
        return membership.role if membership else None

    def to_internal_value(self, data):
        import logging
        logger = logging.getLogger('django')
        logger.error('GroupSerializer.to_internal_value: raw data = %s', dict(data))
        logger.error('GroupSerializer.to_internal_value: token_gated in data = %s', data.get('token_gated', 'NOT FOUND'))
        result = super().to_internal_value(data)
        logger.error('GroupSerializer.to_internal_value: validated result = %s', result)
        return result

    def validate_token_gated(self, value):
        import logging
        logger = logging.getLogger('django')
        logger.error('GroupSerializer.validate_token_gated: input value = %s (type: %s)', value, type(value))
        
        # Akzeptiere 'true'/'false' (String) und echte Booleans
        if isinstance(value, bool):
            logger.error('GroupSerializer.validate_token_gated: returning bool = %s', value)
            return value
        if isinstance(value, str):
            if value.lower() == 'true':
                logger.error('GroupSerializer.validate_token_gated: converting "true" to True')
                return True
            elif value.lower() == 'false':
                logger.error('GroupSerializer.validate_token_gated: converting "false" to False')
                return False
        logger.error('GroupSerializer.validate_token_gated: using default False')
        return False
    
    class Meta:
        model = Group
        fields = (
            'id', 'name', 'description', 'creator', 'privacy',
            'avatar_url', 'banner_url', 'tags', 'type', 'join_questions',
            'guidelines', 'pinned_post', 'post_approval', 'report_count',
            'ai_summary', 'ai_recommendations',
            'created_at', 'updated_at',
            'token_gated', 'required_token_contract',
            'member_count', 'posts_count', 'is_member', 'is_admin', 'role',
        )
        read_only_fields = (
            'id', 'creator', 'created_at', 'member_count', 'posts_count', 'is_member',
            'is_admin', 'role', 'pinned_post', 'report_count', 'ai_summary', 'ai_recommendations'
        )

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
    user = UserProfileSerializer(read_only=True)
    class Meta:
        model = StoryView
        fields = ['user', 'viewed_at']

class StoryHighlightSerializer(serializers.ModelSerializer):
    stories = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = StoryHighlight
        fields = ['id', 'title', 'stories', 'created_at']

class StorySerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    is_viewed = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    stickers = serializers.SerializerMethodField()
    music = serializers.SerializerMethodField()
    poll = serializers.SerializerMethodField()
    viewers = serializers.SerializerMethodField()
    highlights = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = (
            'id', 'author', 'media_url', 'type', 'caption', 'created_at', 'expires_at',
            'privacy', 'tags', 'location', 'is_highlight', 'ai_data',
            'music', 'poll', 'stickers', 'reactions', 'replies', 'viewers', 'views_count', 'is_viewed', 'highlights'
        )
        read_only_fields = ('id', 'author', 'created_at', 'expires_at', 'is_viewed', 'views_count', 'highlights')

    def get_views_count(self, obj):
        return obj.views.count()

    def get_is_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.views.filter(user=request.user).exists()
        return False

    def get_reactions(self, obj):
        from .serializers import StoryReactionSerializer
        return StoryReactionSerializer(obj.reactions.all(), many=True, context=self.context).data

    def get_replies(self, obj):
        from .serializers import StoryReplySerializer
        return StoryReplySerializer(obj.replies.all(), many=True, context=self.context).data

    def get_stickers(self, obj):
        from .serializers import StoryStickerSerializer
        return StoryStickerSerializer(obj.stickers.all(), many=True, context=self.context).data

    def get_music(self, obj):
        from .serializers import StoryMusicSerializer
        if hasattr(obj, 'music') and obj.music:
            return StoryMusicSerializer(obj.music, context=self.context).data
        return None

    def get_poll(self, obj):
        from .serializers import StoryPollSerializer
        if hasattr(obj, 'poll') and obj.poll:
            return StoryPollSerializer(obj.poll, context=self.context).data
        return None

    def get_viewers(self, obj):
        from .serializers import StoryViewSerializer
        return StoryViewSerializer(obj.views.all(), many=True, context=self.context).data

    def get_highlights(self, obj):
        from .serializers import StoryHighlightSerializer
        return StoryHighlightSerializer(obj.highlights.all(), many=True, context=self.context).data

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    progress = serializers.SerializerMethodField()
    max_progress = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    token_reward = serializers.SerializerMethodField()
    points_reward = serializers.SerializerMethodField()
    
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
    
    def get_progress(self, obj):
        """Calculate progress - if unlocked, 100%, otherwise 0%"""
        return 100 if obj.unlocked_at else 0
    
    def get_max_progress(self, obj):
        """Max progress is always 100%"""
        return 100
    
    def get_is_completed(self, obj):
        """Achievement is completed if it has been unlocked"""
        return bool(obj.unlocked_at)
    
    def get_token_reward(self, obj):
        """Get token reward from related achievement"""
        return getattr(obj.achievement, 'reward', 0) if obj.achievement else 0
    
    def get_points_reward(self, obj):
        """Get points reward from related achievement (if field exists)"""
        return getattr(obj.achievement, 'points', 0) if obj.achievement else 0

class StoryGroupSerializer(serializers.Serializer):
    """
    Serializer for grouping stories by user
    """
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    display_name = serializers.CharField()
    avatar_url = serializers.CharField()
    stories = StorySerializer(many=True)
    hasUnviewed = serializers.BooleanField()

    def to_representation(self, instance):
        # Ensure we have a proper user_id field
        if 'user_id' not in instance:
            instance['user_id'] = instance.get('author_id', instance.get('user_id'))
        return super().to_representation(instance)

# ========== Story Interactions ==========

# Entferne StoryLikeSerializer, StoryCommentSerializer, StoryShareSerializer, StoryBookmarkSerializer
# da diese Models nicht existieren

class StoryInteractionSerializer(serializers.ModelSerializer):
    """
    Enhanced Story Serializer with interaction counts and user status
    """
    author = UserProfileSerializer(read_only=True)
    is_viewed = serializers.SerializerMethodField()
    viewed = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()
    type = serializers.CharField(source='story_type')  # Frontend compatibility
    
    class Meta:
        model = Story
        fields = (
            'id', 'author', 'media_url', 'caption', 'type', 'expires_at', 'created_at',
            'is_viewed', 'viewed', 'views_count'
        )
        read_only_fields = (
            'id', 'author', 'created_at', 'expires_at', 'is_viewed', 'viewed', 'views_count'
        )
    
    def get_views_count(self, obj):
        return obj.views.count()
    
    def get_is_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.views.filter(user=request.user).exists()
        return False
    
    def get_viewed(self, obj):
        return self.get_is_viewed(obj)

class FollowRelationshipSerializer(serializers.ModelSerializer):
    """
    Serializer for Follow/Unfollow operations
    """
    user = UserProfileSerializer(read_only=True)
    friend = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = FollowRelationship
        fields = ('id', 'user', 'friend', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class FollowRequestSerializer(serializers.Serializer):
    """
    Serializer for follow requests
    """
    user_id = serializers.IntegerField(help_text="ID of the user to follow")
    
    def validate_user_id(self, value):
        """
        Validate that the user_id exists and is not the current user
        """
        try:
            user = User.objects.get(id=value)
            if user == self.context['request'].user:
                raise serializers.ValidationError("You cannot follow yourself")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found") 

class HashtagSerializer(serializers.ModelSerializer):
    """Serializer for hashtags"""
    posts_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Hashtag
        fields = ['id', 'name', 'description', 'posts_count', 'created_at']
        read_only_fields = ['posts_count', 'created_at']

class PostHashtagSerializer(serializers.ModelSerializer):
    """Serializer for post-hashtag relationships"""
    hashtag = HashtagSerializer(read_only=True)
    
    class Meta:
        model = PostHashtag
        fields = ['id', 'hashtag', 'created_at']
        read_only_fields = ['created_at'] 

# ========== Token Management Serializers ==========

class StakingSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Staking
        fields = (
            'id', 'user', 'amount', 'status', 'staking_period', 'apy_rate',
            'rewards_earned', 'start_date', 'end_date', 'last_reward_claim'
        )
        read_only_fields = ('id', 'user', 'start_date', 'last_reward_claim')

class TokenStreamingSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    receiver = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = TokenStreaming
        fields = (
            'id', 'sender', 'receiver', 'total_amount', 'amount_per_second',
            'streamed_amount', 'status', 'start_time', 'end_time', 'last_update_time'
        )
        read_only_fields = ('id', 'sender', 'receiver', 'start_time', 'last_update_time')

class SmartContractSerializer(serializers.ModelSerializer):
    creator = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = SmartContract
        fields = (
            'id', 'name', 'contract_type', 'address', 'network', 'abi',
            'bytecode', 'source_code', 'creator', 'transaction_hash', 'deployed_at'
        )
        read_only_fields = ('id', 'creator', 'deployed_at') 

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__' 

class PhotoSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = (
            'id', 'album', 'user', 'image', 'image_url', 'caption', 'created_at', 'updated_at', 'is_deleted'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'is_deleted', 'image_url')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            url = obj.image.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

class PhotoAlbumSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    photos = PhotoSerializer(many=True, read_only=True)

    class Meta:
        model = PhotoAlbum
        fields = (
            'id', 'user', 'name', 'description', 'privacy', 'created_at', 'updated_at', 'photos'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'photos')

    def validate_name(self, value):
        # Name muss pro User eindeutig sein
        user = self.context['request'].user
        if PhotoAlbum.objects.filter(user=user, name=value).exists():
            raise serializers.ValidationError('Du hast bereits ein Album mit diesem Namen.')
        return value 

class StoryStickerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorySticker
        fields = ['id', 'sticker_url', 'x', 'y', 'scale', 'rotation']

class StoryMusicSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryMusic
        fields = ['id', 'title', 'artist', 'url', 'start_time']

class StoryPollSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryPoll
        fields = ['id', 'question', 'options', 'votes']

class PostPollSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostPoll
        fields = ['id', 'question', 'options', 'votes', 'expires_at']

class StoryReactionSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    class Meta:
        model = StoryReaction
        fields = ['id', 'user', 'reaction_type', 'value', 'created_at'] 

class StoryReplySerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    class Meta:
        model = StoryReply
        fields = ['id', 'user', 'content', 'created_at'] 

class GroupEventSerializer(serializers.ModelSerializer):
    created_by = UserProfileSerializer(read_only=True)
    rsvp_status = serializers.SerializerMethodField()

    def get_rsvp_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        rsvp = obj.rsvps.filter(user=request.user).first()
        return rsvp.status if rsvp else None

    class Meta:
        model = GroupEvent
        fields = (
            'id', 'group', 'title', 'description', 'start_time', 'end_time',
            'location', 'cover_image_url', 'created_by', 'created_at', 'updated_at', 'rsvp_status'
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at', 'rsvp_status') 

class GroupEventRSVPSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    class Meta:
        model = GroupEventRSVP
        fields = ('id', 'event', 'user', 'status', 'responded_at')
        read_only_fields = ('id', 'user', 'responded_at') 

class ContentReportSerializer(serializers.ModelSerializer):
    reporter = UserProfileSerializer(read_only=True)
    assigned_moderator = UserProfileSerializer(read_only=True)
    class Meta:
        model = ContentReport
        fields = (
            'id', 'reporter', 'content_type', 'content_id', 'report_type', 'reason', 'evidence',
            'status', 'assigned_moderator', 'moderator_notes', 'resolution_action',
            'created_at', 'updated_at', 'resolved_at'
        )
        read_only_fields = ('id', 'reporter', 'assigned_moderator', 'created_at', 'updated_at', 'resolved_at') 

class GroupMembershipSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    is_online = serializers.SerializerMethodField()

    def get_is_online(self, obj):
        from django.utils import timezone
        if not obj.user.last_login:
            return False
        # Online, wenn innerhalb der letzten 15 Minuten aktiv
        return (timezone.now() - obj.user.last_login).total_seconds() < 900  # 15 Minuten

    class Meta:
        model = GroupMembership
        fields = ('id', 'user', 'role', 'joined_at', 'is_online') 