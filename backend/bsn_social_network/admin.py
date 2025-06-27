from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import *

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_alpha_user', 'wallet_address', 'created_at', 'avatar_url', 'cover_url')
    list_filter = ('is_alpha_user', 'is_staff', 'is_active', 'alpha_access_reason', 'influencer_category')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'wallet_address')
    ordering = ('-created_at',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Images', {
            'fields': ('avatar_url', 'cover_url')
        }),
        ('Alpha Access', {
            'fields': ('is_alpha_user', 'alpha_access_granted_at', 'alpha_access_granted_by', 'alpha_access_reason')
        }),
        ('Referral Tracking', {
            'fields': ('referral_count_for_alpha', 'referral_validation_date')
        }),
        ('Investment Tracking', {
            'fields': ('ico_investment_amount', 'investment_validation_date')
        }),
        ('Influencer Info', {
            'fields': ('influencer_category', 'follower_count', 'social_media_links')
        }),
        ('Blockchain', {
            'fields': ('wallet_address',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'alpha_access_granted_at')
    
    actions = ['grant_alpha_access', 'revoke_alpha_access']
    
    def grant_alpha_access(self, request, queryset):
        for user in queryset:
            user.grant_alpha_access('manual', request.user)
        self.message_user(request, f"Alpha access granted to {queryset.count()} users")
    grant_alpha_access.short_description = "Grant alpha access to selected users"
    
    def revoke_alpha_access(self, request, queryset):
        updated = queryset.update(is_alpha_user=False, alpha_access_granted_at=None, alpha_access_granted_by=None, alpha_access_reason=None)
        self.message_user(request, f"Alpha access revoked from {updated} users")
    revoke_alpha_access.short_description = "Revoke alpha access from selected users"

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
    date_hierarchy = 'created_at'

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'privacy', 'created_at', 'member_count')
    list_filter = ('privacy', 'created_at')
    search_fields = ('name', 'description', 'creator__username')
    date_hierarchy = 'created_at'
    
    def member_count(self, obj):
        return obj.memberships.count()
    member_count.short_description = 'Members'

@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ('group', 'user', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('group__name', 'user__username')
    date_hierarchy = 'joined_at'

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'group', 'content_preview', 'created_at', 'like_count', 'comment_count')
    list_filter = ('created_at', 'group')
    search_fields = ('content', 'author__username', 'group__name')
    date_hierarchy = 'created_at'
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'
    
    def like_count(self, obj):
        return obj.likes.count()
    like_count.short_description = 'Likes'
    
    def comment_count(self, obj):
        return obj.comments.count()
    comment_count.short_description = 'Comments'

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__username', 'post__content')
    date_hierarchy = 'created_at'
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'content_object', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username',)
    date_hierarchy = 'created_at'
    
    def content_type(self, obj):
        return 'Post' if obj.post else 'Comment'
    content_type.short_description = 'Type'
    
    def content_object(self, obj):
        if obj.post:
            return obj.post.content[:50] + '...' if len(obj.post.content) > 50 else obj.post.content
        elif obj.comment:
            return obj.comment.content[:50] + '...' if len(obj.comment.content) > 50 else obj.comment.content
        return '-'
    content_object.short_description = 'Content'

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('author', 'media_url', 'expires_at', 'created_at', 'is_expired')
    list_filter = ('created_at', 'expires_at')
    search_fields = ('author__username',)
    date_hierarchy = 'created_at'
    
    def is_expired(self, obj):
        from django.utils import timezone
        return obj.expires_at < timezone.now()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'reference_id', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__username',)
    date_hierarchy = 'created_at'
    list_editable = ('is_read',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver_or_group', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'sender__username', 'receiver__username', 'group__name')
    date_hierarchy = 'created_at'
    
    def receiver_or_group(self, obj):
        if obj.receiver:
            return f"To: {obj.receiver.username}"
        elif obj.group:
            return f"Group: {obj.group.name}"
        return '-'
    receiver_or_group.short_description = 'Recipient'
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'reward')
    search_fields = ('name', 'description', 'reward')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'unlocked_at')
    list_filter = ('unlocked_at',)
    search_fields = ('user__username', 'achievement__name')
    date_hierarchy = 'unlocked_at'

