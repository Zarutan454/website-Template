from django.db import models # type: ignore
from django.contrib.auth.models import AbstractUser # type: ignore
from django.core.exceptions import ValidationError # type: ignore
from django.db.models import CheckConstraint, Q, UniqueConstraint, F # type: ignore
from django.utils import timezone # type: ignore
import uuid
from django.conf import settings

def generate_transaction_hash():
    return str(uuid.uuid4())

class User(AbstractUser):
    '''
    Core user model for authentication and identification
    '''
    wallet_address = models.CharField(max_length=255, blank=True, null=True)
    
    # Profile images
    avatar_url = models.URLField(blank=True, null=True, help_text="URL to user's profile picture")
    cover_url = models.URLField(blank=True, null=True, help_text="URL to user's cover/banner image")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Alpha Access Fields
    is_alpha_user = models.BooleanField(default=False)
    alpha_access_granted_at = models.DateTimeField(null=True, blank=True)
    alpha_access_granted_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='alpha_access_granted'
    )
    alpha_access_reason = models.CharField(
        max_length=50,
        choices=[
            ('referral', 'Referral Validation'),
            ('investment', 'ICO Investment'),
            ('influencer', 'Influencer Status'),
            ('internal', 'Internal Team'),
            ('manual', 'Manual Grant')
        ],
        null=True, blank=True
    )
    
    # Referral Tracking für Alpha Access
    referral_count_for_alpha = models.IntegerField(default=0)
    referral_validation_date = models.DateTimeField(null=True, blank=True)
    
    # Investment Tracking für Alpha Access
    ico_investment_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0
    )
    investment_validation_date = models.DateTimeField(null=True, blank=True)
    
    # Influencer Information
    influencer_category = models.CharField(
        max_length=50,
        choices=[
            ('crypto_streamer', 'Crypto Streamer'),
            ('influencer', 'Influencer'),
            ('content_creator', 'Content Creator'),
            ('youtuber', 'YouTuber'),
            ('twitter_influencer', 'Twitter Influencer')
        ],
        null=True, blank=True
    )
    follower_count = models.IntegerField(default=0)
    social_media_links = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'user'
    
    @property
    def full_name(self):
        """Return the full name of the user."""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def can_access_alpha(self):
        """Check if user can access alpha platform."""
        return self.is_alpha_user and self.is_active
    
    def grant_alpha_access(self, reason, granted_by=None):
        """Grant alpha access to user."""
        self.is_alpha_user = True
        self.alpha_access_granted_at = timezone.now()
        self.alpha_access_granted_by = granted_by
        self.alpha_access_reason = reason
        self.save()
        
        # Send notification
        self.send_alpha_access_notification()
    
    def send_alpha_access_notification(self):
        """Send alpha access notification."""
        # Email notification
        # send_alpha_access_email.delay(self.id)
        
        # Telegram invitation
        # send_telegram_invitation.delay(self.id)
        pass

