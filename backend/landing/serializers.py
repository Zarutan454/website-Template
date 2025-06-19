from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    TokenReservation, FaucetRequest, ReferralProgram, ReferralCode,
    NewsletterSubscription, ContactForm, ICOStats
)

User = get_user_model()


class TokenReservationSerializer(serializers.ModelSerializer):
    """
    Serializer for TokenReservation model
    """
    user = serializers.ReadOnlyField(source='user.username')
    is_paid = serializers.ReadOnlyField()
    is_pending = serializers.ReadOnlyField()
    
    class Meta:
        model = TokenReservation
        fields = [
            'id', 'user', 'amount_usd', 'tokens_amount', 'payment_method',
            'payment_status', 'transaction_hash', 'wallet_address',
            'created_at', 'updated_at', 'payment_date', 'referral_code',
            'notes', 'is_paid', 'is_pending'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'is_paid', 'is_pending']


class TokenReservationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating token reservations
    """
    class Meta:
        model = TokenReservation
        fields = [
            'amount_usd', 'payment_method', 'wallet_address', 'referral_code'
        ]
    
    def validate_amount_usd(self, value):
        from django.conf import settings
        min_purchase = getattr(settings, 'MIN_PURCHASE_USD', 10)
        max_purchase = getattr(settings, 'MAX_PURCHASE_USD', 10000)
        
        if value < min_purchase:
            raise serializers.ValidationError(f"Minimum purchase amount is ${min_purchase}")
        if value > max_purchase:
            raise serializers.ValidationError(f"Maximum purchase amount is ${max_purchase}")
        
        return value
    
    def create(self, validated_data):
        from django.conf import settings
        user = self.context['request'].user
        
        # Calculate tokens based on USD amount and token price
        token_price = getattr(settings, 'TOKEN_PRICE_USD', 0.10)
        tokens_amount = validated_data['amount_usd'] / token_price
        
        validated_data['user'] = user
        validated_data['tokens_amount'] = tokens_amount
        
        return super().create(validated_data)


class FaucetRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for FaucetRequest model
    """
    user = serializers.ReadOnlyField(source='user.username')
    processed_by = serializers.ReadOnlyField(source='processed_by.username')
    is_processed = serializers.ReadOnlyField()
    
    class Meta:
        model = FaucetRequest
        fields = [
            'id', 'user', 'network', 'wallet_address', 'amount_requested',
            'status', 'transaction_hash', 'processed_by', 'created_at',
            'updated_at', 'processed_at', 'reason', 'is_processed'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'is_processed']


class FaucetRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating faucet requests
    """
    class Meta:
        model = FaucetRequest
        fields = ['network', 'wallet_address', 'amount_requested', 'reason']
    
    def create(self, validated_data):
        request = self.context['request']
        validated_data['user'] = request.user
        validated_data['ip_address'] = self.get_client_ip(request)
        validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ReferralProgramSerializer(serializers.ModelSerializer):
    """
    Serializer for ReferralProgram model
    """
    referrer = serializers.ReadOnlyField(source='referrer.username')
    referred_user = serializers.ReadOnlyField(source='referred_user.username')
    
    class Meta:
        model = ReferralProgram
        fields = [
            'id', 'referrer', 'referred_user', 'referral_code',
            'commission_earned', 'tokens_earned', 'is_active', 'is_paid_out',
            'created_at', 'updated_at', 'paid_out_at'
        ]
        read_only_fields = ['id', 'referrer', 'referred_user', 'created_at', 'updated_at']


class ReferralCodeSerializer(serializers.ModelSerializer):
    """
    Serializer for ReferralCode model
    """
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = ReferralCode
        fields = [
            'id', 'user', 'code', 'is_active', 'total_referrals',
            'total_commission', 'total_tokens', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for NewsletterSubscription model
    """
    class Meta:
        model = NewsletterSubscription
        fields = [
            'id', 'email', 'user', 'is_active', 'subscription_type',
            'created_at', 'updated_at', 'unsubscribed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NewsletterSubscriptionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating newsletter subscriptions
    """
    class Meta:
        model = NewsletterSubscription
        fields = ['email', 'subscription_type']
    
    def create(self, validated_data):
        request = self.context['request']
        if request.user.is_authenticated:
            validated_data['user'] = request.user
        
        validated_data['ip_address'] = self.get_client_ip(request)
        validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ContactFormSerializer(serializers.ModelSerializer):
    """
    Serializer for ContactForm model
    """
    assigned_to = serializers.ReadOnlyField(source='assigned_to.username')
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = ContactForm
        fields = [
            'id', 'name', 'email', 'subject', 'message', 'status',
            'assigned_to', 'created_at', 'updated_at', 'resolved_at',
            'user'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactFormCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating contact form submissions
    """
    class Meta:
        model = ContactForm
        fields = ['name', 'email', 'subject', 'message']
    
    def create(self, validated_data):
        request = self.context['request']
        if request.user.is_authenticated:
            validated_data['user'] = request.user
        
        validated_data['ip_address'] = self.get_client_ip(request)
        validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ICOStatsSerializer(serializers.ModelSerializer):
    """
    Serializer for ICOStats model
    """
    class Meta:
        model = ICOStats
        fields = [
            'id', 'date', 'total_raised_usd', 'total_tokens_sold',
            'total_reservations', 'total_payments', 'new_users',
            'active_users', 'total_users', 'total_referrals',
            'referral_commissions', 'ethereum_payments', 'polygon_payments',
            'bsc_payments', 'solana_payments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ICOOverviewSerializer(serializers.Serializer):
    """
    Serializer for ICO overview statistics
    """
    total_raised_usd = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_tokens_sold = serializers.DecimalField(max_digits=20, decimal_places=8)
    total_reservations = serializers.IntegerField()
    total_payments = serializers.IntegerField()
    total_users = serializers.IntegerField()
    total_referrals = serializers.IntegerField()
    token_price_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    ico_start_date = serializers.DateTimeField()
    ico_end_date = serializers.DateTimeField()
    is_ico_active = serializers.BooleanField() 