@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ('code', 'inviter', 'invitee_email', 'is_used', 'created_at', 'used_at')
    list_filter = ('is_used', 'created_at', 'used_at')
    search_fields = ('code', 'inviter__username', 'invitee_email')
    date_hierarchy = 'created_at'
    readonly_fields = ('code',)

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'address', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'address')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')

@admin.register(TokenTransaction)
class TokenTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_hash', 'from_wallet', 'to_wallet', 'amount', 'transaction_type', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'created_at')
    search_fields = ('transaction_hash', 'from_wallet__user__username', 'to_wallet__user__username')
    date_hierarchy = 'created_at'
    readonly_fields = ('transaction_hash', 'created_at', 'completed_at')

@admin.register(MiningProgress)
class MiningProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'mining_power', 'accumulated_tokens', 'total_mined', 'streak_days', 'last_claim_time')
    list_filter = ('last_claim_time',)
    search_fields = ('user__username',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(NFT)
class NFTAdmin(admin.ModelAdmin):
    list_display = ('token_id', 'name', 'owner', 'creator', 'nft_type', 'rarity', 'is_locked', 'created_at')
    list_filter = ('nft_type', 'rarity', 'is_locked', 'created_at')
    search_fields = ('token_id', 'name', 'owner__username', 'creator__username')
    date_hierarchy = 'created_at'
    readonly_fields = ('token_id', 'created_at')

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'email_notifications', 'push_notifications', 'two_factor_auth_enabled', 'auto_staking')
    list_filter = ('theme', 'email_notifications', 'push_notifications', 'two_factor_auth_enabled', 'auto_staking')
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'likes', 'comments', 'friend_requests', 'messages', 'system_notifications')
    list_filter = ('likes', 'comments', 'friend_requests', 'messages', 'system_notifications')
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)

@admin.register(DAO)
class DAOAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'status', 'created_at', 'member_count')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'description', 'creator__username')
    date_hierarchy = 'created_at'
    
    def member_count(self, obj):
        return obj.memberships.count()
    member_count.short_description = 'Members'

@admin.register(DAOMembership)
class DAOMembershipAdmin(admin.ModelAdmin):
    list_display = ('dao', 'user', 'role', 'voting_power', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('dao__name', 'user__username')
    date_hierarchy = 'joined_at'

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('title', 'dao', 'creator', 'status', 'start_date', 'end_date', 'vote_count')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('title', 'description', 'dao__name', 'creator__username')
    date_hierarchy = 'created_at'
    
    def vote_count(self, obj):
        return obj.votes.count()
    vote_count.short_description = 'Votes'

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('proposal', 'voter', 'vote', 'voting_power', 'created_at')
    list_filter = ('vote', 'created_at')
    search_fields = ('proposal__title', 'voter__username')
    date_hierarchy = 'created_at'

@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ('admin', 'action', 'entity_type', 'entity_id', 'ip_address', 'created_at')
    list_filter = ('action', 'entity_type', 'created_at')
    search_fields = ('admin__username', 'description', 'entity_type')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)

@admin.register(Staking)
class StakingAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'status', 'staking_period', 'apy_rate', 'rewards_earned', 'start_date', 'end_date')
    list_filter = ('status', 'staking_period', 'start_date', 'end_date')
    search_fields = ('user__username',)
    date_hierarchy = 'start_date'

@admin.register(TokenStreaming)
class TokenStreamingAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'total_amount', 'amount_per_second', 'streamed_amount', 'status', 'start_time', 'end_time')
    list_filter = ('status', 'start_time', 'end_time')
    search_fields = ('sender__username', 'receiver__username')
    date_hierarchy = 'start_time'

@admin.register(AchievementTemplate)
class AchievementTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'points', 'token_reward', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    date_hierarchy = 'created_at'

