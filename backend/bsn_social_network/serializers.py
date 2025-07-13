import logging
logger = logging.getLogger(__name__)

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from urllib.parse import urlparse
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

class UserProfileAboutSerializer(serializers.ModelSerializer):
    """
    Dedicated serializer for user profile about section with enhanced validation
    """
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    occupation = serializers.CharField(max_length=100, required=False, allow_blank=True)
    company = serializers.CharField(max_length=100, required=False, allow_blank=True)
    interests = serializers.ListField(
        child=serializers.CharField(max_length=50),
        max_length=10,
        required=False,
        allow_empty=True
    )
    skills = serializers.ListField(
        child=serializers.CharField(max_length=50),
        max_length=15,
        required=False,
        allow_empty=True
    )
    social_media_links = serializers.JSONField(required=False, allow_null=True)
    
    # Allowed social media platforms
    ALLOWED_PLATFORMS = [
        'website', 'twitter', 'github', 'linkedin', 'facebook', 'instagram'
    ]
    
    class Meta:
        model = User
        fields = ('bio', 'occupation', 'company', 'interests', 'skills', 'social_media_links')
    
    def validate_bio(self, value):
        """Validate bio field"""
        if value and len(value.strip()) > 500:
            raise serializers.ValidationError("Bio darf maximal 500 Zeichen lang sein.")
        return value.strip() if value else ""
    
    def validate_occupation(self, value):
        """Validate occupation field"""
        if value and len(value.strip()) > 100:
            raise serializers.ValidationError("Beruf darf maximal 100 Zeichen lang sein.")
        return value.strip() if value else ""
    
    def validate_company(self, value):
        """Validate company field"""
        if value and len(value.strip()) > 100:
            raise serializers.ValidationError("Firma darf maximal 100 Zeichen lang sein.")
        return value.strip() if value else ""
    
    def validate_interests(self, value):
        """Validate interests list"""
        if not value:
            return []
        
        if len(value) > 10:
            raise serializers.ValidationError("Maximal 10 Interessen erlaubt.")
        
        # Clean and validate each interest
        cleaned_interests = []
        for interest in value:
            if not isinstance(interest, str):
                raise serializers.ValidationError("Interessen müssen Textfelder sein.")
            
            cleaned = interest.strip()
            if cleaned:
                if len(cleaned) > 50:
                    raise serializers.ValidationError("Jedes Interesse darf maximal 50 Zeichen lang sein.")
                cleaned_interests.append(cleaned)
        
        return cleaned_interests
    
    def validate_skills(self, value):
        """Validate skills list"""
        if not value:
            return []
        
        if len(value) > 15:
            raise serializers.ValidationError("Maximal 15 Skills erlaubt.")
        
        # Clean and validate each skill
        cleaned_skills = []
        for skill in value:
            if not isinstance(skill, str):
                raise serializers.ValidationError("Skills müssen Textfelder sein.")
            
            cleaned = skill.strip()
            if cleaned:
                if len(cleaned) > 50:
                    raise serializers.ValidationError("Jeder Skill darf maximal 50 Zeichen lang sein.")
                cleaned_skills.append(cleaned)
        
        return cleaned_skills
    
    def validate_social_media_links(self, value):
        """Validate social media links"""
        if not value:
            return {}
        
        if not isinstance(value, dict):
            raise serializers.ValidationError("Social Media Links müssen ein Objekt sein.")
        
        validated_links = {}
        url_validator = URLValidator()
        
        for platform, url in value.items():
            # Check if platform is allowed
            if platform not in self.ALLOWED_PLATFORMS:
                raise serializers.ValidationError(
                    f"Plattform '{platform}' ist nicht erlaubt. "
                    f"Erlaubte Plattformen: {', '.join(self.ALLOWED_PLATFORMS)}"
                )
            
            # Skip empty URLs
            if not url or not url.strip():
                continue
            
            url = url.strip()
            
            # Validate URL format
            try:
                url_validator(url)
            except ValidationError:
                raise serializers.ValidationError(
                    f"Ungültige URL für {platform}: {url}. "
                    f"URL muss mit http:// oder https:// beginnen."
                )
            
            # Additional platform-specific validation
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower()
            
            # Platform-specific domain validation (optional, can be extended)
            platform_domains = {
                'twitter': ['twitter.com', 'x.com'],
                'github': ['github.com'],
                'linkedin': ['linkedin.com'],
                'facebook': ['facebook.com', 'fb.com'],
                'instagram': ['instagram.com'],
            }
            
            if platform in platform_domains:
                valid_domains = platform_domains[platform]
                if not any(domain.endswith(d) for d in valid_domains):
                    logger.warning(
                        f"Domain mismatch for {platform}: {domain} "
                        f"(expected: {valid_domains})"
                    )
                    # Don't raise error, just log warning for flexibility
            
            validated_links[platform] = url
        
        return validated_links
    
    def update(self, instance, validated_data):
        """Update user profile about fields"""
        # Handle UserProfile fields
        profile, created = UserProfile.objects.get_or_create(user=instance)
        
        # Update UserProfile fields
        if 'bio' in validated_data:
            profile.bio = validated_data['bio']
        if 'occupation' in validated_data:
            profile.occupation = validated_data['occupation']
        if 'company' in validated_data:
            profile.company = validated_data['company']
        if 'interests' in validated_data:
            profile.interests = validated_data['interests']
        if 'skills' in validated_data:
            profile.skills = validated_data['skills']
        
        profile.save()
        
        # Update User fields
        if 'social_media_links' in validated_data:
            instance.social_media_links = validated_data['social_media_links']
        
        instance.save()
        return instance

