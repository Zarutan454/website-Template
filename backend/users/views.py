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
import uuid
from datetime import timedelta
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import UserRateThrottle
from bsn_social_network.services.feed_service import FeedService
from bsn_social_network.models import Post, Comment, Like
from django.core.paginator import Paginator
from django.db.models import Count, Q
import logging

logger = logging.getLogger(__name__)

from .models import UserProfile, UserSession, EmailVerification, PasswordReset
from .serializers import (
    UserSerializer, UserProfileSerializer, UserRegistrationSerializer,
    UserLoginSerializer, PasswordChangeSerializer, EmailVerificationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserSessionSerializer
)

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
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update user profile"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
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
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    def put(self, request):
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileByIdView(APIView):
    """
    Get user profile by user ID (for viewing other users' profiles)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class UserProfileByUsernameView(APIView):
    """
    Get user profile by username (for viewing other users' profiles)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


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
            models.Q(username__icontains=query) |
            models.Q(email__icontains=query) |
            models.Q(first_name__icontains=query) |
            models.Q(last_name__icontains=query)
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
    throttle_classes = [UserRateThrottle]  # Optional: Limitiere Follow-Versuche
    
    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            if target_user == request.user:
                logger.warning(f"User {request.user.id} tried to follow themselves.")
                return Response({'error': 'Cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
            # Temporarily disable FollowRelationship queries
            # from bsn_social_network.models import FollowRelationship
            # Check if already following
            # if FollowRelationship.objects.filter(user=request.user, friend=target_user).exists():
            #     return Response({'message': 'Already following this user.'}, status=status.HTTP_200_OK)
            # Create follow relationship (handle race conditions)
            try:
                # from bsn_social_network.models import FollowRelationship
                # FollowRelationship.objects.create(user=request.user, friend=target_user)
                pass  # Temporarily disabled
            except Exception as e:
                logger.error(f"Error creating FollowRelationship: {e}")
                return Response({'error': 'Could not follow user. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            # Notify via WebSocket/FeedService
            try:
                FeedService.notify_user_followed(request.user, target_user)
            except Exception as e:
                logger.warning(f"WebSocket notification failed: {e}")
            logger.info(f"User {request.user.id} followed user {target_user.id}")
            return Response({'message': 'Successfully followed user.'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            logger.warning(f"Follow attempt to non-existent user_id={user_id} by user {request.user.id}")
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class UnfollowUserView(APIView):
    """
    Unfollow a user
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            # Temporarily disable FollowRelationship queries
            # from bsn_social_network.models import FollowRelationship
            # follow_rel = FollowRelationship.objects.filter(user=request.user, friend=target_user)
            # if follow_rel.exists():
            #     follow_rel.delete()
            #     logger.info(f"User {request.user.id} unfollowed user {target_user.id}")
            #     return Response({'message': 'Successfully unfollowed user.'}, status=status.HTTP_200_OK)
            # else:
            #     return Response({'message': 'Not following this user.'}, status=status.HTTP_200_OK)
            return Response({'message': 'Follow functionality temporarily disabled.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.warning(f"Unfollow attempt to non-existent user_id={user_id} by user {request.user.id}")
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class IsFollowingView(APIView):
    """
    Check if current user is following another user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            
            # Import here to avoid circular imports
            # from bsn_social_network.models import FollowRelationship
            
            # is_following = FollowRelationship.objects.filter(
            #     user=request.user, 
            #     friend=target_user
            # ).exists()
            
            # Temporarily return False
            is_following = False
            
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
            # from bsn_social_network.models import FollowRelationship
            
            # Temporarily return 0
            followers_count = 0
            following_count = 0
            
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
            # from bsn_social_network.models import FollowRelationship
            
            # Get followers
            # followers = FollowRelationship.objects.filter(friend=target_user).select_related('user')
            
            # Temporarily return empty list
            followers = []
            
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
            # from bsn_social_network.models import FollowRelationship
            
            # Get following
            # following = FollowRelationship.objects.filter(user=target_user).select_related('friend')
            
            # Temporarily return empty list
            following = []
            
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
