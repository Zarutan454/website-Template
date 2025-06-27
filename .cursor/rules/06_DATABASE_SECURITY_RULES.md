# BSN Database & Security Regeln für Cursor

## 🗄️ Datenbank-Design Regeln

### Django Model Standards (Verpflichtend)
```python
# ✅ RICHTIG - BSN User Model mit allen erforderlichen Feldern
class User(AbstractUser):
    """BSN User model with mining, referral and security features."""
    
    # Profile fields
    bio = models.TextField(max_length=500, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    verified = models.BooleanField(default=False)
    
    # Contact & Verification
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Mining System
    mining_balance = models.DecimalField(
        max_digits=20, 
        decimal_places=8, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    daily_mining_claimed = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        default=0
    )
    mining_active = models.BooleanField(default=False)
    last_mining_activity = models.DateTimeField(null=True, blank=True)
    
    # Referral System
    referral_code = models.CharField(
        max_length=20, 
        unique=True, 
        null=True, 
        blank=True,
        db_index=True
    )
    referred_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='referrals'
    )
    referral_count = models.IntegerField(default=0)
    
    # Security & Anti-Fraud
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    last_ip_address = models.GenericIPAddressField(null=True, blank=True)
    suspicious_activity_score = models.IntegerField(default=0)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True, null=True)
    
    # Timestamps & Activity
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    login_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'bsn_users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['referral_code']),
            models.Index(fields=['mining_active']),
            models.Index(fields=['is_email_verified']),
            models.Index(fields=['created_at']),
            models.Index(fields=['last_activity']),
        ]
        
    def save(self, *args, **kwargs):
        # Generate referral code if not exists
        if not self.referral_code:
            self.referral_code = generate_unique_referral_code()
        
        # Email lowercase normalization
        if self.email:
            self.email = self.email.lower().strip()
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    # Security Methods
    def is_account_locked(self):
        """Check if account is locked due to failed attempts."""
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False
    
    def increment_failed_login(self):
        """Increment failed login attempts with auto-lock."""
        self.failed_login_attempts += 1
        
        if self.failed_login_attempts >= 5:
            # Lock account for 1 hour
            self.account_locked_until = timezone.now() + timedelta(hours=1)
            
        self.save(update_fields=['failed_login_attempts', 'account_locked_until'])
    
    def reset_failed_login(self):
        """Reset failed login attempts on successful login."""
        self.failed_login_attempts = 0
        self.account_locked_until = None
        self.save(update_fields=['failed_login_attempts', 'account_locked_until'])
    
    # Mining Methods
    def can_mine_today(self):
        """Check if user can mine today based on phase and limits."""
        current_phase = get_current_mining_phase()
        
        # No real mining in alpha/beta
        if current_phase in ['alpha', 'beta']:
            return False
        
        # Check daily limits
        if self.daily_mining_claimed >= settings.DAILY_MINING_LIMIT:
            return False
        
        # Security checks
        if self.is_banned or self.suspicious_activity_score > 100:
            return False
            
        return self.is_email_verified and self.is_active
    
    def get_current_mining_rate(self):
        """Calculate current mining rate with boosts."""
        base_rate = Decimal('0.01')  # 0.01 BSN per minute
        
        # Apply user-level multipliers
        if self.verified:
            base_rate *= Decimal('1.2')
        
        if self.referral_count > 10:
            base_rate *= Decimal('1.1')
        
        # Apply active boosts
        active_boosts = self.get_active_boosts()
        for boost in active_boosts:
            base_rate *= boost.multiplier
        
        return min(base_rate, Decimal('0.1'))  # Max 0.1 BSN/minute
```