class UserSocialLinksSerializer(serializers.ModelSerializer):
    """
    Dedicated serializer for user social media links with enhanced validation
    """
    social_media_links = serializers.JSONField(required=False, allow_null=True)
    
    # Allowed social media platforms
    ALLOWED_PLATFORMS = [
        'website', 'twitter', 'github', 'linkedin', 'facebook', 'instagram'
    ]
    
    class Meta:
        model = User
        fields = ('social_media_links',)
    
    def validate_social_media_links(self, value):
        """Validate social media links with enhanced checks"""
        if not value:
            return {}
        
        if not isinstance(value, dict):
            raise serializers.ValidationError("Social Media Links müssen ein Objekt sein.")
        
        validated_links = {}
        url_validator = URLValidator()
        
        for platform, url in value.items():
            # Check if platform is allowed
            if platform not in self.ALLOWED_PLATFORMS:
                raise serializers.ValidationError(
                    f"Plattform '{platform}' ist nicht erlaubt. "
                    f"Erlaubte Plattformen: {', '.join(self.ALLOWED_PLATFORMS)}"
                )
            
            # Skip empty URLs
            if not url or not url.strip():
                continue
            
            url = url.strip()
            
            # Validate URL format
            try:
                url_validator(url)
            except ValidationError:
                raise serializers.ValidationError(
                    f"Ungültige URL für {platform}: {url}. "
                    f"URL muss mit http:// oder https:// beginnen."
                )
            
            # Additional platform-specific validation
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower()
            
            # Platform-specific domain validation with stricter checks
            platform_domains = {
                'twitter': ['twitter.com', 'x.com'],
                'github': ['github.com'],
                'linkedin': ['linkedin.com'],
                'facebook': ['facebook.com', 'fb.com'],
                'instagram': ['instagram.com'],
            }
            
            if platform in platform_domains:
                valid_domains = platform_domains[platform]
                if not any(domain.endswith(d) for d in valid_domains):
                    raise serializers.ValidationError(
                        f"Ungültige Domain für {platform}: {domain}. "
                        f"Erlaubte Domains: {', '.join(valid_domains)}"
                    )
            
            # Check for suspicious patterns
            if len(url) > 500:
                raise serializers.ValidationError(
                    f"URL für {platform} ist zu lang (max. 500 Zeichen)."
                )
            
            validated_links[platform] = url
        
        return validated_links
    
    def update(self, instance, validated_data):
        """Update user social media links"""
        if 'social_media_links' in validated_data:
            instance.social_media_links = validated_data['social_media_links']
            instance.save()
        return instance
    
    def to_representation(self, instance):
        """Custom representation with additional metadata"""
        data = super().to_representation(instance)
        
        # Add metadata about social links
        social_links = data.get('social_media_links', {})
        data['social_links_count'] = len([url for url in social_links.values() if url])
        data['available_platforms'] = self.ALLOWED_PLATFORMS
        
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    alpha_access_status = serializers.SerializerMethodField()
    wallet_balance = serializers.SerializerMethodField()
    mining_stats = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    profile_complete = serializers.SerializerMethodField()
    # Neue Felder aus UserProfile
    occupation = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    social_media_links = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'display_name',
            'wallet_address', 'is_alpha_user', 'alpha_access_status',
            'influencer_category', 'follower_count', 'social_media_links',
            'wallet_balance', 'mining_stats', 'created_at',
            'avatar_url', 'cover_url', 'is_verified', 'profile_complete',
            # UserProfile-Felder:
            'occupation', 'company', 'interests', 'skills', 'bio'
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

    def get_occupation(self, obj):
        try:
            return obj.profile.occupation or ''
        except Exception:
            return ''
    def get_company(self, obj):
        try:
            return obj.profile.company or ''
        except Exception:
            return ''
    def get_interests(self, obj):
        try:
            return obj.profile.interests or []
        except Exception:
            return []
    def get_skills(self, obj):
        try:
            return obj.profile.skills or []
        except Exception:
            return []
    def get_bio(self, obj):
        try:
            return obj.profile.bio or ''
        except Exception:
            return ''

    def get_social_media_links(self, obj):
        try:
            return obj.social_media_links or {}
        except Exception:
            return {}

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
            'transaction_hash', 'created_at', 'views', 'likes'
        )
        read_only_fields = ('id', 'token_id', 'owner', 'creator', 'created_at', 'views', 'likes')

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
    viewed = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()
    expires_at = serializers.DateTimeField(read_only=True)
    
    # Frontend compatibility: 'type' for both input and output
    type = serializers.CharField(source='story_type')  # Maps to story_type field in model

    class Meta:
        model = Story
        fields = (
            'id', 'author', 'media_url', 'caption', 
            'type',  # For both input and output
            'expires_at', 'created_at', 'is_viewed', 'viewed', 'views_count'
        )
        read_only_fields = ('id', 'author', 'created_at', 'expires_at', 'is_viewed', 'viewed', 'views_count')

    def validate_type(self, value):
        """Validate the story type"""
        valid_types = ['image', 'video', 'text']
        if value not in valid_types:
            raise serializers.ValidationError(f'Invalid type. Must be one of: {valid_types}')
        return value

    def get_views_count(self, obj):
        return obj.views.count()

    def get_is_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StoryView.objects.filter(story=obj, user=request.user).exists()
        return False

    def get_viewed(self, obj):
        return self.get_is_viewed(obj)

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

class StoryLikeSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = StoryLike
        fields = ('id', 'story', 'user', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class StoryCommentSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = StoryComment
        fields = ('id', 'story', 'author', 'content', 'like_count', 'is_liked_by_user', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')
    
    def get_like_count(self, obj):
        return obj.likes.count()
    
    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

class StoryShareSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    shared_with = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = StoryShare
        fields = ('id', 'story', 'user', 'share_type', 'shared_with', 'external_platform', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class StoryBookmarkSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = StoryBookmark
        fields = ('id', 'story', 'user', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class StoryInteractionSerializer(serializers.ModelSerializer):
    """
    Enhanced Story Serializer with interaction counts and user status
    """
    author = UserProfileSerializer(read_only=True)
    is_viewed = serializers.SerializerMethodField()
    viewed = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    shares_count = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    is_bookmarked_by_user = serializers.SerializerMethodField()
    type = serializers.CharField(source='story_type')  # Frontend compatibility
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Story
        fields = (
            'id', 'author', 'media_url', 'caption', 'type', 'expires_at', 'created_at',
            'is_viewed', 'viewed', 'views_count', 'likes_count', 'comments_count',
            'shares_count', 'is_liked_by_user', 'is_bookmarked_by_user', 'comments'
        )
        read_only_fields = (
            'id', 'author', 'created_at', 'is_viewed', 'viewed', 'views_count',
            'likes_count', 'comments_count', 'shares_count', 'is_liked_by_user', 'is_bookmarked_by_user', 'comments'
        )
    
    def get_views_count(self, obj):
        return obj.views.count()
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_shares_count(self, obj):
        return obj.shares.count()
    
    def get_is_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.views.filter(user=request.user).exists()
        return False
    
    def get_viewed(self, obj):
        return self.get_is_viewed(obj)
    
    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_is_bookmarked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarks.filter(user=request.user).exists()
        return False

    def get_comments(self, obj):
        comments = obj.comments.select_related('author').all().order_by('created_at')
        return StoryCommentSerializer(comments, many=True, context=self.context).data

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