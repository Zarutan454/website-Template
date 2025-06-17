from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, ProfileSettings, Friendship, Group, GroupMembership,
    Post, Comment, Like, Story, Notification, Message,
    Achievement, UserAchievement, Invite,
    Wallet, TokenTransaction, MiningProgress, NFT, UserSettings, NotificationSettings,
    DAO, DAOMembership, Proposal, Vote, AdminLog, Staking, TokenStreaming,
    AchievementTemplate, SmartContract, TokenFactory, EventLog, Referral, InviteReward
)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'wallet_address', 'created_at')
    search_fields = ('username', 'email', 'wallet_address')
    list_filter = ('is_staff', 'is_active', 'created_at')

@admin.register(ProfileSettings)
class ProfileSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_public', 'language')
    list_filter = ('is_public', 'language')
    search_fields = ('user__username', 'user__email')

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('requester', 'receiver', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('requester__username', 'receiver__username')

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'privacy', 'created_at')
    list_filter = ('privacy', 'created_at')
    search_fields = ('name', 'description', 'creator__username')

@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ('group', 'user', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('group__name', 'user__username')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'group', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('author__username', 'content', 'group__name')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('author__username', 'content', 'post__content')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_target', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username',)
    
    def get_target(self, obj):
        if obj.post:
            return f"Post: {obj.post.id}"
        return f"Comment: {obj.comment.id}"
    get_target.short_description = 'Target'

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('author', 'created_at', 'expires_at')
    list_filter = ('created_at', 'expires_at')
    search_fields = ('author__username',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__username',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'get_recipient', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('sender__username', 'receiver__username', 'content', 'group__name')
    
    def get_recipient(self, obj):
        if obj.receiver:
            return f"User: {obj.receiver.username}"
        return f"Group: {obj.group.name}"
    get_recipient.short_description = 'Recipient'

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'reward')
    search_fields = ('name', 'description', 'reward')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'unlocked_at')
    list_filter = ('unlocked_at',)
    search_fields = ('user__username', 'achievement__name')

@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ('code', 'inviter', 'invitee_email', 'is_used', 'created_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('code', 'inviter__username', 'invitee_email')

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'address', 'created_at')
    search_fields = ('user__username', 'address')

@admin.register(TokenTransaction)
class TokenTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_hash', 'from_wallet', 'to_wallet', 'amount', 'transaction_type', 'status', 'created_at')
    search_fields = ('transaction_hash',)
    list_filter = ('transaction_type', 'status', 'created_at')

@admin.register(MiningProgress)
class MiningProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'mining_power', 'accumulated_tokens', 'total_mined', 'streak_days', 'updated_at')
    search_fields = ('user__username',)

@admin.register(NFT)
class NFTAdmin(admin.ModelAdmin):
    list_display = ('token_id', 'name', 'owner', 'creator', 'nft_type', 'rarity', 'created_at')
    search_fields = ('token_id', 'name', 'owner__username', 'creator__username')
    list_filter = ('nft_type', 'rarity', 'created_at')

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'email_notifications', 'push_notifications', 'two_factor_auth_enabled', 'auto_staking', 'updated_at')
    search_fields = ('user__username',)

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'likes', 'comments', 'friend_requests', 'messages', 'group_invites', 'system_notifications', 'token_transactions', 'mining_rewards', 'governance_alerts', 'updated_at')
    search_fields = ('user__username',)

@admin.register(DAO)
class DAOAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'status', 'created_at')
    search_fields = ('name', 'creator__username')
    list_filter = ('status', 'created_at')

@admin.register(DAOMembership)
class DAOMembershipAdmin(admin.ModelAdmin):
    list_display = ('dao', 'user', 'role', 'voting_power', 'joined_at')
    search_fields = ('dao__name', 'user__username')
    list_filter = ('role', 'joined_at')

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('dao', 'creator', 'title', 'status', 'start_date', 'end_date')
    search_fields = ('dao__name', 'creator__username', 'title')
    list_filter = ('status', 'start_date', 'end_date')

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('proposal', 'voter', 'vote', 'voting_power', 'created_at')
    search_fields = ('proposal__title', 'voter__username')
    list_filter = ('vote', 'created_at')

@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ('admin', 'action', 'entity_type', 'entity_id', 'created_at')
    search_fields = ('admin__username', 'entity_type')
    list_filter = ('action', 'created_at')

@admin.register(Staking)
class StakingAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'status', 'staking_period', 'apy_rate', 'rewards_earned', 'start_date', 'end_date')
    search_fields = ('user__username',)
    list_filter = ('status', 'start_date', 'end_date')

@admin.register(TokenStreaming)
class TokenStreamingAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'total_amount', 'status', 'start_time', 'end_time')
    search_fields = ('sender__username', 'receiver__username')
    list_filter = ('status', 'start_time', 'end_time')

@admin.register(AchievementTemplate)
class AchievementTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'points', 'token_reward', 'is_active', 'created_at')
    search_fields = ('name',)
    list_filter = ('is_active', 'created_at')

@admin.register(SmartContract)
class SmartContractAdmin(admin.ModelAdmin):
    list_display = ('name', 'contract_type', 'address', 'network', 'creator', 'deployed_at')
    search_fields = ('name', 'address', 'network', 'creator__username')
    list_filter = ('contract_type', 'deployed_at')

@admin.register(TokenFactory)
class TokenFactoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'symbol', 'token_standard', 'owner', 'created_at')
    search_fields = ('name', 'symbol', 'owner__username')
    list_filter = ('token_standard', 'created_at')

@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'level', 'user', 'created_at')
    search_fields = ('event_type', 'user__username')
    list_filter = ('level', 'created_at')

@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('referrer', 'referred', 'reward_claimed', 'reward_amount', 'created_at')
    search_fields = ('referrer__username', 'referred__username')
    list_filter = ('reward_claimed', 'created_at')

@admin.register(InviteReward)
class InviteRewardAdmin(admin.ModelAdmin):
    list_display = ('inviter', 'invite', 'reward_amount', 'is_claimed', 'claimed_at')
    search_fields = ('inviter__username', 'invite__code')
    list_filter = ('is_claimed', 'claimed_at')
