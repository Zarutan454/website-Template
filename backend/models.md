# BSN Backend - Modelle

Dieses Dokument beschreibt die Datenbankmodelle des BSN-Backends.

## User App

### CustomUser

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """Erweitertes User-Modell mit zusätzlichen Feldern für BSN."""
    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)
    wallet_address = models.CharField(max_length=42, blank=True, null=True)
    wallet_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
```

### UserProfile

```python
from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    """Profil mit zusätzlichen Informationen zum User."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    pre_token_balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    last_faucet_claim = models.DateTimeField(null=True, blank=True)
    invited_count = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"Profile for {self.user.username}"
```

## Landing App

### FaucetClaim

```python
from django.db import models
from django.conf import settings

class FaucetClaim(models.Model):
    """Speichert Informationen zu Token-Claims über den Faucet."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='faucet_claims')
    amount = models.DecimalField(max_digits=10, decimal_places=4, default=0.1)
    claimed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-claimed_at']
        
    def __str__(self):
        return f"{self.user.username} claimed {self.amount} at {self.claimed_at}"
```

### ReferralCode

```python
import uuid
from django.db import models
from django.conf import settings

class ReferralCode(models.Model):
    """Speichert den Referral-Code eines Benutzers."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referral_code')
    code = models.CharField(max_length=16, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.code:
            # Generiere einen einzigartigen Code, wenn keiner vorhanden ist
            self.code = str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username}: {self.code}"
```

### Referral

```python
from django.db import models
from django.conf import settings

class Referral(models.Model):
    """Speichert Informationen zu einer erfolgreichen Einladung."""
    referrer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='referrals_made', on_delete=models.CASCADE)
    referee = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='referred_by', on_delete=models.CASCADE)
    reward_amount = models.DecimalField(max_digits=10, decimal_places=4, default=0.5)
    created_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('referrer', 'referee')
    
    def __str__(self):
        return f"{self.referrer.username} referred {self.referee.username}"
```

### ReferralActivity

```python
from django.db import models

class ReferralActivity(models.Model):
    """Speichert Aktivitäten eines eingeladenen Benutzers zur Verifizierung."""
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('profile_complete', 'Profile Completed'),
        ('faucet_claim', 'Faucet Claim'),
        ('token_reserve', 'Token Reservation'),
    ]
    
    referral = models.ForeignKey('Referral', on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.referral.referee.username}: {self.activity_type} at {self.timestamp}"
```

### TokenReservation

```python
from django.db import models
from django.conf import settings

class TokenReservation(models.Model):
    """Speichert Informationen zu Token-Reservierungen."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='token_reservations')
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    payment_token = models.CharField(max_length=10)  # z.B. ETH, USDT, USDC
    wallet_address = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tx_hash = models.CharField(max_length=66, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}: {self.amount} BSN ({self.status})"
```

### NewsletterSubscription

```python
import uuid
from django.db import models

class NewsletterSubscription(models.Model):
    """Speichert Newsletter-Anmeldungen."""
    email = models.EmailField(unique=True)
    confirmed = models.BooleanField(default=False)
    token = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.token:
            # Generiere ein Token für Double-Opt-In
            self.token = str(uuid.uuid4())
        super().save(*args, **kwargs)
    
    def __str__(self):
        status = "Confirmed" if self.confirmed else "Pending"
        return f"{self.email} ({status})"
```
