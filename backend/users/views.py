from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.db import models
from django.db.models import Q
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
import uuid
import logging
from datetime import timedelta
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.core.exceptions import PermissionDenied
from django.http import Http404
import hashlib
import hmac

# Setup logging
logger = logging.getLogger(__name__)

# Rate Limiting Classes
class ProfileRateThrottle(UserRateThrottle):
    rate = '100/hour'  # 100 Requests pro Stunde pro User

class SearchRateThrottle(UserRateThrottle):
    rate = '50/hour'   # 50 Such-Requests pro Stunde pro User

class UploadRateThrottle(UserRateThrottle):
    rate = '20/hour'   # 20 Upload-Requests pro Stunde pro User

from .models import UserProfile, UserSession, EmailVerification, PasswordReset
from .serializers import (
    UserSerializer, UserProfileSerializer, UserRegistrationSerializer,
    UserLoginSerializer, PasswordChangeSerializer, EmailVerificationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserSessionSerializer
)

from bsn_social_network.models import Post, TokenTransaction, MiningProgress, NFT, FollowRelationship
from bsn_social_network.serializers import PostSerializer, NFTSerializer, UserProfileSerializer as BSNUserProfileSerializer
from rest_framework.permissions import IsAuthenticated

User = get_user_model()


class UserRegistrationView(APIView):
    """
    User registration endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create user profile
            UserProfile.objects.create(user=user)
            
            # Generate email verification token
            token = str(uuid.uuid4())
            expires_at = timezone.now() + timedelta(hours=24)
            EmailVerification.objects.create(
                user=user,
                token=token,
                expires_at=expires_at
            )
            
            # Send verification email
            self.send_verification_email(user, token)
            
            return Response({
                'message': 'User registered successfully. Please check your email for verification.',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_verification_email(self, user, token):
        """Send email verification email"""
        subject = 'Verify your email address'
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        message = f"""
        Hello {user.username},
        
        Please verify your email address by clicking the link below:
        {verification_url}
        
        This link will expire in 24 hours.
        
        Best regards,
        BSN Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )


