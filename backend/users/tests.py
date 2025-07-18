from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.core import mail
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import UserProfile, EmailVerification, PasswordReset

User = get_user_model()


class UserRegistrationTests(APITestCase):
    """
    Test cases for user registration functionality
    """
    
    def setUp(self):
        self.register_url = reverse('user-registration')
        self.valid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!'
        }
    
    def test_successful_registration(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.valid_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('user_id', response.data)
        
        # Check if user was created
        user = User.objects.get(username='testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('TestPass123!'))
        
        # Check if user profile was created
        self.assertTrue(hasattr(user, 'profile'))
        self.assertIsInstance(user.profile, UserProfile)
        
        # Check if email verification was created
        self.assertTrue(EmailVerification.objects.filter(user=user).exists())
    
    def test_registration_with_alpha_access_code(self):
        """Test registration with alpha access code"""
        data = self.valid_data.copy()
        data['alpha_access_code'] = 'ALPHA123'
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(username='testuser')
        # In a real implementation, you would check if the alpha access code was validated
        self.assertTrue(user.is_active)
    
    def test_registration_without_required_fields(self):
        """Test registration without required fields"""
        # Test without username
        data = self.valid_data.copy()
        del data['username']
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test without email
        data = self.valid_data.copy()
        del data['email']
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test without password
        data = self.valid_data.copy()
        del data['password']
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_registration_with_invalid_email(self):
        """Test registration with invalid email format"""
        data = self.valid_data.copy()
        data['email'] = 'invalid-email'
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_registration_with_weak_password(self):
        """Test registration with weak password"""
        data = self.valid_data.copy()
        data['password'] = 'weak'
        data['password_confirm'] = 'weak'
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_registration_with_mismatched_passwords(self):
        """Test registration with mismatched passwords"""
        data = self.valid_data.copy()
        data['password_confirm'] = 'DifferentPass123!'
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_registration_with_existing_username(self):
        """Test registration with existing username"""
        # Create user first
        User.objects.create_user(
            username='testuser',
            email='existing@example.com',
            password='TestPass123!'
        )
        
        response = self.client.post(self.register_url, self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_registration_with_existing_email(self):
        """Test registration with existing email"""
        # Create user first
        User.objects.create_user(
            username='existinguser',
            email='test@example.com',
            password='TestPass123!'
        )
        
        response = self.client.post(self.register_url, self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_email_verification_created(self):
        """Test that email verification is created during registration"""
        response = self.client.post(self.register_url, self.valid_data)
        
        user = User.objects.get(username='testuser')
        verification = EmailVerification.objects.get(user=user)
        
        self.assertIsNotNone(verification.token)
        self.assertFalse(verification.is_used)
        self.assertGreater(verification.expires_at, timezone.now())
    
    def test_verification_email_sent(self):
        """Test that verification email is sent during registration"""
        response = self.client.post(self.register_url, self.valid_data)
        
        # Check that email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('test@example.com', mail.outbox[0].to)
        self.assertIn('Verify your email address', mail.outbox[0].subject)


class UserLoginTests(APITestCase):
    """
    Test cases for user login functionality
    """
    
    def setUp(self):
        self.login_url = reverse('user-login')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.valid_data = {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }
    
    def test_successful_login_with_email(self):
        """Test successful login with email"""
        response = self.client.post(self.login_url, self.valid_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertIn('user', response.data)
    
    def test_successful_login_with_username(self):
        """Test successful login with username"""
        data = {
            'username': 'testuser',
            'password': 'TestPass123!'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
    
    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_with_nonexistent_user(self):
        """Test login with nonexistent user"""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'TestPass123!'
        }
        
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_without_credentials(self):
        """Test login without credentials"""
        response = self.client.post(self.login_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class EmailVerificationTests(APITestCase):
    """
    Test cases for email verification functionality
    """
    
    def setUp(self):
        self.verify_url = reverse('email-verification')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.verification = EmailVerification.objects.create(
            user=self.user,
            token=str(uuid.uuid4()),
            expires_at=timezone.now() + timedelta(hours=24)
        )
    
    def test_successful_email_verification(self):
        """Test successful email verification"""
        data = {'token': self.verification.token}
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that verification is marked as used
        self.verification.refresh_from_db()
        self.assertTrue(self.verification.is_used)
        
        # Check that user is active
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
    
    def test_verification_with_invalid_token(self):
        """Test verification with invalid token"""
        data = {'token': 'invalid-token'}
        
        response = self.client.post(self.verify_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_verification_with_expired_token(self):
        """Test verification with expired token"""
        self.verification.expires_at = timezone.now() - timedelta(hours=1)
        self.verification.save()
        
        data = {'token': self.verification.token}
        
        response = self.client.post(self.verify_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_verification_with_used_token(self):
        """Test verification with already used token"""
        self.verification.is_used = True
        self.verification.save()
        
        data = {'token': self.verification.token}
        
        response = self.client.post(self.verify_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileTests(APITestCase):
    """
    Test cases for user profile functionality
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)
    
    def test_get_user_profile(self):
        """Test getting user profile"""
        url = reverse('user-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)
    
    def test_update_user_profile(self):
        """Test updating user profile"""
        url = reverse('user-profile')
        data = {
            'first_name': 'John',
            'last_name': 'Doe'
        }
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'John')
        self.assertEqual(self.user.last_name, 'Doe')
    
    def test_get_user_profile_by_id(self):
        """Test getting user profile by ID"""
        url = reverse('user-profile-by-id', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('username', response.data)
    
    def test_get_user_profile_by_username(self):
        """Test getting user profile by username"""
        url = reverse('user-profile-by-username', kwargs={'username': self.user.username})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('username', response.data)


class PasswordResetTests(APITestCase):
    """
    Test cases for password reset functionality
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.reset_request_url = reverse('password-reset-request')
        self.reset_confirm_url = reverse('password-reset-confirm')
    
    def test_password_reset_request(self):
        """Test password reset request"""
        data = {'email': 'test@example.com'}
        
        response = self.client.post(self.reset_request_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that reset token was created
        self.assertTrue(PasswordReset.objects.filter(user=self.user).exists())
        
        # Check that email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('test@example.com', mail.outbox[0].to)
    
    def test_password_reset_confirm(self):
        """Test password reset confirmation"""
        reset_token = PasswordReset.objects.create(
            user=self.user,
            token=str(uuid.uuid4()),
            expires_at=timezone.now() + timedelta(hours=1)
        )
        
        data = {
            'token': reset_token.token,
            'new_password': 'NewPass123!',
            'new_password_confirm': 'NewPass123!'
        }
        
        response = self.client.post(self.reset_confirm_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))
        
        # Check that token was marked as used
        reset_token.refresh_from_db()
        self.assertTrue(reset_token.is_used)
    
    def test_password_reset_with_invalid_token(self):
        """Test password reset with invalid token"""
        data = {
            'token': 'invalid-token',
            'new_password': 'NewPass123!',
            'new_password_confirm': 'NewPass123!'
        }
        
        response = self.client.post(self.reset_confirm_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_password_reset_with_expired_token(self):
        """Test password reset with expired token"""
        reset_token = PasswordReset.objects.create(
            user=self.user,
            token=str(uuid.uuid4()),
            expires_at=timezone.now() - timedelta(hours=1)
        )
        
        data = {
            'token': reset_token.token,
            'new_password': 'NewPass123!',
            'new_password_confirm': 'NewPass123!'
        }
        
        response = self.client.post(self.reset_confirm_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserSessionTests(APITestCase):
    """
    Test cases for user session management
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_list_user_sessions(self):
        """Test listing user sessions"""
        url = reverse('user-sessions')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_delete_user_session(self):
        """Test deleting user session"""
        session = UserSession.objects.create(
            user=self.user,
            session_key='test-session',
            ip_address='127.0.0.1',
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        url = reverse('user-session-delete', kwargs={'session_id': session.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserSession.objects.filter(id=session.id).exists())


class UserLogoutTests(APITestCase):
    """
    Test cases for user logout functionality
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_successful_logout(self):
        """Test successful logout"""
        url = reverse('user-logout')
        response = self.client.post(url, {'refresh_token': 'test-token'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)


class UserStatsTests(APITestCase):
    """
    Test cases for user statistics
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_get_user_stats(self):
        """Test getting user statistics"""
        url = reverse('user-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('active_users', response.data)
        self.assertIn('new_users_today', response.data)
