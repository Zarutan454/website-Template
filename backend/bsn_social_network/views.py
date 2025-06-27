import logging
logging.basicConfig(level=logging.DEBUG)

from django.shortcuts import render
from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Q, Count, Sum, Exists, OuterRef
from django_filters.rest_framework import DjangoFilterBackend
import uuid
from decimal import Decimal
import datetime
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
import os
from django.conf import settings

from .models import *
from .serializers import *
from .models import FollowRelationship
from .services.mining_service import MiningService
from .permissions import IsOwnerOrAdmin, CanViewGroup

logger = logging.getLogger(__name__)

# Create your views here.

# ========== Authentication Views ==========

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """Logout user by blacklisting the refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        # Logging für Debugging
        print(f"[UserProfileView] API-Response: {data}")
        return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_alpha_access(request):
    """Request alpha access based on different criteria"""
    serializer = AlphaAccessRequestSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        reason = serializer.validated_data['reason']
        
        # Check if user already has alpha access
        if user.is_alpha_user:
            return Response({'error': 'User already has alpha access'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Process different alpha access reasons
        if reason == 'referral':
            referral_count = serializer.validated_data.get('referral_count', 0)
            if referral_count >= 5:  # Minimum 5 referrals
                user.referral_count_for_alpha = referral_count
                user.referral_validation_date = timezone.now()
                user.grant_alpha_access('referral')
                return Response({'message': 'Alpha access granted via referrals!'})
            else:
                return Response({'error': 'Need at least 5 referrals for alpha access'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        elif reason == 'investment':
            investment_amount = serializer.validated_data.get('investment_amount', 0)
            if investment_amount >= 100:  # Minimum $100 investment
                user.ico_investment_amount = investment_amount
                user.investment_validation_date = timezone.now()
                user.grant_alpha_access('investment')
                return Response({'message': 'Alpha access granted via investment!'})
            else:
                return Response({'error': 'Minimum $100 investment required for alpha access'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        elif reason == 'influencer':
            influencer_data = serializer.validated_data.get('influencer_data', {})
            category = influencer_data.get('category')
            follower_count = influencer_data.get('follower_count', 0)
            
            if follower_count >= 1000:  # Minimum 1000 followers
                user.influencer_category = category
                user.follower_count = follower_count
                user.social_media_links = influencer_data.get('social_links', {})
                user.grant_alpha_access('influencer')
                return Response({'message': 'Alpha access granted for influencer!'})
            else:
                return Response({'error': 'Minimum 1000 followers required for alpha access'}, 
                              status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ========== Social Network Views ==========

class LargePagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostViewSet(ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['group', 'author']
    search_fields = ['content']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    pagination_class = LargePagePagination
    
    def get_queryset(self):
        user = self.request.user
        # Annotate each post with bookmark status for the current user
        queryset = Post.objects.all().select_related('author', 'group').prefetch_related('likes', 'comments').annotate(
            likes_count=Count('likes'),
            comments_count=Count('comments', distinct=True)
        )
        # Add is_bookmarked field
        bookmarked_posts = Bookmark.objects.filter(user=user).values_list('post_id', flat=True)
        queryset = queryset.annotate(
            is_bookmarked_by_user=Q(id__in=bookmarked_posts)
        )
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        
        # Grant a mining boost for creating a post
        try:
            MiningService.create_boost(user=self.request.user, boost_type='post')
        except Exception as e:
            logger.error(f"Failed to create mining boost for user {self.request.user.id} on post creation: {e}")
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(
            user=request.user, 
            post=post,
            defaults={'created_at': timezone.now()}
        )
        if not created:
            like.delete()
            post.refresh_from_db()  # Sicherstellen, dass der Like-Zähler aktuell ist
            return Response({
                'liked': False,
                'like_count': post.likes.count()
            })
        post.refresh_from_db()  # Sicherstellen, dass der Like-Zähler aktuell ist
        return Response({
            'liked': True,
            'like_count': post.likes.count()
        })
    
    @action(detail=True, methods=['post'], url_path='toggle-like')
    def toggle_like(self, request, pk=None):
        """Toggle like/unlike for a post - Frontend expects this endpoint"""
        post = self.get_object()
        like, created = Like.objects.get_or_create(
            user=request.user, 
            post=post,
            defaults={'created_at': timezone.now()}
        )
        
        boost_granted = False
        if not created:
            like.delete()
            post.refresh_from_db()
            return Response({
                'liked': False,
                'like_count': post.likes.count(),
                'boost_granted': boost_granted
            })
        
        # If a new like was created, grant a boost
        try:
            MiningService.create_boost(user=request.user, boost_type='like')
            boost_granted = True
        except Exception as e:
            # Log the error but don't block the like action
            logger.error(f"Failed to create mining boost for user {request.user.id} on like action: {e}")

        post.refresh_from_db()
        return Response({
            'liked': True,
            'like_count': post.likes.count(),
            'boost_granted': boost_granted
        })
    
    @action(detail=True, methods=['get'], url_path='comments')
    def get_comments(self, request, pk=None):
        """Get comments for a specific post - Frontend expects this endpoint"""
        post = self.get_object()
        comments = Comment.objects.filter(post=post).select_related('author').order_by('created_at')
        
        # Pagination
        page = self.paginate_queryset(comments)
        if page is not None:
            serializer = CommentSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='comments/create')
    def create_comment(self, request, pk=None):
        """Create a comment for a specific post - Frontend expects this endpoint"""
        post = self.get_object()
        serializer = CommentSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            
            boost_granted = False
            try:
                # Grant a boost for creating a comment
                MiningService.create_boost(user=request.user, boost_type='comment')
                boost_granted = True
            except Exception as e:
                logger.error(f"Failed to create mining boost for user {request.user.id} on comment action: {e}")

            response_data = serializer.data
            response_data['boost_granted'] = boost_granted
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='bookmark')
    def bookmark(self, request, pk=None):
        """Bookmark or unbookmark a post."""
        post = self.get_object()
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)

        if not created:
            bookmark.delete()
            return Response({'bookmarked': False}, status=status.HTTP_200_OK)
        
        return Response({'bookmarked': True}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='unbookmark')
    def unbookmark(self, request, pk=None):
        """Remove bookmark from a post - Frontend expects this endpoint"""
        post = self.get_object()
        try:
            bookmark = Bookmark.objects.get(user=request.user, post=post)
            bookmark.delete()
            return Response({'bookmarked': False}, status=status.HTTP_200_OK)
        except Bookmark.DoesNotExist:
            return Response({'bookmarked': False}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Share a post and increment the share count"""
        post = self.get_object()
        
        # Increment the share count
        post.shares_count += 1
        post.save(update_fields=['shares_count'])
        
        return Response({
            'shared': True,
            'shares_count': post.shares_count,
            'message': 'Post shared successfully'
        })

