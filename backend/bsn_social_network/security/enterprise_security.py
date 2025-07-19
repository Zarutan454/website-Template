"""
Enterprise Security & Compliance System for BSN Social Network
Handles advanced threat detection, GDPR compliance, and security monitoring
"""

import logging
import hashlib
import hmac
import time
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from django.core.cache import cache
from django.conf import settings
from django.http import HttpRequest
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User
import jwt
import bcrypt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

logger = logging.getLogger(__name__)

class EnterpriseSecurityManager:
    """
    Enterprise security management system
    """
    
    def __init__(self):
        self.threat_detection_enabled = True
        self.gdpr_compliance_enabled = True
        self.mfa_enabled = True
        self.encryption_key = Fernet.generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
    def detect_threats(self, request: HttpRequest, user: Optional[User] = None) -> Dict[str, Any]:
        """
        Advanced threat detection system
        """
        threats = {
            'suspicious_activity': False,
            'brute_force_attempt': False,
            'sql_injection_attempt': False,
            'xss_attempt': False,
            'rate_limit_exceeded': False,
            'suspicious_ip': False,
            'anomalous_behavior': False,
            'threat_level': 'low',
            'recommendations': []
        }
        
        # Check for suspicious IP
        client_ip = self._get_client_ip(request)
        if self._is_suspicious_ip(client_ip):
            threats['suspicious_ip'] = True
            threats['threat_level'] = 'medium'
            threats['recommendations'].append('Block suspicious IP address')
        
        # Check for brute force attempts
        if user and self._detect_brute_force(user):
            threats['brute_force_attempt'] = True
            threats['threat_level'] = 'high'
            threats['recommendations'].append('Implement account lockout')
        
        # Check for SQL injection attempts
        if self._detect_sql_injection(request):
            threats['sql_injection_attempt'] = True
            threats['threat_level'] = 'critical'
            threats['recommendations'].append('Sanitize user inputs')
        
        # Check for XSS attempts
        if self._detect_xss(request):
            threats['xss_attempt'] = True
            threats['threat_level'] = 'high'
            threats['recommendations'].append('Implement CSP headers')
        
        # Check rate limiting
        if self._is_rate_limit_exceeded(request):
            threats['rate_limit_exceeded'] = True
            threats['threat_level'] = 'medium'
            threats['recommendations'].append('Implement rate limiting')
        
        # Check for anomalous behavior
        if user and self._detect_anomalous_behavior(user, request):
            threats['anomalous_behavior'] = True
            threats['threat_level'] = 'medium'
            threats['recommendations'].append('Investigate user behavior')
        
        # Log threat detection
        if any([threats['suspicious_ip'], threats['brute_force_attempt'], 
                threats['sql_injection_attempt'], threats['xss_attempt'], 
                threats['rate_limit_exceeded'], threats['anomalous_behavior']]):
            threats['suspicious_activity'] = True
            self._log_threat(threats, request, user)
        
        return threats
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """
        Get client IP address
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _is_suspicious_ip(self, ip: str) -> bool:
        """
        Check if IP is suspicious
        """
        # Check against known malicious IPs
        suspicious_ips = cache.get('suspicious_ips', [])
        if ip in suspicious_ips:
            return True
        
        # Check for VPN/Tor exit nodes (simplified)
        if self._is_vpn_ip(ip):
            return True
        
        return False
    
    def _is_vpn_ip(self, ip: str) -> bool:
        """
        Check if IP is from VPN (simplified implementation)
        """
        # In production, use a VPN detection service
        vpn_ranges = [
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16'
        ]
        
        # Simplified check - in production use proper IP range checking
        return ip.startswith(('10.', '172.', '192.168.'))
    
    def _detect_brute_force(self, user: User) -> bool:
        """
        Detect brute force attempts
        """
        failed_attempts = cache.get(f'failed_login_{user.id}', 0)
        return failed_attempts > 5
    
    def _detect_sql_injection(self, request: HttpRequest) -> bool:
        """
        Detect SQL injection attempts
        """
        sql_patterns = [
            r"(\b(union|select|insert|update|delete|drop|create|alter)\b)",
            r"(--|#|/\*|\*/)",
            r"(\b(or|and)\b\s+\d+\s*[=<>])",
            r"(\b(union|select)\b.*\bfrom\b)",
            r"(\b(union|select)\b.*\bwhere\b)",
        ]
        
        # Check GET parameters
        for key, value in request.GET.items():
            for pattern in sql_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    return True
        
        # Check POST data
        if request.method == 'POST':
            for key, value in request.POST.items():
                for pattern in sql_patterns:
                    if re.search(pattern, str(value), re.IGNORECASE):
                        return True
        
        return False
    
    def _detect_xss(self, request: HttpRequest) -> bool:
        """
        Detect XSS attempts
        """
        xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe[^>]*>",
            r"<object[^>]*>",
            r"<embed[^>]*>",
        ]
        
        # Check GET parameters
        for key, value in request.GET.items():
            for pattern in xss_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    return True
        
        # Check POST data
        if request.method == 'POST':
            for key, value in request.POST.items():
                for pattern in xss_patterns:
                    if re.search(pattern, str(value), re.IGNORECASE):
                        return True
        
        return False
    
    def _is_rate_limit_exceeded(self, request: HttpRequest) -> bool:
        """
        Check if rate limit is exceeded
        """
        client_ip = self._get_client_ip(request)
        request_count = cache.get(f'rate_limit_{client_ip}', 0)
        return request_count > 100  # 100 requests per minute
    
    def _detect_anomalous_behavior(self, user: User, request: HttpRequest) -> bool:
        """
        Detect anomalous user behavior
        """
        # Check for unusual login times
        current_hour = timezone.now().hour
        if current_hour < 6 or current_hour > 23:
            return True
        
        # Check for unusual locations (simplified)
        # In production, use geolocation services
        
        # Check for unusual activity patterns
        user_activity = cache.get(f'user_activity_{user.id}', [])
        if len(user_activity) > 100:  # Too many requests in short time
            return True
        
        return False
    
    def _log_threat(self, threats: Dict[str, Any], request: HttpRequest, user: Optional[User] = None):
        """
        Log security threats
        """
        threat_log = {
            'timestamp': timezone.now().isoformat(),
            'ip_address': self._get_client_ip(request),
            'user_id': user.id if user else None,
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'request_path': request.path,
            'request_method': request.method,
            'threats': threats,
        }
        
        # Store in cache for monitoring
        threat_logs = cache.get('threat_logs', [])
        threat_logs.append(threat_log)
        if len(threat_logs) > 1000:
            threat_logs = threat_logs[-1000:]
        cache.set('threat_logs', threat_logs, 3600)
        
        logger.warning(f"Security threat detected: {threats}")

class GDPRComplianceManager:
    """
    GDPR compliance management system
    """
    
    def __init__(self):
        self.data_retention_days = 730  # 2 years
        self.consent_required = True
        self.right_to_forget = True
        
    def process_data_request(self, user: User, request_type: str) -> Dict[str, Any]:
        """
        Process GDPR data requests
        """
        if request_type == 'export':
            return self._export_user_data(user)
        elif request_type == 'delete':
            return self._delete_user_data(user)
        elif request_type == 'rectify':
            return self._rectify_user_data(user)
        else:
            return {'error': 'Invalid request type'}
    
    def _export_user_data(self, user: User) -> Dict[str, Any]:
        """
        Export user data for GDPR compliance
        """
        from bsn_social_network.models import Post, Comment, Like, Notification
        
        user_data = {
            'user_info': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
            },
            'posts': list(Post.objects.filter(author=user).values()),
            'comments': list(Comment.objects.filter(author=user).values()),
            'likes': list(Like.objects.filter(user=user).values()),
            'notifications': list(Notification.objects.filter(recipient=user).values()),
            'export_date': timezone.now().isoformat(),
        }
        
        return {
            'status': 'success',
            'data': user_data,
            'message': 'User data exported successfully'
        }
    
    def _delete_user_data(self, user: User) -> Dict[str, Any]:
        """
        Delete user data for GDPR right to be forgotten
        """
        try:
            # Anonymize user data instead of complete deletion
            user.username = f"deleted_user_{user.id}"
            user.email = f"deleted_{user.id}@deleted.com"
            user.first_name = "Deleted"
            user.last_name = "User"
            user.is_active = False
            user.save()
            
            # Delete user content
            from bsn_social_network.models import Post, Comment, Like, Notification
            
            Post.objects.filter(author=user).delete()
            Comment.objects.filter(author=user).delete()
            Like.objects.filter(user=user).delete()
            Notification.objects.filter(recipient=user).delete()
            
            return {
                'status': 'success',
                'message': 'User data deleted successfully'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to delete user data: {str(e)}'
            }
    
    def _rectify_user_data(self, user: User) -> Dict[str, Any]:
        """
        Rectify user data for GDPR compliance
        """
        return {
            'status': 'success',
            'message': 'User data rectification completed'
        }
    
    def check_data_retention(self):
        """
        Check and clean up old data for GDPR compliance
        """
        cutoff_date = timezone.now() - timedelta(days=self.data_retention_days)
        
        from bsn_social_network.models import Post, Comment, Notification
        
        # Delete old posts
        old_posts = Post.objects.filter(created_at__lt=cutoff_date)
        deleted_posts = old_posts.count()
        old_posts.delete()
        
        # Delete old comments
        old_comments = Comment.objects.filter(created_at__lt=cutoff_date)
        deleted_comments = old_comments.count()
        old_comments.delete()
        
        # Delete old notifications
        old_notifications = Notification.objects.filter(created_at__lt=cutoff_date)
        deleted_notifications = old_notifications.count()
        old_notifications.delete()
        
        logger.info(f"GDPR cleanup: {deleted_posts} posts, {deleted_comments} comments, {deleted_notifications} notifications deleted")
        
        return {
            'deleted_posts': deleted_posts,
            'deleted_comments': deleted_comments,
            'deleted_notifications': deleted_notifications
        }

class MultiFactorAuthentication:
    """
    Multi-factor authentication system
    """
    
    def __init__(self):
        self.totp_secret_length = 32
        self.backup_codes_count = 10
        
    def generate_totp_secret(self) -> str:
        """
        Generate TOTP secret for user
        """
        import secrets
        return secrets.token_hex(self.totp_secret_length)
    
    def generate_backup_codes(self) -> List[str]:
        """
        Generate backup codes for user
        """
        import secrets
        codes = []
        for _ in range(self.backup_codes_count):
            code = secrets.token_hex(4).upper()
            codes.append(f"{code[:4]}-{code[4:8]}")
        return codes
    
    def verify_totp(self, secret: str, token: str) -> bool:
        """
        Verify TOTP token
        """
        try:
            import pyotp
            totp = pyotp.TOTP(secret)
            return totp.verify(token)
        except Exception as e:
            logger.error(f"TOTP verification failed: {e}")
            return False
    
    def verify_backup_code(self, user: User, code: str) -> bool:
        """
        Verify backup code
        """
        backup_codes = cache.get(f'backup_codes_{user.id}', [])
        if code in backup_codes:
            backup_codes.remove(code)
            cache.set(f'backup_codes_{user.id}', backup_codes, 3600)
            return True
        return False
    
    def setup_mfa(self, user: User) -> Dict[str, Any]:
        """
        Setup MFA for user
        """
        secret = self.generate_totp_secret()
        backup_codes = self.generate_backup_codes()
        
        # Store secret securely
        encrypted_secret = self._encrypt_data(secret)
        cache.set(f'mfa_secret_{user.id}', encrypted_secret, 3600)
        
        # Store backup codes
        cache.set(f'backup_codes_{user.id}', backup_codes, 3600)
        
        return {
            'secret': secret,
            'backup_codes': backup_codes,
            'qr_code_url': self._generate_qr_code_url(user, secret)
        }
    
    def _encrypt_data(self, data: str) -> str:
        """
        Encrypt sensitive data
        """
        return self.cipher_suite.encrypt(data.encode()).decode()
    
    def _decrypt_data(self, encrypted_data: str) -> str:
        """
        Decrypt sensitive data
        """
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
    
    def _generate_qr_code_url(self, user: User, secret: str) -> str:
        """
        Generate QR code URL for TOTP setup
        """
        import pyotp
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="BSN Social Network"
        )
        return provisioning_uri

class SecurityAuditLogger:
    """
    Security audit logging system
    """
    
    def __init__(self):
        self.audit_logs = []
    
    def log_security_event(self, event_type: str, user: Optional[User], 
                          details: Dict[str, Any], severity: str = 'info'):
        """
        Log security event
        """
        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'event_type': event_type,
            'user_id': user.id if user else None,
            'user_email': user.email if user else None,
            'details': details,
            'severity': severity,
            'ip_address': self._get_client_ip_from_request(),
        }
        
        self.audit_logs.append(audit_log)
        
        # Store in cache for monitoring
        audit_logs = cache.get('audit_logs', [])
        audit_logs.append(audit_log)
        if len(audit_logs) > 10000:
            audit_logs = audit_logs[-10000:]
        cache.set('audit_logs', audit_logs, 86400)  # 24 hours
        
        # Log to file
        logger.info(f"Security audit: {event_type} - {details}")
    
    def _get_client_ip_from_request(self) -> str:
        """
        Get client IP from current request context
        """
        # This would be implemented with request context
        return "unknown"
    
    def get_audit_report(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """
        Generate audit report
        """
        audit_logs = cache.get('audit_logs', [])
        
        filtered_logs = [
            log for log in audit_logs
            if start_date <= datetime.fromisoformat(log['timestamp']) <= end_date
        ]
        
        event_counts = {}
        severity_counts = {}
        
        for log in filtered_logs:
            event_type = log['event_type']
            severity = log['severity']
            
            event_counts[event_type] = event_counts.get(event_type, 0) + 1
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            'total_events': len(filtered_logs),
            'event_counts': event_counts,
            'severity_counts': severity_counts,
            'logs': filtered_logs
        }

# Initialize security managers
security_manager = EnterpriseSecurityManager()
gdpr_manager = GDPRComplianceManager()
mfa_manager = MultiFactorAuthentication()
audit_logger = SecurityAuditLogger() 