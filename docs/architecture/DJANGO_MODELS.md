# BSN Django-Modelle

Diese Dokumentation beschreibt die Django-Modelle, die für das BSN (Blockchain Social Network) Backend verwendet werden. Die Modelle sind nach Funktionsbereichen organisiert.

## Benutzer-Modelle

### CustomUser

Erweitertes Django-User-Modell mit zusätzlichen Feldern für BSN-spezifische Funktionen.

```python
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Tracking-Informationen
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_user_agent = models.TextField(null=True, blank=True)
    
    # Referral-Informationen
    referred_by = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals'
    )
    
    # Web3-Informationen
    wallet_address = models.CharField(max_length=42, null=True, blank=True)
    is_wallet_verified = models.BooleanField(default=False)
    
    # Einstellungen
    notification_preferences = models.JSONField(default=dict)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
```

### UserProfile

Erweitertes Profil für Benutzer mit zusätzlichen Informationen.

```python
class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=50, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    cover_image_url = models.URLField(null=True, blank=True)
    
    # Social Media Links
    twitter_handle = models.CharField(max_length=15, null=True, blank=True)
    instagram_handle = models.CharField(max_length=30, null=True, blank=True)
    website_url = models.URLField(null=True, blank=True)
    
    # BSN-spezifische Informationen
    pre_token_balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    level = models.IntegerField(default=1)
    experience_points = models.IntegerField(default=0)
    
    # Tracking
    last_active = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.email}"
```

## Authentifizierungs-Modelle

### EmailVerification

Modell für die E-Mail-Verifizierung.

```python
class EmailVerification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Email verification for {self.user.email}"
    
    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now()
```

### PasswordReset

Modell für das Zurücksetzen des Passworts.

```python
class PasswordReset(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Password reset for {self.user.email}"
    
    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now()
```

## Faucet-Modelle

### FaucetClaim

Modell für Faucet-Claims.

```python
class FaucetClaim(models.Model):
    CLAIM_TYPES = [
        ('standard', 'Standard Claim'),
        ('activity_boost', 'Activity Boost'),
        ('weekly_bonus', 'Weekly Bonus'),
        ('referral_bonus', 'Referral Bonus'),
        ('community_bonus', 'Community Bonus'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='faucet_claims')
    claim_type = models.CharField(max_length=20, choices=CLAIM_TYPES, default='standard')
    amount = models.DecimalField(max_digits=10, decimal_places=4)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username}: {self.claim_type} - {self.amount} BSN at {self.timestamp}"
```

### FaucetSettings

Modell für Faucet-Einstellungen pro Benutzer.

```python
class FaucetSettings(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='faucet_settings')
    next_standard_claim = models.DateTimeField()
    next_weekly_claim = models.DateTimeField()
    consecutive_days = models.IntegerField(default=0)
    last_active_date = models.DateField()
    total_claimed = models.DecimalField(max_digits=15, decimal_places=4, default=0)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username}: Next claim at {self.next_standard_claim}"
```

### FaucetActivity

Modell für Faucet-Aktivitäten.

```python
class FaucetActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('interaction', 'Platform Interaction'),
        ('profile_update', 'Profile Update'),
        ('referral', 'Referral'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='faucet_activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username}: {self.activity_type} at {self.timestamp}"
```

### FaucetConfiguration

Modell für globale Faucet-Konfigurationen.

```python
class FaucetConfiguration(models.Model):
    standard_amount = models.DecimalField(max_digits=10, decimal_places=4, default=1.0)
    activity_boost_amount = models.DecimalField(max_digits=10, decimal_places=4, default=1.5)
    weekly_bonus_amount = models.DecimalField(max_digits=10, decimal_places=4, default=5.0)
    referral_bonus_amount = models.DecimalField(max_digits=10, decimal_places=4, default=2.0)
    community_bonus_amount = models.DecimalField(max_digits=10, decimal_places=4, default=3.0)
    
    standard_interval_hours = models.IntegerField(default=24)
    weekly_interval_days = models.IntegerField(default=7)
    
    captcha_required = models.BooleanField(default=True)
    max_claims_per_day = models.IntegerField(default=1)
    max_claims_per_week = models.IntegerField(default=7)
    
    is_active = models.BooleanField(default=True)
    maintenance_message = models.TextField(null=True, blank=True)
    
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='+')
    
    def __str__(self):
        return f"Faucet Config (Last updated: {self.last_updated})"
```

## Referral-Modelle

### ReferralCode

Modell für Referral-Codes.

```python
class ReferralCode(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='referral_code')
    code = models.CharField(max_length=16, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.code:
            # Generiere einen einzigartigen Code, wenn keiner vorhanden ist
            self.code = self._generate_unique_code()
        super().save(*args, **kwargs)
    
    def _generate_unique_code(self):
        # Implementierung der Code-Generierung
        import uuid
        return str(uuid.uuid4())[:8]
    
    def __str__(self):
        return f"{self.user.username}: {self.code}"
```

### Referral

Modell für Referral-Verbindungen.

