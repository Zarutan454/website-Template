from rest_framework import serializers
from bsn_social_network.models import ICOTokenReservation, ICOConfiguration

class ICOTokenReservationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ICOTokenReservation
        fields = [
            'id', 'user', 'user_username', 'user_email', 'amount_usd', 
            'tokens_reserved', 'payment_method', 'payment_address', 
            'transaction_hash', 'status', 'payment_amount', 'payment_currency',
            'exchange_rate', 'confirmation_blocks', 'required_confirmations',
            'expires_at', 'confirmed_at', 'completed_at', 'notes', 
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_username', 'user_email', 'tokens_reserved',
            'transaction_hash', 'status', 'payment_amount', 'payment_currency',
            'exchange_rate', 'confirmation_blocks', 'confirmed_at', 
            'completed_at', 'created_at', 'updated_at'
        ]
    
    def validate_amount_usd(self, value):
        import os
        min_purchase = float(os.getenv('MIN_PURCHASE_USD', 10))
        max_purchase = float(os.getenv('MAX_PURCHASE_USD', 10000))
        
        if value < min_purchase:
            raise serializers.ValidationError(
                f'Amount must be at least ${min_purchase}'
            )
        if value > max_purchase:
            raise serializers.ValidationError(
                f'Amount cannot exceed ${max_purchase}'
            )
        return value
    
    def validate_payment_address(self, value):
        # Basic validation for different blockchain addresses
        if len(value) < 26 or len(value) > 44:
            raise serializers.ValidationError(
                'Payment address must be between 26 and 44 characters'
            )
        return value

class ICOConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ICOConfiguration
        fields = ['key', 'value', 'description', 'is_active'] 