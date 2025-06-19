from django.contrib import admin
from .models import (
    TokenReservation, FaucetRequest, ReferralProgram, ReferralCode,
    NewsletterSubscription, ContactForm, ICOStats
)


@admin.register(TokenReservation)
class TokenReservationAdmin(admin.ModelAdmin):
    """
    TokenReservation admin interface
    """
    list_display = [
        'id', 'user', 'amount_usd', 'tokens_amount', 'payment_method',
        'payment_status', 'wallet_address', 'created_at'
    ]
    list_filter = [
        'payment_status', 'payment_method', 'created_at', 'payment_date'
    ]
    search_fields = [
        'user__username', 'user__email', 'wallet_address',
        'transaction_hash', 'referral_code'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Reservation Information', {
            'fields': ('user', 'amount_usd', 'tokens_amount', 'payment_method')
        }),
        ('Payment Information', {
            'fields': ('payment_status', 'transaction_hash', 'wallet_address')
        }),
        ('Additional Information', {
            'fields': ('referral_code', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'payment_date'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(FaucetRequest)
class FaucetRequestAdmin(admin.ModelAdmin):
    """
    FaucetRequest admin interface
    """
    list_display = [
        'id', 'user', 'network', 'wallet_address', 'amount_requested',
        'status', 'processed_by', 'created_at'
    ]
    list_filter = [
        'status', 'network', 'created_at', 'processed_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'wallet_address',
        'transaction_hash', 'reason'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('user', 'network', 'wallet_address', 'amount_requested')
        }),
        ('Processing', {
            'fields': ('status', 'transaction_hash', 'processed_by')
        }),
        ('Additional Information', {
            'fields': ('reason', 'ip_address', 'user_agent')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'processed_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ReferralProgram)
class ReferralProgramAdmin(admin.ModelAdmin):
    """
    ReferralProgram admin interface
    """
    list_display = [
        'id', 'referrer', 'referred_user', 'referral_code',
        'commission_earned', 'tokens_earned', 'is_active', 'is_paid_out'
    ]
    list_filter = [
        'is_active', 'is_paid_out', 'created_at', 'paid_out_at'
    ]
    search_fields = [
        'referrer__username', 'referred_user__username',
        'referral_code'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Referral Information', {
            'fields': ('referrer', 'referred_user', 'referral_code')
        }),
        ('Earnings', {
            'fields': ('commission_earned', 'tokens_earned')
        }),
        ('Status', {
            'fields': ('is_active', 'is_paid_out')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_out_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    """
    ReferralCode admin interface
    """
    list_display = [
        'id', 'user', 'code', 'is_active', 'total_referrals',
        'total_commission', 'total_tokens'
    ]
    list_filter = [
        'is_active', 'created_at', 'updated_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'code'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Code Information', {
            'fields': ('user', 'code', 'is_active')
        }),
        ('Statistics', {
            'fields': ('total_referrals', 'total_commission', 'total_tokens')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    """
    NewsletterSubscription admin interface
    """
    list_display = [
        'id', 'email', 'user', 'is_active', 'subscription_type',
        'created_at'
    ]
    list_filter = [
        'is_active', 'subscription_type', 'created_at', 'unsubscribed_at'
    ]
    search_fields = [
        'email', 'user__username', 'user__email'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Subscription Information', {
            'fields': ('email', 'user', 'is_active', 'subscription_type')
        }),
        ('Additional Information', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'unsubscribed_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ContactForm)
class ContactFormAdmin(admin.ModelAdmin):
    """
    ContactForm admin interface
    """
    list_display = [
        'id', 'name', 'email', 'subject', 'status', 'assigned_to',
        'created_at'
    ]
    list_filter = [
        'status', 'created_at', 'resolved_at'
    ]
    search_fields = [
        'name', 'email', 'subject', 'message', 'user__username'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'subject', 'message')
        }),
        ('Processing', {
            'fields': ('status', 'assigned_to')
        }),
        ('Additional Information', {
            'fields': ('user', 'ip_address', 'user_agent')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ICOStats)
class ICOStatsAdmin(admin.ModelAdmin):
    """
    ICOStats admin interface
    """
    list_display = [
        'id', 'date', 'total_raised_usd', 'total_tokens_sold',
        'total_reservations', 'total_payments', 'total_users'
    ]
    list_filter = [
        'date', 'created_at', 'updated_at'
    ]
    search_fields = [
        'date'
    ]
    ordering = ['-date']
    
    fieldsets = (
        ('Date', {
            'fields': ('date',)
        }),
        ('Financial Metrics', {
            'fields': (
                'total_raised_usd', 'total_tokens_sold',
                'total_reservations', 'total_payments'
            )
        }),
        ('User Metrics', {
            'fields': ('new_users', 'active_users', 'total_users')
        }),
        ('Referral Metrics', {
            'fields': ('total_referrals', 'referral_commissions')
        }),
        ('Network Distribution', {
            'fields': (
                'ethereum_payments', 'polygon_payments',
                'bsc_payments', 'solana_payments'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at']