### Sicherheits-relevante Models
```python
# ✅ RICHTIG - Security Audit Log
class SecurityAuditLog(models.Model):
    """Log all security-relevant events."""
    
    EVENT_TYPES = [
        ('login_success', 'Successful Login'),
        ('login_failed', 'Failed Login'),
        ('account_locked', 'Account Locked'),
        ('password_changed', 'Password Changed'),
        ('email_changed', 'Email Changed'),
        ('suspicious_mining', 'Suspicious Mining Activity'),
        ('api_abuse', 'API Abuse Detected'),
        ('multiple_accounts', 'Multiple Accounts Detected'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='security_logs'
    )
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # Risk Assessment
    risk_level = models.CharField(
        max_length=10,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')],
        default='low'
    )
    
    # Additional Data
    metadata = models.JSONField(default=dict, blank=True)
    resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'bsn_security_audit_logs'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['risk_level', 'resolved']),
            models.Index(fields=['ip_address']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.event_type} - {self.user} - {self.created_at}"

# ✅ RICHTIG - Anti-Fraud Detection
class FraudDetection(models.Model):
    """Track and analyze potentially fraudulent activities."""
    
    FRAUD_TYPES = [
        ('multiple_accounts', 'Multiple Accounts'),
        ('bot_activity', 'Bot Activity'),
        ('ip_abuse', 'IP Address Abuse'),
        ('mining_abuse', 'Mining System Abuse'),
        ('referral_fraud', 'Referral Fraud'),
        ('faucet_abuse', 'Faucet Abuse'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fraud_detections')
    fraud_type = models.CharField(max_length=30, choices=FRAUD_TYPES)
    confidence_score = models.FloatField()  # 0.0 to 1.0
    evidence = models.JSONField()
    
    # Network Analysis
    related_ips = models.JSONField(default=list)
    related_devices = models.JSONField(default=list)
    related_users = models.ManyToManyField(User, related_name='related_fraud_cases', blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('detected', 'Detected'),
            ('investigating', 'Investigating'),
            ('confirmed', 'Confirmed'),
            ('false_positive', 'False Positive'),
            ('resolved', 'Resolved')
        ],
        default='detected'
    )
    
    investigated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bsn_fraud_detections'
        indexes = [
            models.Index(fields=['user', 'fraud_type']),
            models.Index(fields=['confidence_score']),
            models.Index(fields=['status', 'created_at']),
        ]
```

## 🔐 Datenbank-Sicherheits-Regeln

### Query Optimization & Security
```python
# ✅ RICHTIG - Sichere und optimierte Queries
class UserQuerySet(models.QuerySet):
    """Custom QuerySet für sichere User-Queries."""
    
    def verified_users(self):
        """Return only verified users."""
        return self.filter(is_email_verified=True, is_active=True)
    
    def mining_eligible(self):
        """Return users eligible for mining."""
        return self.verified_users().filter(
            is_banned=False,
            suspicious_activity_score__lt=100
        )
    
    def with_mining_stats(self):
        """Prefetch mining-related data."""
        return self.select_related().prefetch_related(
            'mining_transactions',
            'daily_mining_stats'
        )
    
    def by_ip_address(self, ip_address):
        """Find users by IP address (security check)."""
        return self.filter(last_ip_address=ip_address)

class UserManager(BaseUserManager):
    """Custom User Manager with security features."""
    
    def get_queryset(self):
        return UserQuerySet(self.model, using=self._db)
    
    def create_user(self, email, password=None, **extra_fields):
        """Create user with security checks."""
        if not email:
            raise ValueError('Email ist erforderlich')
        
        # Normalize email
        email = self.normalize_email(email)
        
        # Check for existing users with same IP (anti-fraud)
        request = get_current_request()
        if request:
            ip_address = get_client_ip(request)
            recent_registrations = self.filter(
                last_ip_address=ip_address,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).count()
            
            if recent_registrations >= 3:
                raise ValidationError('Zu viele Registrierungen von dieser IP')
        
        # Create user
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        return user
    
    def verified_users(self):
        return self.get_queryset().verified_users()
    
    def mining_eligible(self):
        return self.get_queryset().mining_eligible()

# Add to User model
class User(AbstractUser):
    # ... other fields ...
    
    objects = UserManager()
```

