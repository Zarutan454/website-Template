# Security Enhancements - BSN Social Network

## Overview
Diese Dokumentation beschreibt alle Security-Enhancements für das BSN Social Network mit Fokus auf API-Sicherheit, Daten-Schutz und Authentifizierung.

## Security Layers

### 1. API Security
- **Rate Limiting**: Schutz vor DDoS und Brute-Force-Attacken
- **Input Validation**: XSS und SQL-Injection-Schutz
- **Request Signing**: HMAC-basierte Request-Validierung
- **CORS Configuration**: Cross-Origin Resource Sharing

### 2. Authentication Security
- **JWT Token Management**: Sichere Token-Generierung und -Validierung
- **Session Management**: Sichere Session-Verwaltung
- **Password Security**: Bcrypt-Hashing und Validierung
- **Multi-Factor Authentication**: Zusätzliche Sicherheitsebene

### 3. Data Protection
- **Data Encryption**: Verschlüsselung sensibler Daten
- **Privacy Controls**: Nutzer-Datenschutz-Einstellungen
- **GDPR Compliance**: DSGVO-konforme Datenverarbeitung
- **Data Anonymization**: Anonymisierung für Analytics

## API Security Implementation

### Rate Limiting Configuration
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'profile': '100/hour',
        'upload': '20/hour',
        'search': '50/hour',
    }
}
```

### Request Validation Middleware
```python
# middleware/security.py
import hashlib
import hmac
from django.http import HttpResponseForbidden

class RequestSignatureMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.secret_key = settings.SECURITY_SECRET_KEY

    def __call__(self, request):
        if request.path.startswith('/api/'):
            if not self.validate_signature(request):
                return HttpResponseForbidden('Invalid request signature')
        
        return self.get_response(request)

    def validate_signature(self, request):
        signature = request.headers.get('X-Request-Signature')
        if not signature:
            return False
        
        # Create expected signature
        message = f"{request.method}{request.path}{request.body.decode()}"
        expected_signature = hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
```

### Input Sanitization
```python
# utils/security.py
import re
from html import escape