class ProfileSettings(models.Model):
    '''
    User profile settings and preferences
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='profile_settings')
    is_public = models.BooleanField(default=True)
    notification_preferences = models.JSONField(default=dict)
    language = models.CharField(max_length=10, default='en')
    
    class Meta:
        db_table = 'profile_settings'
        
class Friendship(models.Model):
    '''
    Represents friendship relationships between users
    '''
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_received')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'friendship'
        constraints = [
            UniqueConstraint(fields=['requester', 'receiver'], name='unique_friendship')
        ]

class FollowRelationship(models.Model):
    '''
    Simple follow relationships between users (like Twitter/Instagram)
    '''
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'follow_relationship'
        constraints = [
            UniqueConstraint(fields=['user', 'friend'], name='unique_follow_relationship')
        ]
        
    def __str__(self):
        return f"{self.user.username} follows {self.friend.username}"

class BlockedUser(models.Model):
    '''
    Blocked user relationships
    '''
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_users')
    blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blocked_user'
        constraints = [
            UniqueConstraint(fields=['user', 'blocked_user'], name='unique_blocked_user')
        ]
        
    def __str__(self):
        return f"{self.user.username} blocked {self.blocked_user.username}"

class Group(models.Model):
    '''
    User groups for sharing content and communication
    '''
    PRIVACY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    privacy = models.CharField(max_length=10, choices=PRIVACY_CHOICES, default='public')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'group'

class GroupMembership(models.Model):
    '''
    User membership in groups with roles
    '''
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('admin', 'Admin'),
    ]
    
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'group_membership'
        constraints = [
            UniqueConstraint(fields=['group', 'user'], name='unique_group_membership')
        ]

class Post(models.Model):
    '''
    User generated content posts
    '''
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='posts', null=True, blank=True)
    content = models.TextField()
    media_url = models.URLField(blank=True, null=True)
    media_type = models.CharField(max_length=20, blank=True, null=True, choices=[
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
    ])
    hashtags = models.JSONField(default=list, blank=True)
    shares_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'post'

class Comment(models.Model):
    '''
    Comments on posts
    '''
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'comment'

class Like(models.Model):
    '''
    Likes for posts and comments
    '''
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes', null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def clean(self):
        if self.post is None and self.comment is None:
            raise ValidationError('A like must reference either a post or a comment')
    
    class Meta:
        db_table = 'like'
        constraints = [
            CheckConstraint(
                check=Q(post__isnull=False) | Q(comment__isnull=False),
                name='like_has_target'
            ),
            UniqueConstraint(
                fields=['user', 'post'],
                condition=Q(post__isnull=False),
                name='unique_post_like'
            ),
            UniqueConstraint(
                fields=['user', 'comment'],
                condition=Q(comment__isnull=False),
                name='unique_comment_like'
            )
        ]

class Story(models.Model):
    '''
    Temporary user stories
    '''
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stories')
    media_url = models.URLField()
    caption = models.TextField(blank=True, null=True)  # Optional caption for text stories
    story_type = models.CharField(max_length=20, choices=[
        ('image', 'Image'),
        ('video', 'Video'),
        ('text', 'Text'),
    ], default='image')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'story'

    def __str__(self):
        return f"Story by {self.author.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class StoryView(models.Model):
    """ Tracks when a user has viewed a story. """
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='story_views')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a user can only view a story once
        unique_together = ('story', 'user')
        ordering = ['-viewed_at']
        db_table = 'story_view'

    def __str__(self):
        return f"{self.user.username} viewed {self.story.author.username}'s story"

class StoryLike(models.Model):
    """ Tracks likes on stories. """
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='story_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a user can only like a story once
        unique_together = ('story', 'user')
        ordering = ['-created_at']
        db_table = 'story_like'

    def __str__(self):
        return f"{self.user.username} liked {self.story.author.username}'s story"

class StoryComment(models.Model):
    """ Comments on stories. """
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='story_comments')
    content = models.TextField(max_length=500)  # Limit comment length
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        db_table = 'story_comment'

    def __str__(self):
        return f"{self.author.username} commented on {self.story.author.username}'s story"

class StoryShare(models.Model):
    """ Tracks story shares. """
    SHARE_TYPES = [
        ('copy_link', 'Copy Link'),
        ('direct_message', 'Direct Message'),
        ('post', 'Share as Post'),
        ('external', 'External Platform'),
    ]
    
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='story_shares')
    share_type = models.CharField(max_length=20, choices=SHARE_TYPES, default='copy_link')
    shared_with = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='story_shared_with')
    external_platform = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'story_share'

    def __str__(self):
        return f"{self.user.username} shared {self.story.author.username}'s story"

class StoryBookmark(models.Model):
    """ Bookmarks for stories. """
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='bookmarks')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='story_bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a user can only bookmark a story once
        unique_together = ('story', 'user')
        ordering = ['-created_at']
        db_table = 'story_bookmark'

    def __str__(self):
        return f"{self.user.username} bookmarked {self.story.author.username}'s story"

class Notification(models.Model):
    '''
    User notifications
    '''
    NOTIFICATION_TYPES = [
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('friend_request', 'Friend Request'),
        ('group_invite', 'Group Invite'),
        ('message', 'Message'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    reference_id = models.IntegerField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification'

class Message(models.Model):
    '''
    Messages between users or in groups
    '''
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='received_messages', null=True, blank=True)
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, related_name='group_messages', null=True, blank=True)
    content = models.TextField()
    media_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def clean(self):
        if self.receiver is None and self.group is None:
            raise ValidationError('A message must have either a receiver or a group')
    
    class Meta:
        db_table = 'message'
        constraints = [
            CheckConstraint(
                check=Q(receiver__isnull=False) | Q(group__isnull=False),
                name='message_has_recipient'
            )
        ]

class Achievement(models.Model):
    '''
    Platform achievements for users to unlock
    '''
    name = models.CharField(max_length=255)
    description = models.TextField()
    criteria = models.JSONField()
    reward = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'achievement'

class UserAchievement(models.Model):
    '''
    Achievements unlocked by users
    '''
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='user_achievements')
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_achievement'
        constraints = [
            UniqueConstraint(fields=['user', 'achievement'], name='unique_user_achievement')
        ]

class Invite(models.Model):
    '''
    Platform invitation codes
    '''
    code = models.CharField(max_length=20, unique=True)
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invites')
    invitee_email = models.EmailField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'invite'

class Wallet(models.Model):
    '''
    User wallet with token balance
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    address = models.CharField(max_length=255, blank=True, null=True)
    private_key_encrypted = models.CharField(max_length=512, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'wallet'

class TokenTransaction(models.Model):
    '''
    Internal token transfers between users
    '''
    TRANSACTION_TYPES = [
        ('transfer', 'Transfer'),
        ('mining_reward', 'Mining Reward'),
        ('staking_reward', 'Staking Reward'),
        ('achievement_reward', 'Achievement Reward'),
        ('purchase', 'Purchase'),
        ('system', 'System'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    transaction_hash = models.CharField(max_length=64, unique=True, default=generate_transaction_hash)
    from_wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='sent_transactions', null=True, blank=True)
    to_wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='received_transactions')
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'token_transaction'

class MiningProgress(models.Model):
    '''
    User mining progress and claim logic
    '''
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mining_progress')
    mining_power = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    last_claim_time = models.DateTimeField(default=timezone.now)
    accumulated_tokens = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    total_mined = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    streak_days = models.IntegerField(default=0)
    
    # Heartbeat and activity tracking fields
    last_heartbeat = models.DateTimeField(null=True, blank=True)
    last_activity_at = models.DateTimeField(null=True, blank=True)
    last_inactive_check = models.DateTimeField(null=True, blank=True)
    is_mining = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mining_progress'

class NFT(models.Model):
    '''
    NFT creation and storage
    '''
    NFT_TYPES = [
        ('image', 'Image'),
        ('audio', 'Audio'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]
    
    RARITY_LEVELS = [
        ('common', 'Common'),
        ('uncommon', 'Uncommon'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
        ('mythic', 'Mythic'),
    ]
    
    token_id = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_nfts')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_nfts')
    nft_type = models.CharField(max_length=10, choices=NFT_TYPES, default='image')
    media_url = models.URLField()
    metadata = models.JSONField(default=dict)
    rarity = models.CharField(max_length=10, choices=RARITY_LEVELS, default='common')
    is_locked = models.BooleanField(default=False)
    transaction_hash = models.CharField(max_length=64, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Statistiken
    views = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'nft'

class UserSettings(models.Model):
    '''
    User account settings and preferences
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    theme = models.CharField(max_length=10, default='light')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    privacy_settings = models.JSONField(default=dict)
    two_factor_auth_enabled = models.BooleanField(default=False)
    auto_staking = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_settings'

class NotificationSettings(models.Model):
    '''
    Granular control of notifications
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    likes = models.BooleanField(default=True)
    comments = models.BooleanField(default=True)
    friend_requests = models.BooleanField(default=True)
    messages = models.BooleanField(default=True)
    group_invites = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    token_transactions = models.BooleanField(default=True)
    mining_rewards = models.BooleanField(default=True)
    governance_alerts = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_settings'

class DAO(models.Model):
    '''
    Decentralized Autonomous Organization
    '''
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_daos')
    governance_token = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    rules = models.JSONField(default=dict)
    logo_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dao'

class DAOMembership(models.Model):
    '''
    User membership in DAOs with roles
    '''
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('contributor', 'Contributor'),
        ('moderator', 'Moderator'),
        ('admin', 'Admin'),
    ]
    
    dao = models.ForeignKey(DAO, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dao_memberships')
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='member')
    voting_power = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dao_membership'
        constraints = [
            UniqueConstraint(fields=['dao', 'user'], name='unique_dao_membership')
        ]

class Proposal(models.Model):
    '''
    Governance proposal within a DAO
    '''
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('passed', 'Passed'),
        ('rejected', 'Rejected'),
        ('executed', 'Executed'),
        ('cancelled', 'Cancelled'),
    ]
    
    dao = models.ForeignKey(DAO, on_delete=models.CASCADE, related_name='proposals')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_proposals')
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    execution_script = models.JSONField(default=dict, blank=True)
    quorum = models.IntegerField(default=0)  # Minimum votes required
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'proposal'

class Vote(models.Model):
    '''
    Vote on a governance proposal
    '''
    VOTE_CHOICES = [
        ('for', 'For'),
        ('against', 'Against'),
        ('abstain', 'Abstain'),
    ]
    
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='votes')
    voter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    vote = models.CharField(max_length=10, choices=VOTE_CHOICES)
    voting_power = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vote'
        constraints = [
            UniqueConstraint(fields=['proposal', 'voter'], name='unique_proposal_vote')
        ]