### Secure Database Operations
```python
# ✅ RICHTIG - Sichere Mining-Operationen
@transaction.atomic
def process_mining_transaction(user, amount, transaction_type):
    """Atomic mining transaction with security checks."""
    
    # Validate phase
    current_phase = get_current_mining_phase()
    if current_phase in ['alpha', 'beta']:
        raise ValidationError('Mining not available in current phase')
    
    # Security checks
    if not validate_mining_eligibility(user):
        raise PermissionDenied('User not eligible for mining')
    
    # Check daily limits
    daily_stats = DailyMiningStats.objects.select_for_update().get_or_create(
        user=user,
        date=timezone.now().date(),
        defaults={'daily_limit': settings.DAILY_MINING_LIMIT}
    )[0]
    
    if daily_stats.remaining_limit < amount:
        raise ValidationError('Daily limit exceeded')
    
    try:
        # Create mining transaction
        transaction = MiningTransaction.objects.create(
            user=user,
            transaction_type=transaction_type,
            amount=amount,
            mining_phase=current_phase,
            is_simulation=False,
            ip_address=get_current_ip(),
            user_agent=get_current_user_agent()
        )
        
        # Update user balance
        user.mining_balance = F('mining_balance') + amount
        user.save(update_fields=['mining_balance'])
        
        # Update daily stats
        daily_stats.tokens_mined = F('tokens_mined') + amount
        daily_stats.remaining_limit = F('remaining_limit') - amount
        daily_stats.save(update_fields=['tokens_mined', 'remaining_limit'])
        
        # Log security event
        SecurityAuditLog.objects.create(
            user=user,
            event_type='mining_success',
            description=f'Mining transaction: {amount} BSN',
            ip_address=get_current_ip(),
            user_agent=get_current_user_agent(),
            risk_level='low',
            metadata={
                'amount': str(amount),
                'transaction_type': transaction_type,
                'mining_phase': current_phase
            }
        )
        
        return transaction
        
    except Exception as e:
        # Log failed transaction
        SecurityAuditLog.objects.create(
            user=user,
            event_type='mining_failed',
            description=f'Mining transaction failed: {str(e)}',
            ip_address=get_current_ip(),
            user_agent=get_current_user_agent(),
            risk_level='medium',
            metadata={
                'error': str(e),
                'amount': str(amount),
                'transaction_type': transaction_type
            }
        )
        raise

# ✅ RICHTIG - Sichere Faucet-Operationen
@transaction.atomic
def process_faucet_claim(user, claim_type, request):
    """Atomic faucet claim with anti-fraud checks."""
    
    # Anti-fraud checks
    if not validate_faucet_claim_eligibility(user, request):
        raise PermissionDenied('Faucet claim not eligible')
    
    # Get claim amount
    claim_amount = get_faucet_claim_amount(claim_type)
    
    try:
        # Create faucet claim record
        claim = FaucetClaim.objects.create(
            user=user,
            claim_type=claim_type,
            amount=claim_amount,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Update user balance
        user.faucet_balance = F('faucet_balance') + claim_amount
        user.save(update_fields=['faucet_balance'])
        
        # Update faucet settings
        faucet_settings = user.faucet_settings
        faucet_settings.total_claimed = F('total_claimed') + claim_amount
        faucet_settings.next_standard_claim = timezone.now() + timedelta(hours=24)
        faucet_settings.save(update_fields=['total_claimed', 'next_standard_claim'])
        
        return {
            'claim_id': claim.id,
            'amount': claim_amount,
            'next_claim': faucet_settings.next_standard_claim
        }
        
    except Exception as e:
        logger.error(f"Faucet claim failed for user {user.id}: {str(e)}")
        raise
```

## 🛡️ Sicherheits-Middleware und Utils