class CommentViewSet(ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post']
    ordering = ['created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.can_access_alpha():
            return Comment.objects.all().select_related('author', 'post')
        else:
            return Comment.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        like, created = Like.objects.get_or_create(
            user=request.user, 
            comment=comment,
            defaults={'created_at': timezone.now()}
        )
        if not created:
            like.delete()
            return Response({'liked': False})
        return Response({'liked': True})

class GroupViewSet(ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Group.objects.all().select_related('creator').prefetch_related('memberships').annotate(
            member_count=Count('memberships', distinct=True),
            posts_count=Count('posts', distinct=True)
        )

        tab = self.request.query_params.get('tab', None)
        if tab == 'my-groups':
            queryset = queryset.filter(memberships__user=user)
        elif tab == 'suggested':
            # Basic suggestion: groups user is not in yet
            queryset = queryset.exclude(memberships__user=user)

        # Annotate with 'is_member' for the current user
        queryset = queryset.annotate(
            is_member=Exists(GroupMembership.objects.filter(group=OuterRef('pk'), user=user))
        )
        
        return queryset
    
    def perform_create(self, serializer):
        group = serializer.save(creator=self.request.user)
        # Auto-add creator as admin
        GroupMembership.objects.create(group=group, user=self.request.user, role='admin')
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        group = self.get_object()
        membership, created = GroupMembership.objects.get_or_create(
            group=group, 
            user=request.user,
            defaults={'role': 'member'}
        )
        if created:
            return Response({'joined': True})
        return Response({'error': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        group = self.get_object()
        try:
            membership = GroupMembership.objects.get(group=group, user=request.user)
            if membership.role == 'admin' and group.memberships.filter(role='admin').count() == 1:
                return Response({'error': 'Cannot leave as the only admin'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            membership.delete()
            return Response({'left': True})
        except GroupMembership.DoesNotExist:
            return Response({'error': 'Not a member'}, status=status.HTTP_400_BAD_REQUEST)

class FriendshipViewSet(ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.filter(
            Q(requester=user) | Q(receiver=user)
        ).select_related('requester', 'receiver')
    
    @action(detail=False, methods=['post'])
    def send_request(self, request):
        username = request.data.get('username')
        try:
            receiver = User.objects.get(username=username)
            if receiver == request.user:
                return Response({'error': 'Cannot send friend request to yourself'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            friendship, created = Friendship.objects.get_or_create(
                requester=request.user,
                receiver=receiver,
                defaults={'status': 'pending'}
            )
            if created:
                return Response({'message': 'Friend request sent'})
            return Response({'error': 'Friend request already exists'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        friendship.status = 'accepted'
        friendship.save()
        return Response({'message': 'Friend request accepted'})
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        friendship.status = 'declined'
        friendship.save()
        return Response({'message': 'Friend request declined'})

# ========== Token & Wallet Views ==========

class WalletView(generics.RetrieveAPIView):
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return wallet

class TokenTransactionViewSet(ReadOnlyModelViewSet):
    serializer_class = TokenTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        return TokenTransaction.objects.filter(
            Q(from_wallet__user=user) | Q(to_wallet__user=user)
        ).select_related('from_wallet__user', 'to_wallet__user')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transfer_tokens(request):
    """Transfer tokens between users"""
    serializer = TokenTransferSerializer(data=request.data)
    if serializer.is_valid():
        from_user = request.user
        to_username = serializer.validated_data['to_user']
        amount = serializer.validated_data['amount']
        note = serializer.validated_data.get('note', '')
        
        try:
            to_user = User.objects.get(username=to_username)
            from_wallet, _ = Wallet.objects.get_or_create(user=from_user)
            to_wallet, _ = Wallet.objects.get_or_create(user=to_user)
            
            # Check balance
            if from_wallet.balance < amount:
                return Response({'error': 'Insufficient balance'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Create transaction
            with transaction.atomic():
                # Deduct from sender
                from_wallet.balance -= amount
                from_wallet.save()
                
                # Add to receiver
                to_wallet.balance += amount
                to_wallet.save()
                
                # Create transaction record
                tx = TokenTransaction.objects.create(
                    transaction_hash=str(uuid.uuid4()),
                    from_wallet=from_wallet,
                    to_wallet=to_wallet,
                    amount=amount,
                    transaction_type='transfer',
                    status='completed',
                    metadata={'note': note},
                    completed_at=timezone.now()
                )
                
                return Response({
                    'message': 'Transfer successful',
                    'transaction': TokenTransactionSerializer(tx).data
                })
        
        except User.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ========== Mining Views ==========

class MiningProgressView(generics.RetrieveAPIView):
    serializer_class = MiningProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        mining, created = MiningProgress.objects.get_or_create(user=self.request.user)
        return mining

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_mining(request):
    """Start mining session using the centralized service."""
    user = request.user
    if not user.can_access_alpha():
        return Response({'error': 'Alpha access required for mining'}, 
                      status=status.HTTP_403_FORBIDDEN)
    
    try:
        success = MiningService.start_mining_session(user)
        if success:
            # Return fresh stats to sync frontend immediately
            stats = MiningService.get_user_mining_stats(user)
            return Response(stats)
        else:
            return Response({'error': 'Could not start mining session.'}, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Failed to start mining for user {user.id}: {e}")
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mining_stats(request):
    """Get comprehensive mining statistics for the logged-in user."""
    try:
        stats = MiningService.get_user_mining_stats(request.user)
        return Response(stats)
    except Exception as e:
        logger.error(f"Failed to get mining stats for user {request.user.id}: {e}")
        return Response({'error': 'Could not retrieve mining statistics.'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_mining_session(request):
    """Stops the mining session for the logged-in user."""
    try:
        success = MiningService.stop_mining_session(request.user)
        if success:
            stats = MiningService.get_user_mining_stats(request.user)
            return Response(stats)
        else:
            return Response({'error': 'Could not stop mining session.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Failed to stop mining session for user {request.user.id}: {e}")
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_tokens(request):
    """Claims the accumulated mining rewards for the user."""
    try:
        success = MiningService.claim_tokens(request.user)
        if success:
            return Response({'message': 'Tokens claimed successfully.'})
        else:
            return Response({'error': 'Could not claim tokens.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Failed to claim tokens for user {request.user.id}: {e}")
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_achievements(request):
    """Get all mining achievements for the logged-in user."""
    # Placeholder implementation
    return Response([])

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mining_heartbeat(request):
    """Update mining heartbeat using MiningService"""
    user = request.user
    if not user.can_access_alpha():
        return Response({'error': 'Alpha access required for mining'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Use MiningService to update heartbeat and calculate tokens
        success = MiningService.update_heartbeat(user)
        
        if success:
            # Get updated stats
            stats = MiningService.get_user_mining_stats(user)
            return Response({
                'message': 'Heartbeat updated successfully',
                'is_mining': stats['is_mining'],
                'accumulated_tokens': stats['accumulated_tokens'],
                'current_rate_per_minute': stats['current_rate_per_minute']
            })
        else:
            return Response({'error': 'Failed to update heartbeat'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        logger.error(f"Error updating mining heartbeat for user {user.username}: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mining_activity_check(request):
    """Update activity check timestamp"""
    user = request.user
    if not user.can_access_alpha():
        return Response({'error': 'Alpha access required for mining'}, status=status.HTTP_403_FORBIDDEN)
    try:
        mining, _ = MiningProgress.objects.get_or_create(user=user)
        now = timezone.now()
        mining.last_inactive_check = now
        mining.updated_at = now
        mining.save(update_fields=['last_inactive_check', 'updated_at'])
        return Response({
            'message': 'Activity check updated successfully',
            'last_inactive_check': mining.last_inactive_check.isoformat()
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_mining_inactivity(request):
    """Stop mining due to inactivity"""
    user = request.user
    if not user.can_access_alpha():
        return Response({'error': 'Alpha access required for mining'}, status=status.HTTP_403_FORBIDDEN)
    try:
        mining, _ = MiningProgress.objects.get_or_create(user=user)
        mining.is_mining = False
        mining.save(update_fields=['is_mining'])
        return Response({
            'message': 'Mining stopped due to inactivity',
            'is_mining': mining.is_mining
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_mining_boost(request):
    """Create a mining boost for a user"""
    user = request.user
    
    # Check alpha access
    if not user.can_access_alpha():
        return Response({'error': 'Alpha access required for mining'}, 
                      status=status.HTTP_403_FORBIDDEN)
    
    try:
        boost_type = request.data.get('boost_type')
        multiplier = request.data.get('multiplier')
        
        if not boost_type:
            return Response({'error': 'boost_type is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Validate boost type
        valid_boost_types = ['post', 'comment', 'like', 'share', 'login', 'referral']
        if boost_type not in valid_boost_types:
            return Response({'error': f'Invalid boost_type. Must be one of: {valid_boost_types}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Convert multiplier to Decimal if provided
        if multiplier:
            try:
                multiplier = Decimal(str(multiplier))
            except (ValueError, TypeError):
                return Response({'error': 'Invalid multiplier value'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        # Use MiningService to create boost
        boost = MiningService.create_boost(user, boost_type, multiplier)
        
        return Response({
            'message': f'{boost_type} boost created successfully',
            'boost': {
                'id': boost.id,
                'boost_type': boost.boost_type,
                'multiplier': str(boost.multiplier),
                'expires_at': boost.expires_at.isoformat(),
                'is_active': boost.is_active
            }
        })
    
    except Exception as e:
        logger.error(f"Error creating mining boost for user {user.username}: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== DAO & Governance Views ==========

class DAOViewSet(ModelViewSet):
    serializer_class = DAOSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.can_access_alpha():
            return DAO.objects.all().select_related('creator').prefetch_related('memberships')
        else:
            return DAO.objects.none()
    
    def perform_create(self, serializer):
        dao = serializer.save(creator=self.request.user)
        # Auto-add creator as admin
        DAOMembership.objects.create(dao=dao, user=self.request.user, role='admin', voting_power=10)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        dao = self.get_object()
        membership, created = DAOMembership.objects.get_or_create(
            dao=dao, 
            user=request.user,
            defaults={'role': 'member', 'voting_power': 1}
        )
        if created:
            return Response({'joined': True})
        return Response({'error': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)

class ProposalViewSet(ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['dao', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.can_access_alpha():
            return Proposal.objects.all().select_related('dao', 'creator').prefetch_related('votes')
        else:
            return Proposal.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        proposal = self.get_object()
        serializer = CreateVoteSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if user is DAO member
            try:
                membership = DAOMembership.objects.get(dao=proposal.dao, user=request.user)
            except DAOMembership.DoesNotExist:
                return Response({'error': 'Must be DAO member to vote'}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            # Check if voting is active
            now = timezone.now()
            if now < proposal.start_date or now > proposal.end_date:
                return Response({'error': 'Voting period is not active'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Create or update vote
            vote, created = Vote.objects.update_or_create(
                proposal=proposal,
                voter=request.user,
                defaults={
                    'vote': serializer.validated_data['vote'],
                    'voting_power': membership.voting_power,
                    'reason': serializer.validated_data.get('reason', '')
                }
            )
            
            return Response({
                'message': 'Vote recorded successfully',
                'vote': VoteSerializer(vote).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ========== ICO & Investment Views ==========

class ICOTokenReservationViewSet(ModelViewSet):
    serializer_class = ICOTokenReservationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return ICOTokenReservation.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_ico_reservation(request):
    """Create a new ICO token reservation"""
    serializer = CreateICOReservationSerializer(data=request.data)
    if serializer.is_valid():
        amount_usd = serializer.validated_data['amount_usd']
        payment_method = serializer.validated_data['payment_method']
        
        # Calculate token amount (example: $0.10 per token)
        token_price = Decimal('0.10')
        tokens_reserved = amount_usd / token_price
        
        # Generate payment address (simplified)
        payment_addresses = {
            'ethereum': '0x742d35Cc6634C0532925a3b8D400631d30c6b23c',
            'polygon': '0x742d35Cc6634C0532925a3b8D400631d30c6b23c',
            'bsc': '0x742d35Cc6634C0532925a3b8D400631d30c6b23c',
            'solana': 'So11111111111111111111111111111111111111112'
        }
        
        # Create reservation
        reservation = ICOTokenReservation.objects.create(
            user=request.user,
            amount_usd=amount_usd,
            tokens_reserved=tokens_reserved,
            payment_method=payment_method,
            payment_address=payment_addresses[payment_method],
            expires_at=timezone.now() + datetime.timedelta(hours=24)
        )
        
        return Response({
            'message': 'ICO reservation created successfully',
            'reservation': ICOTokenReservationSerializer(reservation).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ========== NFT Views ==========

class NFTViewSet(ReadOnlyModelViewSet):
    serializer_class = NFTSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'creator', 'nft_type', 'rarity']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.can_access_alpha():
            return NFT.objects.all().select_related('owner', 'creator')
        else:
            return NFT.objects.none()

# ========== Notification Views ==========

class NotificationViewSet(ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type', 'is_read']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': f'Marked {updated} notifications as read'})
    
    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})

# ========== Settings Views ==========

class UserSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings

class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(user=self.request.user)
        return settings

# ========== Demo System Views ==========

class DemoTokenViewSet(ReadOnlyModelViewSet):
    serializer_class = DemoTokenSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['token_name', 'token_symbol', 'influencer__username']
    
    def get_queryset(self):
        return DemoToken.objects.all().select_related('influencer')

class DemoTransactionViewSet(ReadOnlyModelViewSet):
    serializer_class = DemoTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['demo_token', 'from_user', 'to_user']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return DemoTransaction.objects.all().select_related('demo_token', 'from_user', 'to_user')

# ========== New Dashboard API Views ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mining_leaderboard(request):
    """Get mining leaderboard data"""
    try:
        # Get top miners by total mined tokens
        top_miners = MiningProgress.objects.select_related('user').order_by(
            '-total_mined'
        )[:10]
        
        leaderboard_data = []
        for rank, mining_progress in enumerate(top_miners, 1):
            user_data = {
                'id': mining_progress.user.id,
                'username': mining_progress.user.username,
                'total_points': float(mining_progress.total_mined),
                'total_tokens_earned': float(mining_progress.total_mined),
                'streak_days': mining_progress.streak_days,
                'rank': rank,
                'mining_power': float(mining_progress.mining_power),
                'last_claim_time': mining_progress.last_claim_time
            }
            leaderboard_data.append(user_data)
        
        return Response({
            'leaderboard': leaderboard_data,
            'total_miners': MiningProgress.objects.count(),
            'user_rank': get_user_rank(request.user) if request.user.is_authenticated else None
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch leaderboard'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_user_rank(user):
    """Get user's rank in mining leaderboard"""
    try:
        user_mining = MiningProgress.objects.get(user=user)
        higher_ranked = MiningProgress.objects.filter(
            total_mined__gt=user_mining.total_mined
        ).count()
        return higher_ranked + 1
    except MiningProgress.DoesNotExist:
        return None

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mining_activities(request):
    """Get mining activities for dashboard"""
    try:
        user_mining = MiningProgress.objects.get(user=request.user)
        
        # Create mock activities based on mining data
        activities = [
            {
                'id': 1,
                'type': 'mining_reward',
                'description': f'Earned {float(user_mining.mining_power)} BSN tokens',
                'amount': float(user_mining.mining_power),
                'timestamp': user_mining.last_claim_time,
                'status': 'completed'
            },
            {
                'id': 2,
                'type': 'streak_bonus',
                'description': f'Streak bonus: {user_mining.streak_days} days',
                'amount': user_mining.streak_days * 0.1,
                'timestamp': user_mining.last_claim_time,
                'status': 'completed'
            }
        ]
        
        # Add more activities if user has mined tokens
        if float(user_mining.total_mined) > 0:
            activities.append({
                'id': 3,
                'type': 'claim_tokens',
                'description': f'Claimed {float(user_mining.accumulated_tokens)} BSN',
                'amount': float(user_mining.accumulated_tokens),
                'timestamp': user_mining.last_claim_time,
                'status': 'completed'
            })
        
        return Response({
            'activities': activities,
            'total_activities': len(activities),
            'mining_stats': {
                'total_mined': float(user_mining.total_mined),
                'mining_power': float(user_mining.mining_power),
                'streak_days': user_mining.streak_days
            }
        })
        
    except MiningProgress.DoesNotExist:
        return Response({
            'activities': [],
            'total_activities': 0,
            'mining_stats': {
                'total_mined': 0.0,
                'mining_power': 1.0,
                'streak_days': 0
            }
        })
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch mining activities'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_nfts(request):
    """Get user's NFT collection"""
    try:
        user_nfts = NFT.objects.filter(owner=request.user)
        
        nft_data = []
        for nft in user_nfts:
            nft_info = {
                'id': nft.id,
                'name': nft.name,
                'description': nft.description,
                'image_url': nft.image_url or '/images/features/nft.png',
                'collection_name': nft.collection_name or 'BSN Collection',
                'price': float(nft.price) if nft.price else None,
                'currency': nft.currency or 'ETH',
                'is_for_sale': nft.listed,
                'rarity': nft.rarity or 'Common',
                'views': 0,  # Would need to implement view tracking
                'likes': 0,  # Would need to implement like system
                'creator': nft.creator.username if nft.creator else 'Unknown',
                'created_at': nft.created_at.isoformat()
            }
            nft_data.append(nft_info)
        
        # Add mock NFTs if user has none
        if not nft_data:
            mock_nfts = [
                {
                    'id': 'demo_1',
                    'name': 'BSN Genesis #001',
                    'description': 'Welcome to BSN! This is your first NFT.',
                    'image_url': '/images/features/nft.png',
                    'collection_name': 'BSN Welcome',
                    'price': None,
                    'currency': 'ETH',
                    'is_for_sale': False,
                    'rarity': 'Common',
                    'views': 42,
                    'likes': 7,
                    'creator': 'BSN Team',
                    'created_at': timezone.now().isoformat()
                }
            ]
            nft_data = mock_nfts
        
        return Response({
            'nfts': nft_data,
            'total_nfts': len(nft_data),
            'collection_stats': {
                'for_sale': len([nft for nft in nft_data if nft['is_for_sale']]),
                'total_value': sum([nft['price'] for nft in nft_data if nft['price']]),
                'rare_items': len([nft for nft in nft_data if nft['rarity'] in ['Epic', 'Legendary']])
            }
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch NFTs'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_proposals(request):
    """Get active DAO proposals"""
    try:
        # Get active proposals
        proposals = Proposal.objects.filter(status='active').select_related('dao')
        
        proposal_data = []
        for proposal in proposals:
            # Calculate vote counts
            votes = Vote.objects.filter(proposal=proposal)
            votes_for = votes.filter(vote='for').aggregate(
                total=Sum('voting_power')
            )['total'] or 0
            votes_against = votes.filter(vote='against').aggregate(
                total=Sum('voting_power')
            )['total'] or 0
            
            # Check if user has voted
            user_vote = votes.filter(voter=request.user).first()
            
            proposal_info = {
                'id': proposal.id,
                'title': proposal.title,
                'description': proposal.description,
                'status': proposal.status,
                'votes_for': int(votes_for),
                'votes_against': int(votes_against),
                'total_votes': int(votes_for + votes_against),
                'quorum': proposal.quorum or 100,
                'end_date': proposal.end_date.isoformat() if proposal.end_date else None,
                'dao': {
                    'name': proposal.dao.name,
                    'member_count': DAOMembership.objects.filter(dao=proposal.dao).count()
                },
                'user_voted': user_vote is not None,
                'user_vote': user_vote.vote if user_vote else None
            }
            proposal_data.append(proposal_info)
        
        return Response({
            'proposals': proposal_data,
            'total_active': len(proposal_data),
            'user_participation': {
                'total_votes': Vote.objects.filter(voter=request.user).count(),
                'active_daos': DAOMembership.objects.filter(user=request.user).count()
            }
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch proposals'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_on_proposal(request, proposal_id):
    """Vote on a DAO proposal"""
    try:
        proposal = get_object_or_404(Proposal, id=proposal_id)
        vote_choice = request.data.get('vote')
        
        if vote_choice not in ['for', 'against', 'abstain']:
            return Response(
                {'error': 'Invalid vote choice'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is DAO member
        try:
            membership = DAOMembership.objects.get(dao=proposal.dao, user=request.user)
        except DAOMembership.DoesNotExist:
            return Response(
                {'error': 'Must be DAO member to vote'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already voted
        if Vote.objects.filter(proposal=proposal, voter=request.user).exists():
            return Response(
                {'error': 'Already voted on this proposal'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create vote
        vote = Vote.objects.create(
            proposal=proposal,
            voter=request.user,
            vote=vote_choice,
            voting_power=membership.voting_power,
            reason=request.data.get('reason', '')
        )
        
        return Response({
            'message': 'Vote recorded successfully',
            'vote': {
                'id': vote.id,
                'vote': vote.vote,
                'voting_power': vote.voting_power
            }
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to record vote'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Achievement Endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_achievements(request, user_id):
    """
    Get achievements for a specific user
    """
    try:
        user = get_object_or_404(User, id=user_id)
        achievements = UserAchievement.objects.filter(user=user).select_related('achievement')
        
        serializer = UserAchievementSerializer(achievements, many=True)
        
        return Response(serializer.data)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching user achievements: {e}")
        return Response({'error': 'Failed to fetch achievements'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== Story Views ==========

class StoryViewSet(ModelViewSet):
    """
    ViewSet for managing user stories
    """
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Return stories that haven't expired and are visible to the current user
        """
        now = timezone.now()
        return Story.objects.filter(expires_at__gt=now).select_related('author')
    
    def perform_create(self, serializer):
        """
        Create a new story with automatic expiration time
        """
        # Stories expire after 24 hours
        expires_at = timezone.now() + timezone.timedelta(hours=24)
        serializer.save(author=self.request.user, expires_at=expires_at)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            logger.error(f"Story creation failed: {e.detail}")
            return Response({'error': 'Validation error', 'details': e.detail}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error during story creation: {str(e)}", exc_info=True)
            return Response({'error': 'Unexpected error', 'details': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_stories(request):
    """
    Get current user's active stories
    """
    try:
        now = timezone.now()
        stories = Story.objects.filter(
            author=request.user,
            expires_at__gt=now
        ).order_by('-created_at')
        
        serializer = StorySerializer(stories, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching user stories: {str(e)}", exc_info=True)
        return Response({'error': 'Failed to fetch stories', 'details': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_following_stories(request):
    """
    Get stories from users that the current user is following
    """
    try:
        now = timezone.now()
        
        # Get users that the current user is following
        following_users = FollowRelationship.objects.filter(
            user=request.user
        ).values_list('friend_id', flat=True)
        
        # Get stories from followed users
        stories = Story.objects.filter(
            author_id__in=following_users,
            expires_at__gt=now
        ).select_related('author').order_by('-created_at')
        
        serializer = StorySerializer(stories, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching following stories: {e}")
        return Response({'error': 'Failed to fetch stories'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_story_viewed(request, story_id):
    """
    Mark a story as viewed by the current user
    """
    try:
        story = get_object_or_404(Story, id=story_id)
        
        # Create or get story view record
        story_view, created = StoryView.objects.get_or_create(
            story=story,
            user=request.user,
            defaults={'viewed_at': timezone.now()}
        )
        
        return Response({
            'message': 'Story marked as viewed',
            'viewed_at': story_view.viewed_at
        })
    except Story.DoesNotExist:
        return Response({'error': 'Story not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error marking story as viewed: {e}")
        return Response({'error': 'Failed to mark story as viewed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== Media Upload Views ==========
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_media(request):
    """
    Upload media files (images, videos) for posts and stories
    """
    try:
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if uploaded_file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type'}, status=status.HTTP_400_BAD_REQUEST)
        
        ext = uploaded_file.name.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        media_dir = os.path.join(settings.MEDIA_ROOT, 'stories')
        os.makedirs(media_dir, exist_ok=True)
        file_path = os.path.join(media_dir, filename)
        
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        # Return full URL instead of relative path
        media_url = f"http://localhost:8000/media/stories/{filename}"
        return Response({'url': media_url}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