class AdminLog(models.Model):
    '''
    Audit log for admin actions
    '''
    ACTION_TYPES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('suspend', 'Suspend'),
        ('unsuspend', 'Unsuspend'),
        ('other', 'Other'),
    ]
    
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='admin_logs')
    action = models.CharField(max_length=10, choices=ACTION_TYPES)
    entity_type = models.CharField(max_length=50)  # e.g., 'user', 'post', 'group'
    entity_id = models.IntegerField()
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'admin_log'

class Staking(models.Model):
    '''
    User token staking records
    '''
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stakings')
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    staking_period = models.IntegerField()  # Days
    apy_rate = models.DecimalField(max_digits=6, decimal_places=2)  # Annual Percentage Yield
    rewards_earned = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    last_reward_claim = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'staking'

class TokenStreaming(models.Model):
    '''
    Continuous streaming of tokens from one user to another
    '''
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='token_streams_sent')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='token_streams_received')
    total_amount = models.DecimalField(max_digits=18, decimal_places=8)
    amount_per_second = models.DecimalField(max_digits=18, decimal_places=12)
    streamed_amount = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField()
    last_update_time = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'token_streaming'

class AchievementTemplate(models.Model):
    '''
    Templates for dynamically defined achievements
    '''
    name = models.CharField(max_length=255)
    description = models.TextField()
    criteria = models.JSONField()  # Rules for unlocking the achievement
    points = models.IntegerField(default=0)
    token_reward = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    badge_image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'achievement_template'