@admin.register(SmartContract)
class SmartContractAdmin(admin.ModelAdmin):
    list_display = ('name', 'contract_type', 'address', 'network', 'creator', 'deployed_at')
    list_filter = ('contract_type', 'network', 'deployed_at')
    search_fields = ('name', 'address', 'creator__username')
    date_hierarchy = 'deployed_at'
    readonly_fields = ('deployed_at',)

@admin.register(TokenFactory)
class TokenFactoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'symbol', 'token_standard', 'total_supply', 'owner', 'created_at')
    list_filter = ('token_standard', 'created_at')
    search_fields = ('name', 'symbol', 'owner__username')
    date_hierarchy = 'created_at'

@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'level', 'user', 'message_preview', 'ip_address', 'created_at')
    list_filter = ('level', 'event_type', 'created_at')
    search_fields = ('event_type', 'message', 'user__username')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)
    
    def message_preview(self, obj):
        return obj.message[:100] + '...' if len(obj.message) > 100 else obj.message
    message_preview.short_description = 'Message'

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'created_by', 'created_at', 'participant_count')
    list_filter = ('type', 'created_at')
    search_fields = ('name', 'created_by__username')
    date_hierarchy = 'created_at'
    
    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('chat', 'sender', 'content_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('content', 'sender__username', 'chat__name')
    date_hierarchy = 'created_at'
    list_editable = ('is_read',)
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'

@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('referrer', 'referred', 'reward_claimed', 'reward_amount', 'created_at', 'rewarded_at')
    list_filter = ('reward_claimed', 'created_at', 'rewarded_at')
    search_fields = ('referrer__username', 'referred__username')
    date_hierarchy = 'created_at'

@admin.register(InviteReward)
class InviteRewardAdmin(admin.ModelAdmin):
    list_display = ('inviter', 'invite', 'reward_amount', 'is_claimed', 'claimed_at')
    list_filter = ('is_claimed', 'claimed_at')
    search_fields = ('inviter__username', 'invite__code')
    date_hierarchy = 'claimed_at'

@admin.register(ICOTokenReservation)
class ICOTokenReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount_usd', 'tokens_reserved', 'payment_method', 'status', 'created_at', 'expires_at')
    list_filter = ('status', 'payment_method', 'created_at', 'expires_at')
    search_fields = ('user__username', 'transaction_hash', 'payment_address')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at', 'confirmed_at', 'completed_at')
    
    actions = ['confirm_reservation', 'complete_reservation', 'cancel_reservation']
    
    def confirm_reservation(self, request, queryset):
        for reservation in queryset:
            if reservation.can_be_confirmed():
                reservation.confirm('manual_confirmation', 0, 0)
        self.message_user(request, f"Confirmed {queryset.count()} reservations")
    confirm_reservation.short_description = "Confirm selected reservations"
    
    def complete_reservation(self, request, queryset):
        for reservation in queryset:
            if reservation.status == 'confirmed':
                reservation.complete()
        self.message_user(request, f"Completed {queryset.count()} reservations")
    complete_reservation.short_description = "Complete selected reservations"
    
    def cancel_reservation(self, request, queryset):
        for reservation in queryset:
            if reservation.status in ['pending', 'confirmed']:
                reservation.cancel('Admin cancellation')
        self.message_user(request, f"Cancelled {queryset.count()} reservations")
    cancel_reservation.short_description = "Cancel selected reservations"

@admin.register(ICOConfiguration)
class ICOConfigurationAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('key', 'value', 'description')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(DemoToken)
class DemoTokenAdmin(admin.ModelAdmin):
    list_display = ('influencer', 'token_name', 'token_symbol', 'total_supply', 'demo_balance', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('influencer__username', 'token_name', 'token_symbol')
    date_hierarchy = 'created_at'

@admin.register(DemoTransaction)
class DemoTransactionAdmin(admin.ModelAdmin):
    list_display = ('demo_token', 'from_user', 'to_user', 'amount', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('demo_token__token_name', 'from_user__username', 'to_user__username')
    date_hierarchy = 'created_at'