### Security Middleware
```python
# ✅ RICHTIG - Security Middleware für BSN
class BSNSecurityMiddleware:
    """Custom security middleware for BSN."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Pre-processing
        self.process_request(request)
        
        response = self.get_response(request)
        
        # Post-processing
        self.process_response(request, response)
        
        return response
    
    def process_request(self, request):
        """Process incoming request for security."""
        
        # Rate limiting check
        if self.is_rate_limited(request):
            raise PermissionDenied('Rate limit exceeded')
        
        # IP blacklist check
        client_ip = get_client_ip(request)
        if self.is_blacklisted_ip(client_ip):
            SecurityAuditLog.objects.create(
                event_type='blacklisted_access',
                description=f'Access attempt from blacklisted IP: {client_ip}',
                ip_address=client_ip,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                risk_level='high'
            )
            raise PermissionDenied('Access denied')
        
        # Bot detection
        if self.is_bot_request(request):
            self.handle_bot_request(request)
    
    def process_response(self, request, response):
        """Process outgoing response."""
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Log suspicious responses
        if response.status_code >= 400:
            self.log_error_response(request, response)
        
        return response
    
    def is_rate_limited(self, request):
        """Check if request is rate limited."""
        # Implementation depends on caching backend
        pass
    
    def is_blacklisted_ip(self, ip):
        """Check if IP is blacklisted."""
        # Check against IP blacklist
        return BlacklistedIP.objects.filter(ip_address=ip, is_active=True).exists()
    
    def is_bot_request(self, request):
        """Detect bot requests."""
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        bot_patterns = [
            'bot', 'crawler', 'spider', 'scraper',
            'python-requests', 'curl', 'wget'
        ]
        
        return any(pattern in user_agent for pattern in bot_patterns)
    
    def handle_bot_request(self, request):
        """Handle detected bot request."""
        # Log bot detection
        SecurityAuditLog.objects.create(
            event_type='bot_detected',
            description='Bot request detected',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            risk_level='medium'
        )

# ✅ RICHTIG - Anti-Fraud Utils
def detect_suspicious_activity(user, request):
    """Detect suspicious user activity."""
    
    risk_factors = []
    risk_score = 0
    
    # Multiple logins from different IPs
    recent_ips = SecurityAuditLog.objects.filter(
        user=user,
        event_type='login_success',
        created_at__gte=timezone.now() - timedelta(hours=24)
    ).values_list('ip_address', flat=True).distinct()
    
    if len(recent_ips) > 3:
        risk_factors.append('multiple_ips')
        risk_score += 30
    
    # Rapid-fire API requests
    recent_requests = SecurityAuditLog.objects.filter(
        user=user,
        created_at__gte=timezone.now() - timedelta(minutes=5)
    ).count()
    
    if recent_requests > 50:
        risk_factors.append('rapid_requests')
        risk_score += 40
    
    # Mining activity patterns
    mining_transactions = MiningTransaction.objects.filter(
        user=user,
        created_at__gte=timezone.now() - timedelta(hours=1)
    ).count()
    
    if mining_transactions > 60:  # More than 1 per minute
        risk_factors.append('excessive_mining')
        risk_score += 50
    
    # Update user risk score
    if risk_score > 0:
        user.suspicious_activity_score += risk_score
        user.save(update_fields=['suspicious_activity_score'])
        
        # Create fraud detection record if high risk
        if risk_score >= 70:
            FraudDetection.objects.create(
                user=user,
                fraud_type='bot_activity',
                confidence_score=risk_score / 100.0,
                evidence={
                    'risk_factors': risk_factors,
                    'risk_score': risk_score,
                    'detection_time': timezone.now().isoformat()
                }
            )
    
    return risk_score

def validate_mining_eligibility(user):
    """Comprehensive mining eligibility check."""
    
    # Basic checks
    if not user.is_active or not user.is_email_verified:
        return False
    
    # Phase check
    current_phase = get_current_mining_phase()
    if current_phase in ['alpha', 'beta']:
        return False
    
    # Security checks
    if user.is_banned or user.suspicious_activity_score > 100:
        return False
    
    # Account lock check
    if user.is_account_locked():
        return False
    
    # Daily limit check
    if user.daily_mining_claimed >= settings.DAILY_MINING_LIMIT:
        return False
    
    return True
```

## ⚠️ Datenbank & Security DON'Ts

### NIEMALS in Datenbank-Code:
```python
# ❌ NIEMALS - Raw SQL ohne Parameter
def get_user_data(user_id):
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")  # SQL Injection!

# ❌ NIEMALS - Passwörter im Klartext
user.password = "plaintext123"  # Use set_password()!

# ❌ NIEMALS - Sensitive Daten ohne Verschlüsselung
class User(models.Model):
    credit_card = models.CharField(max_length=16)  # DANGEROUS!

# ❌ NIEMALS - Queries ohne Indizes
User.objects.filter(email__icontains='test')  # Slow for large tables!

# ❌ NIEMALS - N+1 Query Problem
for user in User.objects.all():
    print(user.mining_transactions.count())  # N+1 Problem!

# ❌ NIEMALS - Unbegrenzte Queries
User.objects.all()  # Lädt alle Nutzer in Memory!
```

## ✅ Database & Security Checklist

Vor jedem DB-Schema-Update:
- [ ] Indizes für häufige Queries definiert
- [ ] Sensitive Daten verschlüsselt oder gehashed
- [ ] Foreign Key Constraints definiert
- [ ] ON DELETE-Strategien überlegt
- [ ] Migration-Script getestet
- [ ] Backup vor Schema-Änderung

Vor jeder Security-relevanten Änderung:
- [ ] Input Validation implementiert
- [ ] SQL Injection Prevention geprüft
- [ ] XSS Prevention implementiert
- [ ] Sensitive Daten logging vermieden
- [ ] Rate Limiting implementiert
- [ ] Audit Logging hinzugefügt
- [ ] Permissions/Authorization geprüft
- [ ] Error Handling ohne Info-Leakage

**Diese Datenbank- und Security-Regeln sind KRITISCH und BINDEND!** 