class SmartContract(models.Model):
    '''
    Smart contract deployments
    '''
    CONTRACT_TYPES = [
        ('token', 'Token'),
        ('nft', 'NFT'),
        ('marketplace', 'Marketplace'),
        ('governance', 'Governance'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    contract_type = models.CharField(max_length=15, choices=CONTRACT_TYPES)
    address = models.CharField(max_length=255)
    network = models.CharField(max_length=50)  # e.g., 'ethereum', 'binance', 'polygon'
    abi = models.JSONField()
    bytecode = models.TextField(blank=True, null=True)
    source_code = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deployed_contracts', null=True)
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    deployed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'smart_contract'

class TokenFactory(models.Model):
    '''
    Factory for creating and deploying tokens
    '''
    TOKEN_STANDARDS = [
        ('erc20', 'ERC-20'),
        ('erc721', 'ERC-721'),
        ('erc1155', 'ERC-1155'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    symbol = models.CharField(max_length=10)
    decimals = models.IntegerField(default=18)  # Only for fungible tokens
    total_supply = models.DecimalField(max_digits=36, decimal_places=18)
    token_standard = models.CharField(max_length=10, choices=TOKEN_STANDARDS)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tokens')
    contract = models.ForeignKey(SmartContract, on_delete=models.CASCADE, related_name='tokens', null=True, blank=True)
    logo_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'token_factory'

class EventLog(models.Model):
    '''
    System event logs
    '''
    EVENT_LEVELS = [
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    event_type = models.CharField(max_length=100)
    level = models.CharField(max_length=10, choices=EVENT_LEVELS, default='info')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='event_logs')
    message = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_log'

class Chat(models.Model):
    '''
    Chat room or conversation between users
    '''
    CHAT_TYPES = [
        ('direct', 'Direct'),
        ('group', 'Group'),
    ]
    
    name = models.CharField(max_length=255, blank=True, null=True)  # Optional, mainly for group chats
    type = models.CharField(max_length=10, choices=CHAT_TYPES, default='direct')
    participants = models.ManyToManyField(User, related_name='chats')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chat'

class ChatMessage(models.Model):
    '''
    Messages within a chat
    '''
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    content = models.TextField()
    media_url = models.URLField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_message'
        ordering = ['created_at']

class Referral(models.Model):
    '''
    Track user referrals
    '''
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referred_users')
    referred = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referred_by')
    reward_claimed = models.BooleanField(default=False)
    reward_amount = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    rewarded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'referral'
        constraints = [
            UniqueConstraint(fields=['referrer', 'referred'], name='unique_referral')
        ]

class InviteReward(models.Model):
    '''
    Rewards for inviting new users
    '''
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invite_rewards')
    invite = models.OneToOneField(Invite, on_delete=models.CASCADE, related_name='reward')
    reward_amount = models.DecimalField(max_digits=18, decimal_places=8)
    is_claimed = models.BooleanField(default=False)
    claimed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'invite_reward'

class ICOTokenReservation(models.Model):
    '''
    ICO Token Reservation System
    '''
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Failed'),
    ]
    
    PAYMENT_METHODS = [
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ico_reservations')
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2)
    tokens_reserved = models.DecimalField(max_digits=18, decimal_places=8)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    payment_address = models.CharField(max_length=255)
    transaction_hash = models.CharField(max_length=66, unique=True, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_amount = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    payment_currency = models.CharField(max_length=10, null=True, blank=True)
    exchange_rate = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    confirmation_blocks = models.IntegerField(default=0)
    required_confirmations = models.IntegerField(default=12)
    expires_at = models.DateTimeField()
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ico_token_reservation'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['payment_method', 'status']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"ICO Reservation {self.id} - {self.user.username} - {self.status}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def can_be_confirmed(self):
        return self.status == 'pending' and not self.is_expired()
    
    def confirm(self, transaction_hash, payment_amount, exchange_rate):
        self.transaction_hash = transaction_hash
        self.payment_amount = payment_amount
        self.exchange_rate = exchange_rate
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        self.save()
    
    def complete(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
    
    def cancel(self, reason=''):
        self.status = 'cancelled'
        self.notes = reason
        self.save()

class ICOConfiguration(models.Model):
    '''
    ICO Configuration Settings
    '''
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ico_configuration'
    
    def __str__(self):
        return f"{self.key}: {self.value}"

# Demo Token System für Influencer
class DemoToken(models.Model):
    """Demo tokens for influencer streams."""
    
    influencer = models.ForeignKey(User, on_delete=models.CASCADE)
    token_name = models.CharField(max_length=50)
    token_symbol = models.CharField(max_length=10)
    total_supply = models.DecimalField(max_digits=20, decimal_places=8)
    demo_balance = models.DecimalField(max_digits=20, decimal_places=8)
    
    # Visual properties
    token_color = models.CharField(max_length=7, default="#3B82F6")
    token_logo_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.token_name} ({self.token_symbol}) - {self.influencer.username}"

class DemoTransaction(models.Model):
    """Demo token transactions for influencer streams."""
    
    demo_token = models.ForeignKey(DemoToken, on_delete=models.CASCADE)
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='demo_sent_transactions')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='demo_received_transactions')
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'demo_transaction'

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
        db_table = 'bookmark'

class Boost(models.Model):
    BOOST_TYPES = [
        ('post', 'Post Creation'),
        ('comment', 'Comment Creation'),
        ('like', 'Like Given'),
        ('share', 'Content Share'),
        ('login', 'Daily Login'),
        ('referral', 'Referral Success'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boosts')
    boost_type = models.CharField(max_length=20, choices=BOOST_TYPES)
    multiplier = models.DecimalField(max_digits=5, decimal_places=2)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'boost'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}'s {self.get_boost_type_display()} Boost"

    def save(self, *args, **kwargs):
        if not self.pk: # Set expiration only on creation
            # Duration logic can be centralized here based on boost_type
            duration_minutes = {
                'post': 10,
                'comment': 5,
                'like': 2,
                'share': 8,
                'login': 15,
                'referral': 30,
            }.get(self.boost_type, 0)
            self.expires_at = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        super().save(*args, **kwargs)