```python
class Referral(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    referrer = models.ForeignKey(CustomUser, related_name='referrals_made', on_delete=models.CASCADE)
    referee = models.ForeignKey(CustomUser, related_name='referred_by_rel', on_delete=models.CASCADE)
    code_used = models.CharField(max_length=16)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reward_amount_referrer = models.DecimalField(max_digits=10, decimal_places=4, default=0.5)
    reward_amount_referee = models.DecimalField(max_digits=10, decimal_places=4, default=0.2)
    reward_paid_referrer = models.BooleanField(default=False)
    reward_paid_referee = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('referrer', 'referee')
    
    def __str__(self):
        return f"{self.referrer.username} referred {self.referee.username}"
```

### ReferralActivity

Modell für Referral-Aktivitäten.

```python
class ReferralActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('profile_complete', 'Profile Completed'),
        ('faucet_claim', 'Faucet Claim'),
        ('token_reserve', 'Token Reservation'),
        ('post', 'Post Created'),
        ('comment', 'Comment Created'),
    ]
    
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.referral.referee.username}: {self.activity_type} at {self.timestamp}"
```

### ReferralMilestone

Modell für Referral-Meilensteine.

```python
class ReferralMilestone(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='referral_milestones')
    milestone_level = models.IntegerField()  # 5, 10, 25, 50, 100
    reward_amount = models.DecimalField(max_digits=10, decimal_places=4)
    achieved_at = models.DateTimeField(auto_now_add=True)
    reward_paid = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('user', 'milestone_level')
    
    def __str__(self):
        return f"{self.user.username}: Level {self.milestone_level} at {self.achieved_at}"
```

## Token-Reservierungs-Modelle

### TokenReservation

Modell für Token-Reservierungen.

```python
class TokenReservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='token_reservations')
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    price_per_token = models.DecimalField(max_digits=10, decimal_places=4)
    total_value_usd = models.DecimalField(max_digits=10, decimal_places=2)
    phase = models.CharField(max_length=20)  # seed, private, early, public
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)
    
    # Tracking-Informationen
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    country_code = models.CharField(max_length=3, null=True, blank=True)
    
    # Rechtliche Bestätigungen
    terms_accepted = models.BooleanField(default=False)
    not_us_citizen = models.BooleanField(default=False)
    not_restricted_country = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}: {self.amount} BSN at {self.price_per_token} USD"
```

### Whitelist

Modell für die Whitelist.

```python
class Whitelist(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='whitelist')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    application_date = models.DateTimeField(auto_now_add=True)
    review_date = models.DateTimeField(null=True, blank=True)
    reviewer = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='+')
    notes = models.TextField(null=True, blank=True)
    
    # Qualifikationskriterien
    registration_date = models.DateTimeField()
    days_active = models.IntegerField(default=0)
    faucet_claims = models.IntegerField(default=0)
    successful_referrals = models.IntegerField(default=0)
    community_contributions = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}: {self.status}"
```

### SalePhaseConfiguration

Modell für die Konfiguration der Sale-Phasen.

```python
class SalePhaseConfiguration(models.Model):
    phase_name = models.CharField(max_length=20, unique=True)  # seed, private, early, public
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    price_per_token = models.DecimalField(max_digits=10, decimal_places=4)
    min_reservation = models.DecimalField(max_digits=18, decimal_places=8)
    max_reservation = models.DecimalField(max_digits=18, decimal_places=8)
    total_allocation = models.DecimalField(max_digits=18, decimal_places=8)
    remaining_allocation = models.DecimalField(max_digits=18, decimal_places=8)
    whitelist_only = models.BooleanField(default=False)
    kyc_required = models.BooleanField(default=False)
    kyc_threshold_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.phase_name}: {self.price_per_token} USD ({self.start_date} - {self.end_date})"
```

## Newsletter-Modelle

### NewsletterSubscription

Modell für Newsletter-Abonnements.

```python
class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    interests = models.JSONField(default=list)
    unsubscribe_token = models.UUIDField(default=uuid.uuid4, editable=False)
    
    # Tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    # Optionale Verknüpfung mit einem Benutzer
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='newsletter_subscriptions')
    
    def __str__(self):
        return self.email
```

## Mining-Modelle

### MiningSession

Modell für Mining-Sessions.

```python
class MiningSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_heartbeat = models.DateTimeField(auto_now_add=True)
    
    # Mining-Statistiken für diese Session
    base_rate = models.DecimalField(max_digits=10, decimal_places=6)
    current_rate = models.DecimalField(max_digits=10, decimal_places=6)
    tokens_mined = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    
    def __str__(self):
        return f"{self.user.username}: Session from {self.start_time}"
```

### BoostType

Modell für Boost-Typen.

```python
class BoostType(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    multiplier = models.DecimalField(max_digits=5, decimal_places=2)
    duration_minutes = models.IntegerField()
    action_type = models.CharField(max_length=50)  # post, comment, like, etc.
    
    def __str__(self):
        return f"{self.name}: {self.multiplier}x for {self.duration_minutes} min"
```

### ActiveBoost

Modell für aktive Boosts.

```python
class ActiveBoost(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    boost_type = models.ForeignKey(BoostType, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username}: {self.boost_type.name} until {self.end_time}"
```

### DailyMiningStats

Modell für tägliche Mining-Statistiken.

```python
class DailyMiningStats(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    tokens_mined = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    daily_limit = models.DecimalField(max_digits=18, decimal_places=8)
    remaining_limit = models.DecimalField(max_digits=18, decimal_places=8)
    
    class Meta:
        unique_together = ('user', 'date')
    
    def __str__(self):
        return f"{self.user.username}: {self.tokens_mined} on {self.date}"
```