class UserLoginView(APIView):
    """
    User login endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                username = serializer.validated_data.get('username')
                email = serializer.validated_data.get('email')
                password = serializer.validated_data['password']
                
                # Try to find user by username or email
                user = None
                if username:
                    user = authenticate(username=username, password=password)
                elif email:
                    # Try to authenticate with email as username
                    try:
                        user_obj = User.objects.get(email=email)
                        user = authenticate(username=user_obj.username, password=password)
                    except User.DoesNotExist:
                        pass
                
                if user:
                    if not user.is_active:
                        return Response({
                            'error': 'Account is disabled.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Update last login
                    user.last_login = timezone.now()
                    user.save()
                    
                    # Create session
                    self.create_user_session(user, request)
                    
                    # Generate tokens
                    refresh = RefreshToken.for_user(user)
                    
                    return Response({
                        'access_token': str(refresh.access_token),
                        'refresh_token': str(refresh),
                        'user': UserSerializer(user).data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'error': 'Invalid credentials.'
                    }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'error': 'An error occurred during login.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create_user_session(self, user, request):
        """Create user session record"""
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        expires_at = timezone.now() + timedelta(days=7)
        
        UserSession.objects.create(
            user=user,
            session_key=session_key,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserLogoutView(APIView):
    """
    User logout endpoint
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Deactivate user sessions
            UserSession.objects.filter(
                user=request.user,
                is_active=True
            ).update(is_active=False)
            
            logout(request)
            
            return Response({
                'message': 'Logged out successfully.'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': 'Error during logout.'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    User profile management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user profile"""
        serializer = BSNUserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update user profile"""
        serializer = BSNUserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileDetailView(APIView):
    """
    Extended user profile management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        serializer = BSNUserProfileSerializer(user)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        serializer = BSNUserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileByIdView(APIView):
    """
    Get user profile by user ID (for viewing other users' profiles)
    Optimized with select_related and prefetch_related for better performance
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ProfileRateThrottle]
    
    def get(self, request, user_id):
        # Check cache first for better performance
        cache_key = f'user_profile_id_{user_id}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        try:
            # Optimized query with select_related for profile data
            user = User.objects.select_related('profile').get(id=user_id)
            
            # Check if user is active
            if not user.is_active:
                return Response({
                    'error': 'User account is disabled.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get follow statistics with optimized queries
            followers_count = user.followers.count()
            following_count = user.following.count()
            
            # Check if current user is following this user
            is_following = False
            if request.user != user:
                is_following = user.followers.filter(follower=request.user).exists()
            
            # Get recent posts with optimized query
            recent_posts = Post.objects.filter(
                author=user,
                is_active=True
            ).select_related('author', 'author__profile').prefetch_related(
                'likes', 'comments'
            ).order_by('-created_at')[:5]
            
            # Serialize user data with optimized profile information using BSN UserProfileSerializer
            user_data = BSNUserProfileSerializer(user).data
            user_data.update({
                'followers_count': followers_count,
                'following_count': following_count,
                'is_following': is_following,
                'is_own_profile': request.user == user,
                'recent_posts_count': recent_posts.count(),
            })
            
            # Cache the result for 5 minutes
            cache.set(cache_key, user_data, timeout=300)
            
            return Response(user_data, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching user profile by ID {user_id}: {str(e)}")
            return Response({
                'error': 'An error occurred while fetching user profile.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileByUsernameView(APIView):
    """
    Get user profile by username (for viewing other users' profiles)
    Optimized with select_related and prefetch_related for better performance
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ProfileRateThrottle]
    
    def get(self, request, username):
        # Check cache first for better performance
        cache_key = f'user_profile_{username}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        try:
            # Optimized query with select_related for profile data
            user = User.objects.select_related('profile').get(username=username)
            
            # Check if user is active
            if not user.is_active:
                return Response({
                    'error': 'User account is disabled.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get follow statistics with optimized queries
            followers_count = user.followers.count()
            following_count = user.following.count()
            
            # Check if current user is following this user
            is_following = False
            if request.user != user:
                is_following = user.followers.filter(follower=request.user).exists()
            
            # Serialize user data with optimized profile information using BSN UserProfileSerializer
            user_data = BSNUserProfileSerializer(user).data
            user_data.update({
                'followers_count': followers_count,
                'following_count': following_count,
                'is_following': is_following,
                'is_own_profile': request.user == user,
            })
            
            # Cache the result for 5 minutes
            cache.set(cache_key, user_data, timeout=300)
            
            return Response(user_data, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'An error occurred while fetching user profile.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordChangeView(APIView):
    """
    Password change endpoint
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    'error': 'Current password is incorrect.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Password changed successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """
    Email verification endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            
            try:
                verification = EmailVerification.objects.get(
                    token=token,
                    is_used=False,
                    expires_at__gt=timezone.now()
                )
                
                # Mark as verified
                user = verification.user
                user.is_verified = True
                user.save()
                
                # Mark token as used
                verification.is_used = True
                verification.save()
                
                return Response({
                    'message': 'Email verified successfully.'
                }, status=status.HTTP_200_OK)
            
            except EmailVerification.DoesNotExist:
                return Response({
                    'error': 'Invalid or expired verification token.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    Password reset request endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                # Generate reset token
                token = str(uuid.uuid4())
                expires_at = timezone.now() + timedelta(hours=24)
                
                PasswordReset.objects.create(
                    user=user,
                    token=token,
                    expires_at=expires_at
                )
                
                # Send reset email
                self.send_reset_email(user, token)
                
                return Response({
                    'message': 'Password reset email sent.'
                }, status=status.HTTP_200_OK)
            
            except User.DoesNotExist:
                # Don't reveal if email exists or not
                return Response({
                    'message': 'Password reset email sent.'
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_reset_email(self, user, token):
        """Send password reset email"""
        subject = 'Reset your password'
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        message = f"""
        Hello {user.username},
        
        You requested a password reset. Click the link below to reset your password:
        {reset_url}
        
        This link will expire in 24 hours.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        BSN Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )


class PasswordResetConfirmView(APIView):
    """
    Password reset confirmation endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                reset = PasswordReset.objects.get(
                    token=token,
                    is_used=False,
                    expires_at__gt=timezone.now()
                )
                
                # Set new password
                user = reset.user
                user.set_password(new_password)
                user.save()
                
                # Mark token as used
                reset.is_used = True
                reset.save()
                
                return Response({
                    'message': 'Password reset successfully.'
                }, status=status.HTTP_200_OK)
            
            except PasswordReset.DoesNotExist:
                return Response({
                    'error': 'Invalid or expired reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserSessionsView(generics.ListAPIView):
    """
    List user sessions
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSessionSerializer
    
    def get_queryset(self):
        return UserSession.objects.filter(
            user=self.request.user,
            is_active=True
        ).order_by('-created_at')


class UserSessionDeleteView(APIView):
    """
    Delete user session
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, session_id):
        try:
            session = UserSession.objects.get(
                id=session_id,
                user=request.user
            )
            session.is_active = False
            session.save()
            
            return Response({
                'message': 'Session deleted successfully.'
            }, status=status.HTTP_200_OK)
        
        except UserSession.DoesNotExist:
            return Response({
                'error': 'Session not found.'
            }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    user = request.user
    
    stats = {
        'total_sessions': UserSession.objects.filter(user=user).count(),
        'active_sessions': UserSession.objects.filter(user=user, is_active=True).count(),
        'last_login': user.last_login.isoformat() if user.last_login else None,
        'date_joined': user.date_joined.isoformat(),
        'is_verified': user.is_active,
    }
    
    return Response(stats)


class MetaMaskLoginView(APIView):
    """
    MetaMask wallet authentication endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        
        if not wallet_address:
            return Response({
                'error': 'Wallet address is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Check if user exists with this wallet address
            user = User.objects.filter(wallet_address=wallet_address).first()
            
            if not user:
                return Response({
                    'error': 'No account found with this wallet address. Please register first.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if not user.is_active:
                return Response({
                    'error': 'Account is disabled.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            # Create session
            self.create_user_session(user, request)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'MetaMask verification failed.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def create_user_session(self, user, request):
        """Create user session record"""
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        expires_at = timezone.now() + timedelta(days=7)
        
        UserSession.objects.create(
            user=user,
            session_key=session_key,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserSearchView(APIView):
    """
    User search endpoint
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Search users by query"""
        query = request.GET.get('q', '').strip()
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        
        if not query:
            return Response({
                'results': [],
                'count': 0,
                'next': None,
                'previous': None
            })
        
        # Search users by username, email, first_name, last_name
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).distinct()
        
        # Pagination
        total_count = users.count()
        start = (page - 1) * limit
        end = start + limit
        users_page = users[start:end]
        
        # Serialize results
        serializer = UserSerializer(users_page, many=True)
        
        # Pagination info
        has_next = end < total_count
        has_previous = page > 1
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'next': f"?q={query}&page={page + 1}&limit={limit}" if has_next else None,
            'previous': f"?q={query}&page={page - 1}&limit={limit}" if has_previous else None
        })


class WalletRegistrationView(APIView):
    """
    Wallet-based user registration endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        username = request.data.get('username')
        email = request.data.get('email', '')
        
        if not wallet_address or not signature or not username:
            return Response({
                'error': 'Wallet address, signature, and username are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Verify signature (simplified for now)
        # In production, verify that the signature was created by the wallet address
        
        # Check if user with this wallet already exists
        try:
            profile = UserProfile.objects.get(wallet_address=wallet_address)
            user = profile.user
            
            # Create session
            self.create_user_session(user, request)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': UserSerializer(user).data,
                'message': 'Wallet login successful.'
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            # Create new user
            user = User.objects.create_user(
                username=username,
                email=email,
                is_active=True
            )
            
            # Create profile with wallet
            UserProfile.objects.create(
                user=user,
                wallet_address=wallet_address
            )
            
            # Create session
            self.create_user_session(user, request)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': UserSerializer(user).data,
                'message': 'Wallet registration successful.'
            }, status=status.HTTP_201_CREATED)
    
    def create_user_session(self, user, request):
        """Create user session record"""
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        expires_at = timezone.now() + timedelta(days=7)
        
        UserSession.objects.create(
            user=user,
            session_key=session_key,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# User Relationship Views

class FollowUserView(APIView):
    """
    Follow a user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            if target_user == request.user:
                return Response({
                    'error': 'Cannot follow yourself.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import FollowRelationship
            
            # Check if already following
            if FollowRelationship.objects.filter(user=request.user, friend=target_user).exists():
                return Response({
                    'message': 'Already following this user.'
                }, status=status.HTTP_200_OK)
            
            # Create follow relationship
            FollowRelationship.objects.create(user=request.user, friend=target_user)
            
            return Response({
                'message': 'Successfully followed user.'
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class UnfollowUserView(APIView):
    """
    Unfollow a user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import FollowRelationship
            
            # Remove follow relationship
            follow_rel = FollowRelationship.objects.filter(user=request.user, friend=target_user)
            if follow_rel.exists():
                follow_rel.delete()
                return Response({
                    'message': 'Successfully unfollowed user.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Not following this user.'
                }, status=status.HTTP_200_OK)
                
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class IsFollowingView(APIView):
    """
    Check if current user is following another user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import FollowRelationship
            
            is_following = FollowRelationship.objects.filter(
                user=request.user, 
                friend=target_user
            ).exists()
            
            return Response({
                'is_following': is_following
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class FollowStatsView(APIView):
    """
    Get follow statistics for a user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import FollowRelationship
            
            followers_count = FollowRelationship.objects.filter(friend=target_user).count()
            following_count = FollowRelationship.objects.filter(user=target_user).count()
            
            return Response({
                'followers': followers_count,
                'following': following_count
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class FollowersListView(APIView):
    """
    Get list of followers for a user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import FollowRelationship
            
            # Get followers
            followers = FollowRelationship.objects.filter(friend=target_user).select_related('user')
            
            followers_data = []
            for follow_rel in followers:
                user = follow_rel.user
                profile = getattr(user, 'userprofile', None)
                followers_data.append({
                    'id': user.id,
                    'username': user.username,
                    'display_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'avatar_url': profile.avatar_url if profile else None,
                    'bio': profile.bio if profile else None,
                })
            
            return Response({
                'results': followers_data
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class FollowingListView(APIView):
    """
    Get list of users that a user is following
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import FollowRelationship
            
            # Get following
            following = FollowRelationship.objects.filter(user=target_user).select_related('friend')
            
            following_data = []
            for follow_rel in following:
                user = follow_rel.friend
                profile = getattr(user, 'userprofile', None)
                following_data.append({
                    'id': user.id,
                    'username': user.username,
                    'display_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'avatar_url': profile.avatar_url if profile else None,
                    'bio': profile.bio if profile else None,
                })
            
            return Response({
                'results': following_data
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class BlockUserView(APIView):
    """
    Block a user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            if target_user == request.user:
                return Response({
                    'error': 'Cannot block yourself.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import BlockedUser, FollowRelationship
            
            # Check if already blocked
            if BlockedUser.objects.filter(user=request.user, blocked_user=target_user).exists():
                return Response({
                    'message': 'User already blocked.'
                }, status=status.HTTP_200_OK)
            
            # Create block relationship
            BlockedUser.objects.create(user=request.user, blocked_user=target_user)
            
            # Remove follow relationship if exists
            FollowRelationship.objects.filter(user=request.user, friend=target_user).delete()
            FollowRelationship.objects.filter(user=target_user, friend=request.user).delete()
            
            return Response({
                'message': 'Successfully blocked user.'
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class UnblockUserView(APIView):
    """
    Unblock a user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import BlockedUser
            
            # Remove block relationship
            blocked = BlockedUser.objects.filter(user=request.user, blocked_user=target_user)
            if blocked.exists():
                blocked.delete()
                return Response({
                    'message': 'Successfully unblocked user.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'User was not blocked.'
                }, status=status.HTTP_200_OK)
                
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class IsBlockedView(APIView):
    """
    Check if current user has blocked another user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            # Import here to avoid circular imports
            from bsn_social_network.models import BlockedUser
            
            is_blocked = BlockedUser.objects.filter(
                user=request.user, 
                blocked_user=target_user
            ).exists()
            
            return Response({
                'is_blocked': is_blocked
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class BlockedUsersListView(APIView):
    """
    Get list of blocked users
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Import here to avoid circular imports
        from bsn_social_network.models import BlockedUser
        
        # Get blocked users
        blocked_users = BlockedUser.objects.filter(user=request.user).select_related('blocked_user')
        
        blocked_data = []
        for blocked in blocked_users:
            user = blocked.blocked_user
            profile = getattr(user, 'userprofile', None)
            blocked_data.append({
                'id': user.id,
                'username': user.username,
                'display_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'avatar_url': profile.avatar_url if profile else None,
                'bio': profile.bio if profile else None,
            })
        
        return Response({
            'results': blocked_data
        }, status=status.HTTP_200_OK)


class UserSettingsView(APIView):
    """
    User settings management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.userprofile
            return Response({
                'theme': getattr(profile, 'theme', 'light'),
                'email_notifications': getattr(profile, 'email_notifications', True),
                'push_notifications': getattr(profile, 'push_notifications', True),
                'privacy_settings': getattr(profile, 'privacy_settings', {}),
                'two_factor_auth_enabled': getattr(profile, 'two_factor_auth_enabled', False),
                'auto_staking': getattr(profile, 'auto_staking', False),
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'theme': 'light',
                'email_notifications': True,
                'push_notifications': True,
                'privacy_settings': {},
                'two_factor_auth_enabled': False,
                'auto_staking': False,
            }, status=status.HTTP_200_OK)
    
    def patch(self, request):
        try:
            profile = request.user.userprofile
            
            # Update settings
            if 'theme' in request.data:
                profile.theme = request.data['theme']
            if 'email_notifications' in request.data:
                profile.email_notifications = request.data['email_notifications']
            if 'push_notifications' in request.data:
                profile.push_notifications = request.data['push_notifications']
            if 'privacy_settings' in request.data:
                profile.privacy_settings = request.data['privacy_settings']
            if 'two_factor_auth_enabled' in request.data:
                profile.two_factor_auth_enabled = request.data['two_factor_auth_enabled']
            if 'auto_staking' in request.data:
                profile.auto_staking = request.data['auto_staking']
            
            profile.save()
            
            return Response({
                'message': 'Settings updated successfully.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to update settings.'
            }, status=status.HTTP_400_BAD_REQUEST)


class AvatarUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        user = request.user
        if not file:
            print(f"[AvatarUpload] No file provided by user {user.id} ({user.username})")
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if not file.content_type.startswith('image/'):
            print(f"[AvatarUpload] File is not an image: {file.content_type} by user {user.id} ({user.username})")
            return Response({'error': 'File is not an image.'}, status=status.HTTP_400_BAD_REQUEST)
        filename = f"profile_avatars/{user.id}_{file.name}"
        path = default_storage.save(filename, ContentFile(file.read()))
        avatar_url = settings.MEDIA_URL + path
        print(f"[AvatarUpload] User {user.id} ({user.username}) uploaded avatar: {filename} -> {avatar_url}")
        user.avatar_url = avatar_url
        user.save()
        print(f"[AvatarUpload] avatar_url saved in user: {user.avatar_url}")
        return Response({'avatar_url': avatar_url}, status=status.HTTP_200_OK)


class CoverUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        user = request.user
        if not file:
            print(f"[CoverUpload] No file provided by user {user.id} ({user.username})")
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if not file.content_type.startswith('image/'):
            print(f"[CoverUpload] File is not an image: {file.content_type} by user {user.id} ({user.username})")
            return Response({'error': 'File is not an image.'}, status=status.HTTP_400_BAD_REQUEST)
        filename = f"profile_covers/{user.id}_{file.name}"
        path = default_storage.save(filename, ContentFile(file.read()))
        cover_url = settings.MEDIA_URL + path
        print(f"[CoverUpload] User {user.id} ({user.username}) uploaded cover: {filename} -> {cover_url}")
        user.cover_url = cover_url
        user.save()
        print(f"[CoverUpload] cover_url saved in user: {user.cover_url}")
        return Response({'cover_url': cover_url}, status=status.HTTP_200_OK)


class UserActivityFeedView(APIView):
    """
    Aggregierter Aktivitäten-Feed für einen User (Posts, Token, Mining, NFT, Follows)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_user_model().objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found.'}, status=404)
        activities = []
        # Posts
        posts = Post.objects.filter(author=user).order_by('-created_at')[:20]
        for post in posts:
            activities.append({
                'type': 'post',
                'timestamp': post.created_at,
                'title': 'Neuer Beitrag',
                'description': post.content[:100],
                'object': PostSerializer(post, context={'request': request}).data
            })
        # Token-Transaktionen
        transactions = TokenTransaction.objects.filter(
            (Q(from_wallet__user=user) | Q(to_wallet__user=user))
        ).order_by('-created_at')[:20]
        for tx in transactions:
            activities.append({
                'type': 'token',
                'timestamp': tx.created_at,
                'title': f'Token-Transaktion',
                'description': f'{tx.amount} Token ({tx.transaction_type})',
                'object': {
                    'id': tx.id,
                    'amount': str(tx.amount),
                    'type': tx.transaction_type,
                    'status': tx.status
                }
            })
        # Mining (nur letzte Aktivität)
        mining = MiningProgress.objects.filter(user=user).order_by('-updated_at').first()
        if mining:
            activities.append({
                'type': 'mining',
                'timestamp': mining.updated_at,
                'title': 'Mining-Aktivität',
                'description': f'Mining Power: {mining.mining_power}, Tokens: {mining.total_mined}',
                'object': {
                    'mining_power': str(mining.mining_power),
                    'total_mined': str(mining.total_mined),
                    'streak_days': mining.streak_days
                }
            })
        # NFTs
        nfts = NFT.objects.filter(owner=user).order_by('-created_at')[:10]
        for nft in nfts:
            activities.append({
                'type': 'nft',
                'timestamp': nft.created_at,
                'title': 'NFT erhalten/erstellt',
                'description': nft.name,
                'object': NFTSerializer(nft, context={'request': request}).data
            })
        # Follows (nur als Beispiel, letzte 10)
        from bsn_social_network.models import FollowRelationship
        follows = FollowRelationship.objects.filter(friend=user).order_by('-created_at')[:10]
        for follow in follows:
            activities.append({
                'type': 'follow',
                'timestamp': follow.created_at,
                'title': 'Neuer Follower',
                'description': f'Gefolgt von {follow.user.username}',
                'object': {
                    'follower_id': follow.user.id,
                    'follower_username': follow.user.username
                }
            })
        # Sortieren nach Zeitstempel, absteigend
        activities_sorted = sorted(activities, key=lambda x: x['timestamp'], reverse=True)
        return Response({'results': activities_sorted[:50]})


class UserMediaFeedView(APIView):
    """
    Gibt alle Medien-Posts (Fotos/Videos) eines Users als Feed zurück
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_user_model().objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found.'}, status=404)
        # Nur Posts mit Medientyp 'image' oder 'video'
        posts = Post.objects.filter(author=user, media_type__in=['image', 'video']).order_by('-created_at')
        data = PostSerializer(posts, many=True, context={'request': request}).data
        return Response({'results': data})


class FriendsListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, user_id):
        user = get_user_model().objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found.'}, status=404)
        # IDs aller User, denen user folgt
        following_ids = set(FollowRelationship.objects.filter(user=user).values_list('friend_id', flat=True))
        # IDs aller User, die user folgen
        follower_ids = set(FollowRelationship.objects.filter(friend=user).values_list('user_id', flat=True))
        # Gegenseitige Freundschaften = Schnittmenge
        friend_ids = following_ids & follower_ids
        friends = get_user_model().objects.filter(id__in=friend_ids)
        # Optional: UserSerializer verwenden
        from .serializers import UserSerializer
        data = UserSerializer(friends, many=True).data
        return Response({'results': data})


class UserProfileAboutUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        return self._update_profile(request)
    
    def put(self, request):
        return self._update_profile(request)
    
    def _update_profile(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile:
            return Response({'error': 'Profile not found.'}, status=404)
        
        data = request.data
        # Nur erlaubte Felder updaten
        allowed_fields = ['bio', 'occupation', 'company', 'interests', 'skills', 'social_media_links']
        for field in allowed_fields:
            if field in data:
                if field == 'social_media_links':
                    setattr(user, field, data[field])
                else:
                    setattr(profile, field, data[field])
        
        profile.save()
        user.save()
        return Response(BSNUserProfileSerializer(user).data)


# Security Utilities
def validate_request_signature(request, secret_key):
    """Validate request signature for enhanced security"""
    signature = request.headers.get('X-Request-Signature')
    if not signature:
        return False
    
    # Create expected signature
    message = f"{request.method}{request.path}{request.body.decode()}"
    expected_signature = hmac.new(
        secret_key.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

def sanitize_user_input(data):
    """Sanitize user input to prevent XSS and injection attacks"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', 'script', 'javascript']
        for char in dangerous_chars:
            data = data.replace(char, '')
        return data.strip()
    elif isinstance(data, dict):
        return {k: sanitize_user_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_user_input(item) for item in data]
    return data