def sanitize_input(data):
    """Sanitize user input to prevent XSS and injection attacks"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>',
        ]
        
        for pattern in dangerous_patterns:
            data = re.sub(pattern, '', data, flags=re.IGNORECASE)
        
        # HTML escape remaining content
        data = escape(data)
        
        return data.strip()
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data
```

## Authentication Security

### JWT Token Security
```python
# settings.py
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    
    'JTI_CLAIM': 'jti',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}
```

### Password Security
```python
# models.py
from django.contrib.auth.hashers import make_password, check_password
from django.core.validators import RegexValidator

class User(AbstractUser):
    password_validator = RegexValidator(
        regex=r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
        message='Password must contain at least 8 characters, one letter, one number, and one special character.'
    )
    
    def save(self, *args, **kwargs):
        if self._state.adding and self.password:
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
```

### Session Security
```python
# settings.py
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 3600  # 1 hour

# CSRF Protection
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
```

## Data Protection

### Data Encryption
```python
# utils/encryption.py
from cryptography.fernet import Fernet
from django.conf import settings
import base64

class DataEncryption:
    def __init__(self):
        self.cipher_suite = Fernet(settings.ENCRYPTION_KEY)
    
    def encrypt_data(self, data):
        """Encrypt sensitive data"""
        if isinstance(data, str):
            return self.cipher_suite.encrypt(data.encode()).decode()
        return data
    
    def decrypt_data(self, encrypted_data):
        """Decrypt sensitive data"""
        if isinstance(encrypted_data, str):
            try:
                return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
            except:
                return encrypted_data
        return encrypted_data
```

### Privacy Controls
```python
# models.py
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Privacy settings
    is_public = models.BooleanField(default=True)
    show_email = models.BooleanField(default=False)
    show_phone = models.BooleanField(default=False)
    show_location = models.BooleanField(default=True)
    show_birth_date = models.BooleanField(default=False)
    
    # Data retention
    data_retention_days = models.IntegerField(default=365)
    allow_analytics = models.BooleanField(default=True)
    allow_marketing = models.BooleanField(default=False)
    
    def get_public_data(self):
        """Return only public profile data"""
        data = {
            'username': self.user.username,
            'bio': self.bio if self.is_public else None,
        }
        
        if self.show_location:
            data['location'] = self.location
        
        return data
```

## File Upload Security

### File Validation
```python
# utils/file_validation.py
import magic
import os
from django.core.exceptions import ValidationError

class FileValidator:
    ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ]
    
    @classmethod
    def validate_file(cls, file):
        """Validate uploaded file for security"""
        # Check file size
        if file.size > cls.MAX_FILE_SIZE:
            raise ValidationError(f'File size must be under {cls.MAX_FILE_SIZE} bytes')
        
        # Check file extension
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise ValidationError(f'File type {ext} is not allowed')
        
        # Check MIME type
        mime_type = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)  # Reset file pointer
        
        if mime_type not in cls.ALLOWED_MIME_TYPES:
            raise ValidationError(f'MIME type {mime_type} is not allowed')
        
        return True
```

### Secure File Storage
```python
# storage.py
from django.core.files.storage import FileSystemStorage
import os
import uuid

class SecureFileStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        """Generate secure filename with UUID"""
        ext = os.path.splitext(name)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        return filename
    
    def url(self, name):
        """Generate secure URL for files"""
        url = super().url(name)
        # Add additional security headers
        return url
```

## Security Headers

### Security Middleware
```python
# middleware/security_headers.py
class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        return response
```

## Monitoring & Logging

### Security Event Logging
```python
# utils/security_logging.py
import logging
from django.utils import timezone

security_logger = logging.getLogger('security')

class SecurityLogger:
    @staticmethod
    def log_failed_login(username, ip_address):
        security_logger.warning(
            f'Failed login attempt for user {username} from IP {ip_address} at {timezone.now()}'
        )
    
    @staticmethod
    def log_suspicious_activity(user_id, activity_type, details):
        security_logger.warning(
            f'Suspicious activity detected: User {user_id}, Type: {activity_type}, Details: {details}'
        )
    
    @staticmethod
    def log_rate_limit_exceeded(ip_address, endpoint):
        security_logger.info(
            f'Rate limit exceeded: IP {ip_address}, Endpoint: {endpoint}'
        )
```

### Security Monitoring
```python
# monitoring/security_monitor.py
from django.core.cache import cache
from django.utils import timezone

class SecurityMonitor:
    @staticmethod
    def track_failed_attempts(username, ip_address):
        """Track failed login attempts"""
        key = f'failed_login_{ip_address}'
        attempts = cache.get(key, 0) + 1
        cache.set(key, attempts, timeout=300)  # 5 minutes
        
        if attempts >= 5:
            # Block IP temporarily
            cache.set(f'blocked_ip_{ip_address}', True, timeout=1800)  # 30 minutes
            return False
        return True
    
    @staticmethod
    def is_ip_blocked(ip_address):
        """Check if IP is blocked"""
        return cache.get(f'blocked_ip_{ip_address}', False)
    
    @staticmethod
    def track_api_usage(user_id, endpoint):
        """Track API usage for anomaly detection"""
        key = f'api_usage_{user_id}_{endpoint}'
        usage = cache.get(key, 0) + 1
        cache.set(key, usage, timeout=3600)  # 1 hour
        
        # Alert if usage is suspicious
        if usage > 100:  # Threshold
            SecurityLogger.log_suspicious_activity(
                user_id, 'high_api_usage', f'{endpoint}: {usage} requests'
            )
```

## GDPR Compliance

### Data Processing Consent
```python
# models.py
class DataConsent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    consent_type = models.CharField(max_length=50)  # analytics, marketing, etc.
    granted = models.BooleanField(default=False)
    granted_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'consent_type']

class DataRetentionPolicy(models.Model):
    data_type = models.CharField(max_length=50)
    retention_days = models.IntegerField()
    anonymize_after_days = models.IntegerField()
    delete_after_days = models.IntegerField()
```

### Data Anonymization
```python
# utils/anonymization.py
import hashlib

class DataAnonymizer:
    @staticmethod
    def anonymize_user_data(user_data):
        """Anonymize user data for analytics"""
        anonymized = {}
        
        # Hash sensitive fields
        if 'email' in user_data:
            anonymized['email_hash'] = hashlib.sha256(
                user_data['email'].encode()
            ).hexdigest()
        
        if 'username' in user_data:
            anonymized['username_hash'] = hashlib.sha256(
                user_data['username'].encode()
            ).hexdigest()
        
        # Keep non-sensitive data
        anonymized['created_at'] = user_data.get('created_at')
        anonymized['location'] = user_data.get('location')
        
        return anonymized
```

## Security Testing

### Security Test Cases
```python
# tests/test_security.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

class SecurityTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_rate_limiting(self):
        """Test rate limiting on API endpoints"""
        for _ in range(101):
            response = self.client.get('/api/users/profile/testuser/')
        
        self.assertEqual(response.status_code, 429)
    
    def test_xss_protection(self):
        """Test XSS protection"""
        malicious_data = {
            'bio': '<script>alert("xss")</script>'
        }
        
        response = self.client.post('/api/users/profile/', malicious_data)
        self.assertNotIn('<script>', response.content.decode())
    
    def test_sql_injection_protection(self):
        """Test SQL injection protection"""
        malicious_username = "'; DROP TABLE users; --"
        
        response = self.client.get(f'/api/users/profile/{malicious_username}/')
        self.assertEqual(response.status_code, 404)
```

## Security Checklist

### Implementation Checklist
- [ ] Rate limiting implemented
- [ ] Input validation and sanitization
- [ ] JWT token security configured
- [ ] Password hashing implemented
- [ ] Session security configured
- [ ] File upload validation
- [ ] Security headers implemented
- [ ] CORS configuration
- [ ] CSRF protection enabled
- [ ] Data encryption implemented
- [ ] Privacy controls implemented
- [ ] GDPR compliance measures
- [ ] Security monitoring setup
- [ ] Security logging configured
- [ ] Security testing implemented

### Regular Security Audits
- [ ] Monthly security reviews
- [ ] Quarterly penetration testing
- [ ] Annual GDPR compliance audit
- [ ] Continuous vulnerability scanning
- [ ] Security patch management
- [ ] Access control reviews
- [ ] Data retention policy reviews

## Incident Response

### Security Incident Response Plan
1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Impact analysis and severity classification
3. **Containment**: Immediate response to limit damage
4. **Eradication**: Remove threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Document and improve processes

### Security Contacts
- **Security Team**: security@bsn.com
- **Data Protection Officer**: dpo@bsn.com
- **Incident Response**: incident@bsn.com
- **Emergency Contact**: +1-555-SECURITY

## Compliance & Standards

### Standards Compliance
- **OWASP Top 10**: Web application security
- **GDPR**: Data protection regulation
- **ISO 27001**: Information security management
- **SOC 2**: Security, availability, and confidentiality
- **PCI DSS**: Payment card industry security

### Security Certifications
- [ ] SSL/TLS Certificate
- [ ] Security Headers Implementation
- [ ] Vulnerability Assessment
- [ ] Penetration Testing
- [ ] Security Audit Certification

## Next Steps

### Phase 1: Basic Security (Week 1-2)
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Configure security headers
- [ ] Set up basic monitoring

### Phase 2: Advanced Security (Week 3-4)
- [ ] Implement data encryption
- [ ] Add privacy controls
- [ ] Set up security logging
- [ ] Implement GDPR compliance

### Phase 3: Security Testing (Week 5-6)
- [ ] Conduct security testing
- [ ] Perform penetration testing
- [ ] Implement security monitoring
- [ ] Set up incident response

### Phase 4: Compliance & Audit (Week 7-8)
- [ ] GDPR compliance audit
- [ ] Security certification
- [ ] Documentation completion
- [ ] Training and awareness 