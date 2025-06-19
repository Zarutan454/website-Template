from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class TokenReservation(models.Model):
    """
    Token reservation for ICO
    """
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
    ]
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='token_reservations')
    
    # Reservation details
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2)
    tokens_amount = models.DecimalField(max_digits=20, decimal_places=8)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    
    # Payment information
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    wallet_address = models.CharField(max_length=42)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_date = models.DateTimeField(blank=True, null=True)
    
    # Additional information
    referral_code = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'token_reservations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reservation {self.id} - {self.user.email} - ${self.amount_usd}"
    
    @property
    def is_paid(self):
        return self.payment_status == 'completed'
    
    @property
    def is_pending(self):
        return self.payment_status == 'pending'


class FaucetRequest(models.Model):
    """
    Faucet requests for test tokens
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    NETWORK_CHOICES = [
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
    ]
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='faucet_requests')
    
    # Request details
    network = models.CharField(max_length=20, choices=NETWORK_CHOICES)
    wallet_address = models.CharField(max_length=42)
    amount_requested = models.DecimalField(max_digits=10, decimal_places=6)
    
    # Status and processing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_faucet_requests')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    # Additional information
    reason = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    class Meta:
        db_table = 'faucet_requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Faucet request {self.id} - {self.wallet_address} - {self.network}"
    
    @property
    def is_processed(self):
        return self.status in ['approved', 'rejected', 'completed']


class ReferralProgram(models.Model):
    """
    Referral program tracking
    """
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referred_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_received')
    
    # Referral details
    referral_code = models.CharField(max_length=20)
    commission_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tokens_earned = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_paid_out = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_out_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'referral_program'
        unique_together = ['referrer', 'referred_user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Referral: {self.referrer.username} -> {self.referred_user.username}"


class ReferralCode(models.Model):
    """
    User referral codes
    """
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referral_code')
    
    # Code details
    code = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)
    
    # Statistics
    total_referrals = models.PositiveIntegerField(default=0)
    total_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_tokens = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'referral_codes'
    
    def __str__(self):
        return f"Referral code {self.code} for {self.user.username}"


class NewsletterSubscription(models.Model):
    """
    Newsletter subscriptions
    """
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='newsletter_subscriptions', blank=True, null=True)
    
    # Subscription details
    is_active = models.BooleanField(default=True)
    subscription_type = models.CharField(
        max_length=20,
        choices=[
            ('general', 'General Newsletter'),
            ('ico_updates', 'ICO Updates'),
            ('technical', 'Technical Updates'),
            ('all', 'All Updates'),
        ],
        default='general'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    unsubscribed_at = models.DateTimeField(blank=True, null=True)
    
    # Additional information
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'newsletter_subscriptions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Newsletter subscription for {self.email}"


class ContactForm(models.Model):
    """
    Contact form submissions
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    # Status and processing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_contacts')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    
    # Additional information
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contact_submissions')
    
    class Meta:
        db_table = 'contact_forms'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Contact form from {self.name} - {self.subject}"


class ICOStats(models.Model):
    """
    ICO statistics and metrics
    """
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True)
    
    # Financial metrics
    total_raised_usd = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_tokens_sold = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    total_reservations = models.PositiveIntegerField(default=0)
    total_payments = models.PositiveIntegerField(default=0)
    
    # User metrics
    new_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    total_users = models.PositiveIntegerField(default=0)
    
    # Referral metrics
    total_referrals = models.PositiveIntegerField(default=0)
    referral_commissions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Network distribution
    ethereum_payments = models.PositiveIntegerField(default=0)
    polygon_payments = models.PositiveIntegerField(default=0)
    bsc_payments = models.PositiveIntegerField(default=0)
    solana_payments = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ico_stats'
        ordering = ['-date']
    
    def __str__(self):
        return f"ICO Stats for {self.date} - ${self.total_raised_usd}" 