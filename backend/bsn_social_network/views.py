import logging
logger = logging.getLogger(__name__)

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
from django.db.models import Q, Count, Sum, Exists, OuterRef, Max
from django_filters.rest_framework import DjangoFilterBackend
import uuid
from decimal import Decimal
import datetime
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import base64
import time
import random
from datetime import timedelta
from urllib.parse import urlparse
from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
import requests
from django.utils.dateparse import parse_datetime
import asyncio

from .models import *
from .serializers import *
from .models import FollowRelationship
from .services.mining_service import MiningService
from .permissions import IsOwnerOrAdmin, CanViewGroup
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .services.feed_service import FeedService
from .services.messaging_service import MessagingService
from .serializers import LikeSerializer, PostSerializer, CommentSerializer
from .models import Story, StoryReaction, StoryReply, StoryPoll, StoryMusic, StorySticker, StoryHighlight
from .serializers import (
    StoryReactionSerializer, StoryReplySerializer, StoryPollSerializer, StoryMusicSerializer, StoryStickerSerializer, StoryHighlightSerializer, StoryViewSerializer, StorySerializer
)
from .models import GroupEvent
from .serializers import GroupEventSerializer
from .serializers import ContentReportSerializer
from .models import GroupEventRSVP
from .serializers import GroupEventRSVPSerializer
from .serializers import GroupMembershipSerializer
from .models import PostPoll
from .serializers import PostPollSerializer
from .services.online_presence import get_online_status

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
        logger.debug(f"[UserProfileView] API-Response: {data}")
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
        post = serializer.save(author=self.request.user)
        
        # Grant a mining boost for creating a post
        try:
            MiningService.create_boost(user=self.request.user, boost_type='post')
        except Exception as e:
            logger.error(f"Failed to create mining boost for user {self.request.user.id} on post creation: {e}")
        
        # Notify followers about new post via WebSocket
        try:
            FeedService.notify_new_post(post)
        except Exception as e:
            logger.error(f"Failed to notify new post: {e}")
        
        return post
    
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
        """Share a post and track sharing activity"""
        try:
            post = self.get_object()
            user = request.user
            
            # Create share record
            share_data = {
                'post': post,
                'user': user,
                'share_type': request.data.get('share_type', 'general'),
                'platform': request.data.get('platform', 'unknown'),
                'shared_at': timezone.now()
            }
            
            # Track share in database (if you have a Share model)
            # Share.objects.create(**share_data)
            
            # Generate share URL
            share_url = f"{request.build_absolute_uri('/')}post/{post.id}/"
            
            # Update post share count
            post.shares_count = (post.shares_count or 0) + 1
            post.save(update_fields=['shares_count'])
            
            # Create notification for post author
            if user != post.author:
                Notification.objects.create(
                    user=post.author,
                    type='post_shared',
                    title=f'{user.username} hat deinen Post geteilt',
                    message=f'{user.username} hat deinen Post "{post.content[:50]}..." geteilt',
                    data={'post_id': post.id, 'shared_by': user.id}
                )
            
            return Response({
                'success': True,
                'message': 'Post erfolgreich geteilt',
                'share_url': share_url,
                'shares_count': post.shares_count
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    """Like or unlike a post"""
    try:
        post = Post.objects.get(id=post_id)
        user = request.user
        
        # Check if already liked
        like, created = Like.objects.get_or_create(
            user=user,
            post=post
        )
        
        if not created:
            # Unlike
            like.delete()
            post.likes_count = max(0, post.likes_count - 1)
            post.save()
            
            # Notify about unlike via WebSocket
            try:
                FeedService.notify_post_liked(post, user)
            except Exception as e:
                logger.error(f"Failed to notify post like: {e}")
            
            return Response({
                'liked': False,
                'likes_count': post.likes_count
            })
        else:
            # Like
            post.likes_count += 1
            post.save()
            
            # Notify about like via WebSocket
            try:
                FeedService.notify_post_liked(post, user)
            except Exception as e:
                logger.error(f"Failed to notify post like: {e}")
            
            return Response({
                'liked': True,
                'likes_count': post.likes_count
            })
            
    except Post.DoesNotExist:
        return Response({
            'error': 'Post not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        import logging
        logger = logging.getLogger('django')
        try:
            logger.error('GroupViewSet.perform_create: request.data = %s', dict(self.request.data))
            logger.error('GroupViewSet.perform_create: serializer.validated_data = %s', getattr(serializer, 'validated_data', 'NO validated_data'))
            logger.error('GroupViewSet.perform_create: token_gated (raw) = %s', self.request.data.get('token_gated', 'NOT SET'))
            group = serializer.save(creator=self.request.user)
            logger.error('GroupViewSet.perform_create: group.token_gated (saved) = %s', getattr(group, 'token_gated', 'NOT SET'))
            GroupMembership.objects.create(group=group, user=self.request.user, role='admin')
        except Exception as e:
            logger.exception('GroupViewSet.perform_create: Exception during group creation: %s', e)
            raise
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        group = self.get_object()
        
        # Token-Gated Check
        if getattr(group, 'token_gated', False):
            # Check if user has wallet address
            if not request.user.wallet_address:
                return Response({
                    'error': 'Für diese Gruppe ist ein Token erforderlich. Bitte verbinde deine Wallet.',
                    'requires_wallet': True
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if required token contract is set
            if not group.required_token_contract:
                logger.error(f'Group {group.id} is token-gated but has no required_token_contract')
                return Response({
                    'error': 'Gruppen-Konfiguration fehlerhaft. Bitte kontaktiere den Administrator.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # TODO: Implement actual Web3 token check
            # For now, we'll do a basic validation
            try:
                # Basic contract address validation
                if not group.required_token_contract.startswith('0x') or len(group.required_token_contract) != 42:
                    logger.error(f'Invalid contract address for group {group.id}: {group.required_token_contract}')
                    return Response({
                        'error': 'Ungültige Token-Contract-Adresse in der Gruppen-Konfiguration.'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # TODO: Add actual Web3 token balance check here
                # from .services.web3_service import Web3Service
                # web3_service = Web3Service()
                # has_token = web3_service.check_token_balance(
                #     request.user.wallet_address,
                #     group.required_token_contract,
                #     group.required_token_amount
                # )
                
                # For now, we'll assume the user has the token if they have a wallet
                has_token = True
                
                if not has_token:
                    return Response({
                        'error': f'Du besitzt nicht den erforderlichen Token für diese Gruppe.',
                        'required_contract': group.required_token_contract
                    }, status=status.HTTP_403_FORBIDDEN)
                    
            except Exception as e:
                logger.error(f'Token check failed for group {group.id}: {e}')
                return Response({
                    'error': 'Token-Überprüfung fehlgeschlagen. Bitte versuche es später erneut.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create membership
        try:
            membership, created = GroupMembership.objects.get_or_create(
                group=group, 
                user=request.user,
                defaults={'role': 'member'}
            )
            
            if created:
                # Update member count
                group.member_count = group.memberships.count()
                group.save(update_fields=['member_count'])
                
                return Response({
                    'joined': True,
                    'message': f'Du bist der Gruppe "{group.name}" beigetreten.'
                })
            else:
                return Response({
                    'error': 'Du bist bereits Mitglied dieser Gruppe.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f'Error creating group membership: {e}')
            return Response({
                'error': 'Fehler beim Beitreten der Gruppe. Bitte versuche es später erneut.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        group = self.get_object()
        memberships = group.memberships.select_related('user').all()
        paginator = PageNumberPagination()
        paginator.page_size = 20
        result_page = paginator.paginate_queryset(memberships, request)
        serializer = GroupMembershipSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        group = self.get_object()
        # Zeitraum-Filter
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        from datetime import datetime, timedelta
        if start_date:
            start = parse_datetime(start_date)
        else:
            start = datetime.now() - timedelta(days=30)
        if end_date:
            end = parse_datetime(end_date)
        else:
            end = datetime.now()
        # Gesamte Zahlen
        member_count = group.memberships.count()
        posts_count = group.posts.count()
        comments_count = group.posts.filter(comments__isnull=False).count()
        # Zeitraum-Zahlen
        new_members = group.memberships.filter(joined_at__gte=start, joined_at__lte=end).count()
        new_posts = group.posts.filter(created_at__gte=start, created_at__lte=end).count()
        new_comments = group.posts.filter(comments__created_at__gte=start, comments__created_at__lte=end).count()
        return Response({
            'group_id': group.id,
            'name': group.name,
            'member_count': member_count,
            'posts_count': posts_count,
            'comments_count': comments_count,
            'new_members': new_members,
            'new_posts': new_posts,
            'new_comments': new_comments,
            'start_date': start.isoformat(),
            'end_date': end.isoformat(),
        })
    
    @action(detail=True, methods=['get'])
    def reports(self, request, pk=None):
        group = self.get_object()
        reports_count = ContentReport.objects.filter(content_type='group', content_id=group.id).count()
        recent_reports = ContentReport.objects.filter(content_type='group', content_id=group.id).order_by('-created_at')[:5]
        recent = [
            {
                'id': r.id,
                'reason': r.reason,
                'status': r.status,
                'created_at': r.created_at,
            } for r in recent_reports
        ]
        return Response({
            'group_id': group.id,
            'reports_count': reports_count,
            'recent_reports': recent,
        })

    @action(detail=True, methods=['post'], url_path='media/upload', parser_classes=[MultiPartParser, FormParser])
    def media_upload(self, request, pk=None):
        group = self.get_object()
        user = request.user
        # Prüfe Mitgliedschaft
        membership = group.memberships.filter(user=user).first()
        if not membership:
            return Response({'error': 'Nur Mitglieder dürfen Medien hochladen.'}, status=403)
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Keine Datei hochgeladen.'}, status=400)
        # Nur Bild/Video erlauben
        if not file.content_type.startswith('image/') and not file.content_type.startswith('video/'):
            return Response({'error': 'Nur Bild- oder Videodateien erlaubt.'}, status=400)
        # Speicherort
        ext = os.path.splitext(file.name)[1]
        filename = f"group_{group.id}_user_{user.id}_{int(user.id)}{ext}"
        path = os.path.join('groups', str(group.id), 'media', filename)
        saved_path = default_storage.save(path, ContentFile(file.read()))
        file_url = default_storage.url(saved_path)
        # Optional: Post-Objekt anlegen
        from .models import Post
        post = Post.objects.create(
            author=user,
            group=group,
            content='',
            media_url=file_url,
            media_type='image' if file.content_type.startswith('image/') else 'video',
            privacy='public',
        )
        return Response({
            'url': file_url,
            'media_type': post.media_type,
            'size': file.size,
            'post_id': post.id,
        })

    @action(detail=True, methods=['post'], url_path='files/upload', parser_classes=[MultiPartParser, FormParser])
    def file_upload(self, request, pk=None):
        group = self.get_object()
        user = request.user
        # Prüfe Mitgliedschaft
        membership = group.memberships.filter(user=user).first()
        if not membership:
            return Response({'error': 'Nur Mitglieder dürfen Dateien hochladen.'}, status=403)
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Keine Datei hochgeladen.'}, status=400)
        # Nur Dokumente erlauben (kein Bild/Video)
        if file.content_type.startswith('image/') or file.content_type.startswith('video/'):
            return Response({'error': 'Für Bilder/Videos bitte den Medien-Upload nutzen.'}, status=400)
        # Speicherort
        ext = os.path.splitext(file.name)[1]
        filename = f"group_{group.id}_user_{user.id}_{int(user.id)}{ext}"
        path = os.path.join('groups', str(group.id), 'files', filename)
        saved_path = default_storage.save(path, ContentFile(file.read()))
        file_url = default_storage.url(saved_path)
        # Optional: Message-Objekt anlegen (als Datei-Message)
        from .models import Message
        message = Message.objects.create(
            group=group,
            sender=user,
            message_type='file',
            file_name=file.name,
            file_size=file.size,
            file_url=file_url,
        )
        return Response({
            'download_url': file_url,
            'file_name': file.name,
            'file_size': file.size,
            'message_id': message.id,
        })

    @action(detail=True, methods=['post'], url_path='promote')
    def promote(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')
        new_role = request.data.get('role', 'admin')
        if not user_id:
            return Response({'error': 'user_id erforderlich'}, status=400)
        # Nur Admins/Moderatoren dürfen promoten
        membership = group.memberships.filter(user=request.user).first()
        if not membership or membership.role not in ['admin', 'moderator']:
            return Response({'error': 'Keine Berechtigung'}, status=403)
        target = group.memberships.filter(user_id=user_id).first()
        if not target:
            return Response({'error': 'Mitglied nicht gefunden'}, status=404)
        target.role = new_role
        target.save(update_fields=['role'])
        return Response({'success': True, 'user_id': user_id, 'new_role': new_role})

    @action(detail=True, methods=['post'], url_path='demote')
    def demote(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')
        new_role = request.data.get('role', 'member')
        if not user_id:
            return Response({'error': 'user_id erforderlich'}, status=400)
        membership = group.memberships.filter(user=request.user).first()
        if not membership or membership.role not in ['admin', 'moderator']:
            return Response({'error': 'Keine Berechtigung'}, status=403)
        target = group.memberships.filter(user_id=user_id).first()
        if not target:
            return Response({'error': 'Mitglied nicht gefunden'}, status=404)
        target.role = new_role
        target.save(update_fields=['role'])
        return Response({'success': True, 'user_id': user_id, 'new_role': new_role})

    @action(detail=True, methods=['post'], url_path='kick')
    def kick(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id erforderlich'}, status=400)
        membership = group.memberships.filter(user=request.user).first()
        if not membership or membership.role not in ['admin', 'moderator']:
            return Response({'error': 'Keine Berechtigung'}, status=403)
        target = group.memberships.filter(user_id=user_id).first()
        if not target:
            return Response({'error': 'Mitglied nicht gefunden'}, status=404)
        target.delete()
        return Response({'success': True, 'user_id': user_id, 'action': 'kicked'})

    def update(self, request, *args, **kwargs):
        group = self.get_object()
        membership = group.memberships.filter(user=request.user).first()
        if not membership or membership.role not in ['admin', 'moderator']:
            return Response({'error': 'Keine Berechtigung, um die Gruppe zu bearbeiten.'}, status=403)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        group = self.get_object()
        membership = group.memberships.filter(user=request.user).first()
        if not membership or membership.role not in ['admin', 'moderator']:
            return Response({'error': 'Keine Berechtigung, um die Gruppe zu bearbeiten.'}, status=403)
        return super().partial_update(request, *args, **kwargs)

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_nfts(request):
    """Get all NFTs with optional filtering"""
    try:
        user = request.user
        
        # Get query parameters
        featured = request.GET.get('featured') == 'true'
        popular = request.GET.get('popular') == 'true'
        limit = int(request.GET.get('limit', 20))
        owner_id = request.GET.get('owner_id')
        
        # Base queryset
        nfts = NFT.objects.select_related('owner', 'creator')
        
        # Apply filters
        if owner_id:
            nfts = nfts.filter(owner_id=owner_id)
        
        if featured:
            nfts = nfts.filter(is_locked=False).order_by('-created_at')[:limit]
        elif popular:
            nfts = nfts.filter(is_locked=False).order_by('-created_at')[:limit]
        else:
            nfts = nfts.filter(is_locked=False).order_by('-created_at')[:limit]
        
        nfts_data = []
        for nft in nfts:
            nfts_data.append({
                'id': str(nft.id),
                'name': nft.name,
                'description': nft.description,
                'image_url': nft.media_url,
                'token_id': nft.token_id,
                'owner_id': str(nft.owner.id),
                'owner_name': nft.owner.username,
                'creator_id': str(nft.creator.id),
                'creator_name': nft.creator.username,
                'price': float(nft.metadata.get('price', 0)) if nft.metadata else 0,
                'currency': nft.metadata.get('currency', 'ETH') if nft.metadata else 'ETH',
                'listed': nft.metadata.get('listed', False) if nft.metadata else False,
                'view_count': nft.metadata.get('view_count', 0) if nft.metadata else 0,
                'favorite_count': nft.metadata.get('favorite_count', 0) if nft.metadata else 0,
                'created_at': nft.created_at.isoformat(),
                'updated_at': nft.updated_at.isoformat(),
                'metadata': nft.metadata,
                'rarity': nft.rarity,
                'network': nft.metadata.get('network', 'ethereum') if nft.metadata else 'ethereum',
                'contract_address': nft.metadata.get('contract_address', '') if nft.metadata else '',
                'last_sale_price': nft.metadata.get('last_sale_price', 0) if nft.metadata else 0,
                'last_sale_currency': nft.metadata.get('last_sale_currency', 'ETH') if nft.metadata else 'ETH',
            })
        
        return Response({
            'nfts': nfts_data,
            'total': len(nfts_data)
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_nft(request, nft_id):
    """Get a specific NFT"""
    try:
        nft = NFT.objects.select_related('owner', 'creator').get(id=nft_id)
        
        nft_data = {
            'id': str(nft.id),
            'name': nft.name,
            'description': nft.description,
            'image_url': nft.media_url,
            'token_id': nft.token_id,
            'owner_id': str(nft.owner.id),
            'owner_name': nft.owner.username,
            'creator_id': str(nft.creator.id),
            'creator_name': nft.creator.username,
            'price': float(nft.metadata.get('price', 0)) if nft.metadata else 0,
            'currency': nft.metadata.get('currency', 'ETH') if nft.metadata else 'ETH',
            'listed': nft.metadata.get('listed', False) if nft.metadata else False,
            'view_count': nft.metadata.get('view_count', 0) if nft.metadata else 0,
            'favorite_count': nft.metadata.get('favorite_count', 0) if nft.metadata else 0,
            'created_at': nft.created_at.isoformat(),
            'updated_at': nft.updated_at.isoformat(),
            'metadata': nft.metadata,
            'rarity': nft.rarity,
            'network': nft.metadata.get('network', 'ethereum') if nft.metadata else 'ethereum',
            'contract_address': nft.metadata.get('contract_address', '') if nft.metadata else '',
            'last_sale_price': nft.metadata.get('last_sale_price', 0) if nft.metadata else 0,
            'last_sale_currency': nft.metadata.get('last_sale_currency', 'ETH') if nft.metadata else 'ETH',
        }
        
        return Response(nft_data)
        
    except NFT.DoesNotExist:
        return Response({
            'error': 'NFT not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def increment_nft_view(request, nft_id):
    """Increment NFT view count"""
    try:
        nft = NFT.objects.get(id=nft_id)
        
        # Update view count in metadata
        metadata = nft.metadata or {}
        metadata['view_count'] = metadata.get('view_count', 0) + 1
        nft.metadata = metadata
        nft.save()
        
        return Response({
            'success': True,
            'view_count': metadata['view_count']
        })
        
    except NFT.DoesNotExist:
        return Response({
            'error': 'NFT not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_nft(request, nft_id):
    """Buy an NFT"""
    try:
        user = request.user
        buyer_id = request.data.get('buyer_id')
        price = request.data.get('price', 0)
        currency = request.data.get('currency', 'ETH')
        
        nft = NFT.objects.get(id=nft_id)
        
        if not nft.metadata.get('listed', False):
            return Response({
                'error': 'NFT is not listed for sale'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if str(nft.owner.id) == str(buyer_id):
            return Response({
                'error': 'Cannot buy your own NFT'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update NFT ownership
        nft.owner = user
        metadata = nft.metadata or {}
        metadata['listed'] = False
        metadata['last_sale_price'] = price
        metadata['last_sale_currency'] = currency
        nft.metadata = metadata
        nft.save()
        
        return Response({
            'success': True,
            'message': 'NFT purchased successfully'
        })
        
    except NFT.DoesNotExist:
        return Response({
            'error': 'NFT not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def list_nft(request, nft_id):
    """List an NFT for sale"""
    try:
        user = request.user
        price = request.data.get('price', 0)
        currency = request.data.get('currency', 'ETH')
        
        nft = NFT.objects.get(id=nft_id, owner=user)
        
        metadata = nft.metadata or {}
        metadata['listed'] = True
        metadata['price'] = price
        metadata['currency'] = currency
        nft.metadata = metadata
        nft.save()
        
        return Response({
            'success': True,
            'message': 'NFT listed successfully'
        })
        
    except NFT.DoesNotExist:
        return Response({
            'error': 'NFT not found or not owned by user'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unlist_nft(request, nft_id):
    """Unlist an NFT from sale"""
    try:
        user = request.user
        nft = NFT.objects.get(id=nft_id, owner=user)
        
        metadata = nft.metadata or {}
        metadata['listed'] = False
        nft.metadata = metadata
        nft.save()
        
        return Response({
            'success': True,
            'message': 'NFT unlisted successfully'
        })
        
    except NFT.DoesNotExist:
        return Response({
            'error': 'NFT not found or not owned by user'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def favorite_nft(request, nft_id):
    """Favorite an NFT"""
    try:
        user = request.user
        nft = NFT.objects.get(id=nft_id)
        
        metadata = nft.metadata or {}
        metadata['favorite_count'] = metadata.get('favorite_count', 0) + 1
        nft.metadata = metadata
        nft.save()
        
        return Response({
            'success': True,
            'message': 'NFT favorited successfully'
        })
        
    except NFT.DoesNotExist:
        return Response({
            'error': 'NFT not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfavorite_nft(request, nft_id):
    """Unfavorite an NFT"""
    try:
        user = request.user
        nft = NFT.objects.get(id=nft_id)
        
        metadata = nft.metadata or {}
        metadata['favorite_count'] = max(0, metadata.get('favorite_count', 0) - 1)
        nft.metadata = metadata
        nft.save()
        
        return Response({
            'success': True,
            'message': 'NFT unfavorited successfully'
        })
        
    except NFT.DoesNotExist:
        return Response({
            'error': 'NFT not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_nft(request):
    """Create a new NFT"""
    try:
        user = request.user
        name = request.data.get('name')
        description = request.data.get('description', '')
        image_url = request.data.get('image_url')
        price = request.data.get('price', 0)
        currency = request.data.get('currency', 'ETH')
        metadata = request.data.get('metadata', {})
        
        if not name or not image_url:
            return Response({
                'error': 'Name and image_url are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate token ID
        token_id = f"{user.id}_{int(time.time())}_{random.randint(1000, 9999)}"
        
        # Create NFT
        nft = NFT.objects.create(
            token_id=token_id,
            name=name,
            description=description,
            owner=user,
            creator=user,
            nft_type='image',
            media_url=image_url,
            metadata={
                **metadata,
                'price': price,
                'currency': currency,
                'listed': False,
                'view_count': 0,
                'favorite_count': 0,
                'network': 'ethereum',
                'contract_address': '',
            },
            rarity='common'
        )
        
        return Response({
            'success': True,
            'nft_id': str(nft.id),
            'message': 'NFT created successfully'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_nfts(request):
    """Search NFTs with filters"""
    try:
        search_query = request.GET.get('search', '')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        currency = request.GET.get('currency')
        rarity = request.GET.get('rarity')
        collection = request.GET.get('collection')
        
        nfts = NFT.objects.filter(is_locked=False)
        
        if search_query:
            nfts = nfts.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        if rarity:
            nfts = nfts.filter(rarity=rarity)
        
        # Apply price filters if specified
        if min_price or max_price:
            # This would need a more sophisticated approach for price filtering
            # For now, we'll just filter by listed NFTs
            nfts = nfts.filter(metadata__listed=True)
        
        nfts = nfts.order_by('-created_at')[:20]
        
        nfts_data = []
        for nft in nfts:
            nfts_data.append({
                'id': str(nft.id),
                'name': nft.name,
                'description': nft.description,
                'image_url': nft.media_url,
                'token_id': nft.token_id,
                'owner_id': str(nft.owner.id),
                'owner_name': nft.owner.username,
                'creator_id': str(nft.creator.id),
                'creator_name': nft.creator.username,
                'price': float(nft.metadata.get('price', 0)) if nft.metadata else 0,
                'currency': nft.metadata.get('currency', 'ETH') if nft.metadata else 'ETH',
                'listed': nft.metadata.get('listed', False) if nft.metadata else False,
                'view_count': nft.metadata.get('view_count', 0) if nft.metadata else 0,
                'favorite_count': nft.metadata.get('favorite_count', 0) if nft.metadata else 0,
                'created_at': nft.created_at.isoformat(),
                'updated_at': nft.updated_at.isoformat(),
                'metadata': nft.metadata,
                'rarity': nft.rarity,
                'network': nft.metadata.get('network', 'ethereum') if nft.metadata else 'ethereum',
                'contract_address': nft.metadata.get('contract_address', '') if nft.metadata else '',
                'last_sale_price': nft.metadata.get('last_sale_price', 0) if nft.metadata else 0,
                'last_sale_currency': nft.metadata.get('last_sale_currency', 'ETH') if nft.metadata else 'ETH',
            })
        
        return Response({
            'nfts': nfts_data,
            'total': len(nfts_data)
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        return Response({
            'results': serializer.data,
            'count': len(serializer.data)
        })
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
        # LOGGING: Kompletter Payload für Debugging
        import logging
        logger = logging.getLogger('django.request')
        logger.error(f'STORY-POST PAYLOAD: {request.data}')
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
        # Temporarily disable FollowRelationship queries until database is properly migrated
        following_users = []  # Temporarily disabled
        
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
    Upload media files (images, videos) for posts, stories, profile, and groups
    """
    try:
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if uploaded_file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine upload type from request
        upload_type = request.POST.get('type', 'general')  # 'avatar', 'cover', 'story', 'post', 'group_avatar', 'group_banner', etc.
        
        # Create appropriate directory based on upload type
        if upload_type == 'avatar':
            media_dir = os.path.join(settings.MEDIA_ROOT, 'profile_avatars')
        elif upload_type == 'cover':
            media_dir = os.path.join(settings.MEDIA_ROOT, 'profile_covers')
        elif upload_type == 'story':
            media_dir = os.path.join(settings.MEDIA_ROOT, 'stories')
        elif upload_type == 'post':
            media_dir = os.path.join(settings.MEDIA_ROOT, 'posts')
        elif upload_type == 'group_avatar':
            media_dir = os.path.join(settings.MEDIA_ROOT, 'group_avatars')
        elif upload_type == 'group_banner':
            media_dir = os.path.join(settings.MEDIA_ROOT, 'group_banners')
        else:
            media_dir = os.path.join(settings.MEDIA_ROOT, 'general')
        
        # Create directory if it doesn't exist
        os.makedirs(media_dir, exist_ok=True)
        
        # Generate unique filename
        ext = uploaded_file.name.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(media_dir, filename)
        
        # Save file
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        # Return appropriate URL based on upload type
        if upload_type == 'avatar':
            media_url = f"http://localhost:8000/media/profile_avatars/{filename}"
        elif upload_type == 'cover':
            media_url = f"http://localhost:8000/media/profile_covers/{filename}"
        elif upload_type == 'story':
            media_url = f"http://localhost:8000/media/stories/{filename}"
        elif upload_type == 'post':
            media_url = f"http://localhost:8000/media/posts/{filename}"
        elif upload_type == 'group_avatar':
            media_url = f"http://localhost:8000/media/group_avatars/{filename}"
        elif upload_type == 'group_banner':
            media_url = f"http://localhost:8000/media/group_banners/{filename}"
        else:
            media_url = f"http://localhost:8000/media/general/{filename}"
        
        return Response({'url': media_url}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error in upload_media: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== User Relationship Views ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_followers(request, user_id):
    """Get followers of a user"""
    try:
        user = User.objects.get(id=user_id)
        followers = Friendship.objects.filter(
            receiver=user,
            status='accepted'
        ).select_related('requester')
        
        followers_data = []
        for friendship in followers:
            followers_data.append({
                'id': friendship.requester.id,
                'username': friendship.requester.username,
                'display_name': friendship.requester.display_name,
                'avatar_url': friendship.requester.avatar_url,
                'followed_at': friendship.created_at
            })
        
        return Response({
            'followers': followers_data,
            'count': len(followers_data)
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_following(request, user_id):
    """Get users that a user is following"""
    try:
        user = User.objects.get(id=user_id)
        following = Friendship.objects.filter(
            requester=user,
            status='accepted'
        ).select_related('receiver')
        
        following_data = []
        for friendship in following:
            following_data.append({
                'id': friendship.receiver.id,
                'username': friendship.receiver.username,
                'display_name': friendship.receiver.display_name,
                'avatar_url': friendship.receiver.avatar_url,
                'followed_at': friendship.created_at
            })
        
        return Response({
            'following': following_data,
            'count': len(following_data)
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    """Follow a user"""
    try:
        requester = request.user
        receiver = User.objects.get(id=user_id)
        
        if requester.id == receiver.id:
            return Response({
                'error': 'Cannot follow yourself'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if friendship already exists
        friendship, created = Friendship.objects.get_or_create(
            requester=requester,
            receiver=receiver,
            defaults={'status': 'pending'}
        )
        
        if not created and friendship.status == 'accepted':
            return Response({
                'error': 'Already following this user'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Auto-accept for now (can be changed to require approval)
        friendship.status = 'accepted'
        friendship.save()
        
        # Notify about follow via WebSocket
        try:
            FeedService.notify_user_followed(requester, receiver)
        except Exception as e:
            logger.error(f"Failed to notify user follow: {e}")
        
        return Response({
            'message': 'Successfully followed user',
            'friendship_id': friendship.id
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfollow_user(request, user_id):
    """Unfollow a user"""
    try:
        requester = request.user
        receiver = User.objects.get(id=user_id)
        
        friendship = Friendship.objects.filter(
            requester=requester,
            receiver=receiver,
            status='accepted'
        ).first()
        
        if not friendship:
            return Response({
                'error': 'Not following this user'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        friendship.delete()
        
        return Response({
            'message': 'Successfully unfollowed user'
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== Reels Views ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reels(request):
    """Get all reels for the current user"""
    try:
        user = request.user
        
        # Get reels from users the current user follows
        following_users = Friendship.objects.filter(
            requester=user,
            status='accepted'
        ).values_list('receiver_id', flat=True)
        
        # Also include reels from the current user
        following_users = list(following_users) + [user.id]
        
        reels = Post.objects.filter(
            author_id__in=following_users,
            media_type='video'
        ).select_related('author').order_by('-created_at')
        
        reels_data = []
        for reel in reels:
            reels_data.append({
                'id': reel.id,
                'content': reel.content,
                'media_url': reel.media_url,
                'media_type': reel.media_type,
                'likes_count': reel.likes_count,
                'comments_count': reel.comments_count,
                'shares_count': reel.shares_count,
                'created_at': reel.created_at,
                'author': {
                    'id': reel.author.id,
                    'username': reel.author.username,
                    'display_name': reel.author.display_name,
                    'avatar_url': reel.author.avatar_url,
                }
            })
        
        return Response({
            'reels': reels_data,
            'total': len(reels_data)
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reel(request):
    """Create a new reel"""
    try:
        user = request.user
        content = request.data.get('content', '')
        media_url = request.data.get('media_url')
        media_type = request.data.get('media_type', 'video')
        
        if not media_url:
            return Response({
                'error': 'Media URL is required for reels'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reel = Post.objects.create(
            author=user,
            content=content,
            media_url=media_url,
            media_type=media_type
        )
        
        return Response({
            'message': 'Reel created successfully',
            'reel_id': reel.id
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reel(request, reel_id):
    """Get a specific reel"""
    try:
        reel = Post.objects.filter(
            id=reel_id,
            media_type='video'
        ).select_related('author').first()
        
        if not reel:
            return Response({
                'error': 'Reel not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        reel_data = {
            'id': reel.id,
            'content': reel.content,
            'media_url': reel.media_url,
            'media_type': reel.media_type,
            'likes_count': reel.likes_count,
            'comments_count': reel.comments_count,
            'shares_count': reel.shares_count,
            'created_at': reel.created_at,
            'author': {
                'id': reel.author.id,
                'username': reel.author.username,
                'display_name': reel.author.display_name,
                'avatar_url': reel.author.avatar_url,
            }
        }
        
        return Response(reel_data)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_reel(request, reel_id):
    """Like a reel"""
    try:
        user = request.user
        reel = Post.objects.filter(
            id=reel_id,
            media_type='video'
        ).first()
        
        if not reel:
            return Response({
                'error': 'Reel not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already liked
        existing_like = Like.objects.filter(
            user=user,
            post=reel
        ).first()
        
        if existing_like:
            return Response({
                'error': 'Already liked this reel'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create like
        Like.objects.create(user=user, post=reel)
        
        # Update like count
        reel.likes_count = Like.objects.filter(post=reel).count()
        reel.save()
        
        return Response({
            'message': 'Reel liked successfully'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_reel(request, reel_id):
    """Comment on a reel"""
    try:
        user = request.user
        content = request.data.get('content', '')
        
        if not content:
            return Response({
                'error': 'Comment content is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reel = Post.objects.filter(
            id=reel_id,
            media_type='video'
        ).first()
        
        if not reel:
            return Response({
                'error': 'Reel not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create comment
        comment = Comment.objects.create(
            post=reel,
            author=user,
            content=content
        )
        
        # Update comment count
        reel.comments_count = Comment.objects.filter(post=reel).count()
        reel.save()
        
        return Response({
            'message': 'Comment added successfully',
            'comment_id': comment.id
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== Messaging Views ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """Get all conversations for the current user"""
    try:
        user = request.user
        
        # Get conversations where user is a participant
        conversations = Conversation.objects.filter(
            participants__user=user
        ).select_related('created_by').prefetch_related(
            'participants__user',
            'messages'
        ).annotate(
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time', '-updated_at')
        
        conversations_data = []
        for conversation in conversations:
            # Get the other participant for direct messages
            other_participant = None
            if conversation.conversation_type == 'direct':
                other_participant = conversation.participants.filter(user__ne=user).first()
            
            # Get last message
            last_message = conversation.messages.last()
            
            # Get unread count
            unread_count = conversation.messages.filter(
                sender__ne=user,
                is_read=False
            ).count()
            
            conversation_data = {
                'id': conversation.id,
                'conversation_type': conversation.conversation_type,
                'name': conversation.name,
                'created_at': conversation.created_at,
                'updated_at': conversation.updated_at,
                'unread_count': unread_count,
                'last_message': {
                    'content': last_message.content if last_message else None,
                    'message_type': last_message.message_type if last_message else None,
                    'created_at': last_message.created_at if last_message else None,
                    'sender_username': last_message.sender.username if last_message else None,
                } if last_message else None,
            }
            
            # Add participant info for direct messages
            if conversation.conversation_type == 'direct' and other_participant:
                conversation_data.update({
                    'participant_id': other_participant.user.id,
                    'participant_username': other_participant.user.username,
                    'participant_display_name': other_participant.user.display_name,
                    'participant_avatar_url': other_participant.user.avatar_url,
                })
            
            conversations_data.append(conversation_data)
        
        return Response({
            'conversations': conversations_data,
            'total': len(conversations_data)
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_conversation(request):
    """Create a new conversation"""
    try:
        user = request.user
        conversation_type = request.data.get('conversation_type', 'direct')
        participant_ids = request.data.get('participant_ids', [])
        name = request.data.get('name', None)
        
        if conversation_type == 'direct' and len(participant_ids) != 1:
            return Response({
                'error': 'Direct conversations must have exactly one participant'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if direct conversation already exists
        if conversation_type == 'direct':
            existing_conversation = Conversation.objects.filter(
                conversation_type='direct',
                participants__user=user
            ).filter(
                participants__user__id=participant_ids[0]
            ).first()
            
            if existing_conversation:
                return Response({
                    'conversation_id': existing_conversation.id,
                    'message': 'Conversation already exists'
                })
        
        # Create conversation
        conversation = Conversation.objects.create(
            conversation_type=conversation_type,
            name=name,
            created_by=user
        )
        
        # Add participants
        participants = [user.id] + participant_ids
        for participant_id in participants:
            ConversationParticipant.objects.create(
                conversation=conversation,
                user_id=participant_id,
                role='admin' if participant_id == user.id else 'member'
            )
        
        return Response({
            'conversation_id': conversation.id,
            'message': 'Conversation created successfully'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, conversation_id):
    """Get messages for a conversation with decryption support"""
    try:
        user = request.user
        
        # Check if user is participant in conversation
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants__user=user
        ).first()
        
        if not conversation:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get query parameters
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))
        decrypt = request.GET.get('decrypt', 'true').lower() == 'true'
        
        # Get messages using MessagingService
        messages_data = MessagingService.get_messages_for_user(
            conversation_id=conversation_id,
            user_id=user.id,
            limit=limit,
            offset=offset,
            decrypt=decrypt
        )
        
        return Response({
            'messages': messages_data,
            'conversation_id': conversation_id,
            'total_count': conversation.messages.count(),
            'decrypted': decrypt
        })
        
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, conversation_id):
    """Send a message to a conversation with encryption support"""
    try:
        user = request.user
        
        # Check if user is participant in conversation
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants__user=user
        ).first()
        
        if not conversation:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        content = request.data.get('content', '').strip()
        message_type = request.data.get('message_type', 'text')
        media_url = request.data.get('media_url', None)
        voice_duration = request.data.get('voice_duration', None)
        voice_waveform = request.data.get('voice_waveform', None)
        encrypt = request.data.get('encrypt', True)  # Default to encryption
        
        if not content and not media_url and message_type != 'voice':
            return Response({
                'error': 'Message content, media, or voice is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create message using MessagingService
        message = MessagingService.create_message(
            conversation_id=conversation_id,
            sender_id=user.id,
            content=content,
            message_type=message_type,
            media_url=media_url,
            voice_duration=voice_duration,
            voice_waveform=voice_waveform,
            encrypt=encrypt
        )
        
        if not message:
            return Response({
                'error': 'Failed to create message'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Notify participants about new message
        MessagingService.notify_new_message(message)
        
        return Response({
            'message_id': message.id,
            'message': 'Message sent successfully',
            'encrypted': encrypt
        })
        
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_conversation_read(request, conversation_id):
    """Mark all messages in conversation as read"""
    try:
        user = request.user
        
        # Check if user is participant in conversation
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants__user=user
        ).first()
        
        if not conversation:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Mark all unread messages as read
        updated_count = conversation.messages.filter(
            sender__id__ne=user.id,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'updated_count': updated_count,
            'message': 'Messages marked as read'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, conversation_id):
    """Mark messages as read"""
    try:
        user = request.user
        
        # Check if user is participant in conversation
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants__user=user
        ).first()
        
        if not conversation:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        message_ids = request.data.get('message_ids', [])
        
        # Mark messages as read using MessagingService
        success = MessagingService.mark_messages_read(
            conversation_id=conversation_id,
            user_id=user.id,
            message_ids=message_ids if message_ids else None
        )
        
        if success:
            # Notify message senders about read receipts
            if message_ids:
                MessagingService.notify_read_receipt(
                    conversation_id=conversation_id,
                    user_id=user.id,
                    message_ids=message_ids
                )
            
            return Response({
                'message': 'Messages marked as read successfully'
            })
        else:
            return Response({
                'error': 'Failed to mark messages as read'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        logger.error(f"Error marking messages as read: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_typing_indicator(request, conversation_id):
    """Send typing indicator"""
    try:
        user = request.user
        
        # Check if user is participant in conversation
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants__user=user
        ).first()
        
        if not conversation:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        is_typing = request.data.get('is_typing', False)
        
        # Notify participants about typing indicator
        MessagingService.notify_typing_indicator(
            conversation_id=conversation_id,
            user_id=user.id,
            is_typing=is_typing
        )
        
        return Response({
            'message': 'Typing indicator sent successfully'
        })
        
    except Exception as e:
        logger.error(f"Error sending typing indicator: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_message_reaction(request, message_id):
    """Add reaction to a message"""
    try:
        user = request.user
        reaction_type = request.data.get('reaction_type')
        
        if not reaction_type:
            return Response({
                'error': 'Reaction type is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add reaction using MessagingService
        success = MessagingService.add_message_reaction(
            message_id=message_id,
            user_id=user.id,
            reaction_type=reaction_type
        )
        
        if success:
            return Response({
                'message': 'Reaction added successfully'
            })
        else:
            return Response({
                'error': 'Failed to add reaction'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        logger.error(f"Error adding message reaction: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_message_reaction(request, message_id):
    """Remove reaction from a message"""
    try:
        user = request.user
        reaction_type = request.data.get('reaction_type')
        
        if not reaction_type:
            return Response({
                'error': 'Reaction type is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Remove reaction using MessagingService
        success = MessagingService.remove_message_reaction(
            message_id=message_id,
            user_id=user.id,
            reaction_type=reaction_type
        )
        
        if success:
            return Response({
                'message': 'Reaction removed successfully'
            })
        else:
            return Response({
                'error': 'Failed to remove reaction'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        logger.error(f"Error removing message reaction: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class VoiceMessageView(View):
    """Handle voice message recording and upload"""
    
    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user is participant
            if not conversation.participants.filter(user=request.user).exists():
                return JsonResponse({'error': 'Not a participant'}, status=403)
            
            # Get audio data from request
            audio_data = request.FILES.get('audio')
            duration = request.POST.get('duration')
            waveform = request.POST.get('waveform')
            
            if not audio_data:
                return JsonResponse({'error': 'No audio data provided'}, status=400)
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                message_type='voice',
                voice_file=audio_data,
                voice_duration=int(duration) if duration else None,
                voice_waveform=json.loads(waveform) if waveform else None
            )
            
            # Mark as read for sender
            MessageRead.objects.get_or_create(
                message=message,
                user=request.user,
                defaults={'read_at': timezone.now()}
            )
            
            # Send WebSocket notification
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"conversation_{conversation_id}",
                {
                    "type": "chat.message",
                    "message": {
                        "id": message.id,
                        "sender_id": message.sender.id,
                        "sender_name": message.sender.username,
                        "message_type": message.message_type,
                        "voice_file": message.voice_file.url if message.voice_file else None,
                        "voice_duration": message.voice_duration,
                        "voice_waveform": message.voice_waveform,
                        "created_at": message.created_at.isoformat(),
                    }
                }
            )
            
            return JsonResponse({
                'id': message.id,
                'voice_file': message.voice_file.url,
                'voice_duration': message.voice_duration,
                'voice_waveform': message.voice_waveform,
            })
            
        except Conversation.DoesNotExist:
            return JsonResponse({'error': 'Conversation not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class VoiceMessagePlayView(View):
    """Handle voice message playback"""
    
    def get(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id, message_type='voice')
            
            # Check if user has access to conversation
            if not message.conversation.participants.filter(user=request.user).exists():
                return JsonResponse({'error': 'Access denied'}, status=403)
            
            return JsonResponse({
                'id': message.id,
                'voice_file': message.voice_file.url,
                'voice_duration': message.voice_duration,
                'voice_waveform': message.voice_waveform,
                'sender_name': message.sender.username,
                'created_at': message.created_at.isoformat(),
            })
            
        except Message.DoesNotExist:
            return JsonResponse({'error': 'Message not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

class HashtagViewSet(ModelViewSet):
    """ViewSet for managing hashtags"""
    serializer_class = HashtagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['-posts_count', '-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.can_access_alpha():
            return Hashtag.objects.all()
        else:
            return Hashtag.objects.none()
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending hashtags (most used in last 7 days)"""
        # Get hashtags used in posts from last 7 days
        week_ago = timezone.now() - timedelta(days=7)
        trending_hashtags = Hashtag.objects.filter(
            posts__created_at__gte=week_ago
        ).annotate(
            recent_posts_count=Count('posts', filter=Q(posts__created_at__gte=week_ago))
        ).filter(recent_posts_count__gt=0).order_by('-recent_posts_count', '-posts_count')[:10]
        
        serializer = self.get_serializer(trending_hashtags, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Get all posts for a specific hashtag"""
        hashtag = self.get_object()
        posts = hashtag.posts.all().select_related('author').prefetch_related('likes', 'comments')
        
        # Apply pagination
        paginator = LargePagePagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        
        serializer = PostSerializer(paginated_posts, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

# ========== Token Management APIs ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_token_balance(request):
    """Get user's token balance and wallet info"""
    try:
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        return Response({
            'balance': str(wallet.balance),
            'address': wallet.address,
            'created_at': wallet.created_at,
            'updated_at': wallet.updated_at
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stake_tokens(request):
    """Stake tokens for rewards"""
    try:
        amount = Decimal(request.data.get('amount', 0))
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        if wallet.balance < amount:
            return Response({'error': 'Insufficient balance'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create staking record
        staking = Staking.objects.create(
            user=request.user,
            amount=amount,
            staking_period=365,  # 1 year
            apy_rate=Decimal('5.00'),  # 5% APY
            end_date=timezone.now() + timedelta(days=365)
        )
        
        # Deduct from wallet
        wallet.balance -= amount
        wallet.save()
        
        return Response({
            'message': 'Tokens staked successfully',
            'staking_id': staking.id,
            'amount': str(amount),
            'apy_rate': str(staking.apy_rate),
            'end_date': staking.end_date
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unstake_tokens(request):
    """Unstake tokens and claim rewards"""
    try:
        staking_id = request.data.get('staking_id')
        staking = Staking.objects.get(id=staking_id, user=request.user, status='active')
        
        # Calculate rewards
        time_staked = timezone.now() - staking.start_date
        daily_rate = staking.apy_rate / Decimal('365.00') / Decimal('100.00')
        rewards = (staking.amount * daily_rate * time_staked.days) / Decimal('365.00')
        
        # Update staking record
        staking.status = 'completed'
        staking.rewards_earned = rewards
        staking.save()
        
        # Add tokens back to wallet
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        wallet.balance += staking.amount + rewards
        wallet.save()
        
        return Response({
            'message': 'Tokens unstaked successfully',
            'original_amount': str(staking.amount),
            'rewards_earned': str(rewards),
            'total_returned': str(staking.amount + rewards)
        })
        
    except Staking.DoesNotExist:
        return Response({'error': 'Staking record not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_staking_info(request):
    """Get user's staking information"""
    try:
        active_stakings = Staking.objects.filter(user=request.user, status='active')
        completed_stakings = Staking.objects.filter(user=request.user, status='completed')
        
        total_staked = sum(staking.amount for staking in active_stakings)
        total_rewards = sum(staking.rewards_earned for staking in completed_stakings)
        
        return Response({
            'active_stakings': StakingSerializer(active_stakings, many=True).data,
            'completed_stakings': StakingSerializer(completed_stakings, many=True).data,
            'total_staked': str(total_staked),
            'total_rewards_earned': str(total_rewards)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_token_stream(request):
    """Create a token streaming session"""
    try:
        receiver_username = request.data.get('receiver')
        total_amount = Decimal(request.data.get('total_amount', 0))
        duration_hours = int(request.data.get('duration_hours', 1))
        
        if total_amount <= 0 or duration_hours <= 0:
            return Response({'error': 'Invalid amount or duration'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        receiver = User.objects.get(username=receiver_username)
        sender_wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        if sender_wallet.balance < total_amount:
            return Response({'error': 'Insufficient balance'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate streaming rate
        duration_seconds = duration_hours * 3600
        amount_per_second = total_amount / Decimal(str(duration_seconds))
        
        # Create streaming session
        stream = TokenStreaming.objects.create(
            sender=request.user,
            receiver=receiver,
            total_amount=total_amount,
            amount_per_second=amount_per_second,
            end_time=timezone.now() + timedelta(hours=duration_hours)
        )
        
        # Deduct from sender's wallet
        sender_wallet.balance -= total_amount
        sender_wallet.save()
        
        return Response({
            'message': 'Token stream created successfully',
            'stream_id': stream.id,
            'total_amount': str(total_amount),
            'duration_hours': duration_hours,
            'amount_per_second': str(amount_per_second)
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_token_streams(request):
    """Get user's token streams"""
    try:
        sent_streams = TokenStreaming.objects.filter(sender=request.user)
        received_streams = TokenStreaming.objects.filter(receiver=request.user)
        
        return Response({
            'sent_streams': TokenStreamingSerializer(sent_streams, many=True).data,
            'received_streams': TokenStreamingSerializer(received_streams, many=True).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== NFT Management APIs ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mint_nft(request):
    """Mint a new NFT"""
    try:
        name = request.data.get('name')
        description = request.data.get('description', '')
        media_url = request.data.get('media_url')
        nft_type = request.data.get('nft_type', 'image')
        rarity = request.data.get('rarity', 'common')
        
        if not name or not media_url:
            return Response({'error': 'Name and media_url are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique token ID
        token_id = str(uuid.uuid4())
        
        # Create NFT
        nft = NFT.objects.create(
            token_id=token_id,
            name=name,
            description=description,
            owner=request.user,
            creator=request.user,
            nft_type=nft_type,
            media_url=media_url,
            rarity=rarity,
            metadata={
                'created_at': timezone.now().isoformat(),
                'creator_address': request.user.wallet_address or '',
                'attributes': request.data.get('attributes', {})
            }
        )
        
        return Response({
            'message': 'NFT minted successfully',
            'nft': NFTSerializer(nft).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stake_nft(request, nft_id):
    """Stake an NFT for rewards"""
    try:
        nft = NFT.objects.get(token_id=nft_id, owner=request.user)
        
        if nft.is_locked:
            return Response({'error': 'NFT is locked'}, status=status.HTTP_400_BAD_REQUEST)
        
        nft.is_locked = True
        nft.save()
        
        return Response({
            'message': 'NFT staked successfully',
            'nft_id': nft_id
        })
        
    except NFT.DoesNotExist:
        return Response({'error': 'NFT not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unstake_nft(request, nft_id):
    """Unstake an NFT and claim rewards"""
    try:
        nft = NFT.objects.get(token_id=nft_id, owner=request.user)
        
        if not nft.is_locked:
            return Response({'error': 'NFT is not staked'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate rewards based on rarity and staking duration
        rarity_multipliers = {
            'common': 1,
            'uncommon': 2,
            'rare': 5,
            'epic': 10,
            'legendary': 25,
            'mythic': 50
        }
        
        multiplier = rarity_multipliers.get(nft.rarity, 1)
        rewards = Decimal('10.0') * multiplier  # Base 10 tokens per day
        
        # Add rewards to user's wallet
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        wallet.balance += rewards
        wallet.save()
        
        nft.is_locked = False
        nft.save()
        
        return Response({
            'message': 'NFT unstaked successfully',
            'rewards_earned': str(rewards),
            'nft_id': nft_id
        })
        
    except NFT.DoesNotExist:
        return Response({'error': 'NFT not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== Smart Contract Integration APIs ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deploy_smart_contract(request):
    """Deploy a smart contract"""
    try:
        contract_type = request.data.get('contract_type')
        name = request.data.get('name')
        symbol = request.data.get('symbol', '')
        total_supply = request.data.get('total_supply', 0)
        
        if not contract_type or not name:
            return Response({'error': 'Contract type and name are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create smart contract record
        contract = SmartContract.objects.create(
            name=name,
            contract_type=contract_type,
            address='0x' + str(uuid.uuid4()).replace('-', '')[:40],  # Mock address
            network='ethereum',
            creator=request.user,
            abi={},  # Mock ABI
            bytecode='',  # Mock bytecode
            transaction_hash='0x' + str(uuid.uuid4()).replace('-', '')[:64]  # Mock hash
        )
        
        return Response({
            'message': 'Smart contract deployed successfully',
            'contract': {
                'id': contract.id,
                'name': contract.name,
                'address': contract.address,
                'network': contract.network,
                'transaction_hash': contract.transaction_hash
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_smart_contracts(request):
    """Get user's deployed smart contracts"""
    try:
        contracts = SmartContract.objects.filter(creator=request.user)
        return Response({
            'contracts': [{
                'id': contract.id,
                'name': contract.name,
                'contract_type': contract.contract_type,
                'address': contract.address,
                'network': contract.network,
                'deployed_at': contract.deployed_at
            } for contract in contracts]
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_stats(request, conversation_id):
    """Get conversation statistics"""
    try:
        user = request.user
        
        # Get conversation stats using MessagingService
        stats = MessagingService.get_conversation_stats(
            conversation_id=conversation_id,
            user_id=user.id
        )
        
        if not stats:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(stats)
        
    except Exception as e:
        logger.error(f"Error getting conversation stats: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_voice_message(request, conversation_id):
    """Upload and create a voice message"""
    try:
        user = request.user
        
        # Check if user is participant in conversation
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants__user=user
        ).first()
        
        if not conversation:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        voice_file = request.FILES.get('voice_file')
        duration = request.data.get('duration')
        waveform = request.data.get('waveform')
        
        if not voice_file:
            return Response({
                'error': 'Voice file is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        if not voice_file.name.endswith(('.mp3', '.wav', '.m4a', '.ogg')):
            return Response({
                'error': 'Invalid voice file format. Supported: mp3, wav, m4a, ogg'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save voice file
        file_path = f'voice_messages/{conversation_id}/{user.id}_{timezone.now().strftime("%Y%m%d_%H%M%S")}_{voice_file.name}'
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(f'media/{file_path}'), exist_ok=True)
        
        with open(f'media/{file_path}', 'wb+') as destination:
            for chunk in voice_file.chunks():
                destination.write(chunk)
        
        # Create voice message using MessagingService
        message = MessagingService.create_voice_message(
            conversation_id=conversation_id,
            sender_id=user.id,
            voice_file_path=file_path,
            duration=duration,
            waveform=waveform
        )
        
        if not message:
            return Response({
                'error': 'Failed to create voice message'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Notify participants about new voice message
        MessagingService.notify_new_message(message)
        
        return Response({
            'message_id': message.id,
            'message': 'Voice message sent successfully',
            'voice_file': file_path,
            'duration': duration
        })
        
    except Exception as e:
        logger.error(f"Error uploading voice message: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voice_message_upload(request, conversation_id):
    """
    Upload and create a voice message (Best Practice unified endpoint)
    - Accepts: multipart/form-data (voice_file, duration, waveform)
    - Validates file type and user permissions
    - Stores file, creates message, notifies participants via WebSocket
    - Returns: message metadata
    """
    try:
        user = request.user
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants__user=user
        ).first()
        if not conversation:
            return Response({'error': 'Conversation not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        voice_file = request.FILES.get('voice_file')
        duration = request.data.get('duration')
        waveform = request.data.get('waveform')

        if not voice_file:
            return Response({'error': 'Voice file is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not voice_file.name.endswith(('.mp3', '.wav', '.m4a', '.ogg')):
            return Response({'error': 'Invalid voice file format. Supported: mp3, wav, m4a, ogg'}, status=status.HTTP_400_BAD_REQUEST)

        # Save file
        file_path = f'voice_messages/{conversation_id}/{user.id}_{timezone.now().strftime("%Y%m%d_%H%M%S")}_{voice_file.name}'
        os.makedirs(os.path.dirname(f'media/{file_path}'), exist_ok=True)
        with open(f'media/{file_path}', 'wb+') as destination:
            for chunk in voice_file.chunks():
                destination.write(chunk)

        # Create message
        message = MessagingService.create_voice_message(
            conversation_id=conversation_id,
            sender_id=user.id,
            voice_file_path=file_path,
            duration=duration,
            waveform=waveform
        )
        if not message:
            return Response({'error': 'Failed to create voice message'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        MessagingService.notify_new_message(message)
        return Response({
            'message_id': message.id,
            'message': 'Voice message sent successfully',
            'voice_file': file_path,
            'duration': duration
        })
    except Exception as e:
        logger.error(f"Error uploading voice message: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def voice_message_stream(request, message_id):
    """
    Stream/download a voice message file (Best Practice)
    - Checks user access
    - Streams file as response
    """
    try:
        message = Message.objects.get(id=message_id, message_type='voice')
        if not message.conversation.participants.filter(user=request.user).exists():
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        file_path = f'media/{message.voice_file}' if not str(message.voice_file).startswith('media/') else str(message.voice_file)
        if not os.path.exists(file_path):
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        from django.http import FileResponse
        response = FileResponse(open(file_path, 'rb'), content_type='audio/mpeg')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response
    except Message.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error streaming voice message: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def group_message_file_upload(request, group_id):
    """
    Upload a file to a group chat (File Sharing)
    - Only Admins/Moderators may upload
    """
    try:
        user = request.user
        group = Group.objects.filter(id=group_id, memberships__user=user).first()
        if not group:
            return Response({'error': 'Group not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
        # Nur Admins/Moderatoren dürfen hochladen
        if not GroupMembership.objects.filter(group=group, user=user, role__in=['admin', 'moderator']).exists():
            return Response({'error': 'Nur Admins/Moderatoren dürfen Dateien hochladen.'}, status=status.HTTP_403_FORBIDDEN)
        file = request.FILES.get('file')
        message_text = request.data.get('message', '')
        if not file:
            return Response({'error': 'File is required'}, status=status.HTTP_400_BAD_REQUEST)
        file_path = f'message_files/group_{group_id}/{user.id}_{timezone.now().strftime("%Y%m%d_%H%M%S")}_{file.name}'
        os.makedirs(os.path.dirname(f'media/{file_path}'), exist_ok=True)
        with open(f'media/{file_path}', 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        message = Message.objects.create(
            group=group,
            sender=user,
            content=message_text,
            message_type='file',
            file=file_path,
            file_name=file.name,
            file_size=file.size
        )
        # WebSocket-Benachrichtigung (optional)
        return Response({
            'message_id': message.id,
            'file': file_path,
            'file_name': file.name,
            'file_size': file.size
        })
    except Exception as e:
        logger.error(f"Error uploading group file: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def group_message_file_delete(request, message_id):
    """
    Delete a file from a group chat (nur Admins/Moderatoren)
    """
    try:
        user = request.user
        message = Message.objects.get(id=message_id, message_type='file')
        group = message.group
        if not group or not GroupMembership.objects.filter(group=group, user=user, role__in=['admin', 'moderator']).exists():
            return Response({'error': 'Nur Admins/Moderatoren dürfen Dateien löschen.'}, status=status.HTTP_403_FORBIDDEN)
        # Datei löschen
        file_path = f'media/{message.file}' if not str(message.file).startswith('media/') else str(message.file)
        if os.path.exists(file_path):
            os.remove(file_path)
        message.delete()
        return Response({'success': True})
    except Message.DoesNotExist:
        return Response({'error': 'Datei nicht gefunden'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error deleting group file: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_message_file_download(request, message_id):
    """
    Download a file from a group chat message
    - Checks user membership and permissions
    - Streams file as response
    """
    try:
        message = Message.objects.get(id=message_id, message_type='file')
        if not message.group or not message.group.memberships.filter(user=request.user).exists():
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        file_path = f'media/{message.file}' if not str(message.file).startswith('media/') else str(message.file)
        if not os.path.exists(file_path):
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        from django.http import FileResponse
        response = FileResponse(open(file_path, 'rb'), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response
    except Message.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error downloading group file: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def group_promote_member(request, group_id, user_id):
    """
    Promote a group member to admin
    """
    try:
        group = Group.objects.get(id=group_id)
        if not group.memberships.filter(user=request.user, role='admin').exists():
            return Response({'error': 'Only admins can promote'}, status=status.HTTP_403_FORBIDDEN)
        membership = GroupMembership.objects.get(group=group, user_id=user_id)
        membership.role = 'admin'
        membership.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def group_demote_member(request, group_id, user_id):
    """
    Demote a group admin to member
    """
    try:
        group = Group.objects.get(id=group_id)
        if not group.memberships.filter(user=request.user, role='admin').exists():
            return Response({'error': 'Only admins can demote'}, status=status.HTTP_403_FORBIDDEN)
        membership = GroupMembership.objects.get(group=group, user_id=user_id)
        if membership.role != 'admin':
            return Response({'error': 'User is not an admin'}, status=status.HTTP_400_BAD_REQUEST)
        membership.role = 'member'
        membership.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def group_kick_member(request, group_id, user_id):
    """
    Remove a member from the group (Kick)
    """
    try:
        group = Group.objects.get(id=group_id)
        if not group.memberships.filter(user=request.user, role='admin').exists():
            return Response({'error': 'Only admins can kick'}, status=status.HTTP_403_FORBIDDEN)
        membership = GroupMembership.objects.get(group=group, user_id=user_id)
        membership.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_message_search(request, group_id):
    """
    Search/filter group messages by content, file name, sender, date
    - Query params: q, sender, date_from, date_to
    """
    try:
        user = request.user
        group = Group.objects.filter(id=group_id, memberships__user=user).first()
        if not group:
            return Response({'error': 'Group not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
        q = request.GET.get('q', '')
        sender = request.GET.get('sender')
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        messages = Message.objects.filter(group=group)
        if q:
            messages = messages.filter(content__icontains=q) | messages.filter(file_name__icontains=q)
        if sender:
            messages = messages.filter(sender__id=sender)
        if date_from:
            messages = messages.filter(created_at__gte=date_from)
        if date_to:
            messages = messages.filter(created_at__lte=date_to)
        data = [
            {
                'id': m.id,
                'content': m.content,
                'file_name': m.file_name,
                'sender': m.sender.username,
                'created_at': m.created_at
            } for m in messages.order_by('-created_at')[:100]
        ]
        return Response({'results': data})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_story(request, story_id):
    """
    Report a story for moderation (e.g. inappropriate content)
    """
    try:
        story = get_object_or_404(Story, id=story_id)
        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({'error': 'Report reason required.'}, status=status.HTTP_400_BAD_REQUEST)
        # Append reason if already reported
        if story.is_reported and story.report_reason:
            story.report_reason += f"\n---\n{reason}"
        else:
            story.report_reason = reason
        story.report_count += 1
        # Optional: Blende Story nach 3 Reports automatisch aus
        if story.report_count >= 3:
            story.is_reported = True
        story.save()
        return Response({'message': 'Story reported successfully.', 'report_count': story.report_count, 'is_reported': story.is_reported})
    except Story.DoesNotExist:
        return Response({'error': 'Story not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Content Moderation Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_content(request):
    """
    Report any content (post, comment, user, story)
    """
    try:
        content_type = request.data.get('content_type')
        content_id = request.data.get('content_id')
        report_type = request.data.get('report_type')
        reason = request.data.get('reason', '').strip()
        evidence = request.data.get('evidence', {})
        
        if not all([content_type, content_id, report_type, reason]):
            return Response({
                'error': 'Missing required fields: content_type, content_id, report_type, reason'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate content type
        valid_types = ['post', 'comment', 'user', 'story']
        if content_type not in valid_types:
            return Response({
                'error': f'Invalid content_type. Must be one of: {valid_types}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate report type
        valid_report_types = [choice[0] for choice in ContentReport.REPORT_TYPES]
        if report_type not in valid_report_types:
            return Response({
                'error': f'Invalid report_type. Must be one of: {valid_report_types}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if content exists
        content_model = None
        if content_type == 'post':
            content_model = Post
        elif content_type == 'comment':
            content_model = Comment
        elif content_type == 'user':
            content_model = User
        elif content_type == 'story':
            content_model = Story
        
        if not content_model:
            return Response({'error': 'Invalid content type'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            content = content_model.objects.get(id=content_id)
        except content_model.DoesNotExist:
            return Response({'error': f'{content_type.title()} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Prevent self-reporting
        if content_type == 'user' and content.id == request.user.id:
            return Response({'error': 'Cannot report yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create report
        report = ContentReport.objects.create(
            reporter=request.user,
            content_type=content_type,
            content_id=content_id,
            report_type=report_type,
            reason=reason,
            evidence=evidence
        )
        
        # Update content report count
        if hasattr(content, 'report_count'):
            content.report_count += 1
            content.is_reported = True
            content.save()
        
        # Log audit
        ModerationAuditLog.objects.create(
            moderator=None,  # System action
            action='report_created',
            content_type=content_type,
            content_id=content_id,
            target_user=content.author if hasattr(content, 'author') else content,
            details={
                'report_type': report_type,
                'reason': reason,
                'reporter_id': request.user.id
            },
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Auto-moderation check
        from .services.moderation_service import ModerationService
        ModerationService.check_auto_moderation(content, content_type)
        
        return Response({
            'message': 'Report submitted successfully',
            'report_id': report.id,
            'status': report.status
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating report: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_moderation_dashboard(request):
    """
    Get moderation dashboard data for moderators
    """
    try:
        # Check if user is a moderator
        if not hasattr(request.user, 'moderator_role') or not request.user.moderator_role.is_active:
            return Response({'error': 'Access denied. Moderator role required.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get pending reports
        pending_reports = ContentReport.objects.filter(status='pending').count()
        under_review_reports = ContentReport.objects.filter(status='under_review').count()
        
        # Get recent reports
        recent_reports = ContentReport.objects.select_related('reporter', 'assigned_moderator').order_by('-created_at')[:10]
        
        # Get moderation statistics
        today = timezone.now().date()
        reports_today = ContentReport.objects.filter(created_at__date=today).count()
        resolved_today = ContentReport.objects.filter(resolved_at__date=today).count()
        
        # Get content statistics
        reported_posts = Post.objects.filter(is_reported=True).count()
        reported_comments = Comment.objects.filter(is_reported=True).count()
        suspended_users = User.objects.filter(is_suspended=True).count()
        
        dashboard_data = {
            'pending_reports': pending_reports,
            'under_review_reports': under_review_reports,
            'recent_reports': ContentReportSerializer(recent_reports, many=True).data,
            'statistics': {
                'reports_today': reports_today,
                'resolved_today': resolved_today,
                'reported_posts': reported_posts,
                'reported_comments': reported_comments,
                'suspended_users': suspended_users,
            }
        }
        
        return Response(dashboard_data)
        
    except Exception as e:
        logger.error(f"Error getting moderation dashboard: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_report(request, report_id):
    """
    Assign a report to a moderator
    """
    try:
        # Check if user is a moderator
        if not hasattr(request.user, 'moderator_role') or not request.user.moderator_role.is_active:
            return Response({'error': 'Access denied. Moderator role required.'}, status=status.HTTP_403_FORBIDDEN)
        
        report = get_object_or_404(ContentReport, id=report_id)
        
        if report.status != 'pending':
            return Response({'error': 'Report is not pending'}, status=status.HTTP_400_BAD_REQUEST)
        
        report.assigned_moderator = request.user
        report.status = 'under_review'
        report.save()
        
        # Log audit
        ModerationAuditLog.objects.create(
            moderator=request.user,
            action='report_assigned',
            content_type=report.content_type,
            content_id=report.content_id,
            target_user=report.reporter,
            details={'report_id': report.id},
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'message': 'Report assigned successfully',
            'assigned_to': request.user.username
        })
        
    except Exception as e:
        logger.error(f"Error assigning report: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_report(request, report_id):
    """
    Resolve a report with action
    """
    try:
        # Check if user is a moderator
        if not hasattr(request.user, 'moderator_role') or not request.user.moderator_role.is_active:
            return Response({'error': 'Access denied. Moderator role required.'}, status=status.HTTP_403_FORBIDDEN)
        
        report = get_object_or_404(ContentReport, id=report_id)
        action = request.data.get('action')
        notes = request.data.get('notes', '')
        
        if not action:
            return Response({'error': 'Action required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Apply moderation action
        from .services.moderation_service import ModerationService
        result = ModerationService.apply_action(
            content_type=report.content_type,
            content_id=report.content_id,
            action=action,
            moderator=request.user,
            notes=notes
        )
        
        if not result['success']:
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update report
        report.status = 'resolved'
        report.resolution_action = action
        report.moderator_notes = notes
        report.resolved_at = timezone.now()
        report.save()
        
        # Log audit
        ModerationAuditLog.objects.create(
            moderator=request.user,
            action='report_resolved',
            content_type=report.content_type,
            content_id=report.content_id,
            target_user=report.reporter,
            details={
                'action': action,
                'notes': notes,
                'report_id': report.id
            },
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'message': 'Report resolved successfully',
            'action_applied': action
        })
        
    except Exception as e:
        logger.error(f"Error resolving report: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hide_content(request):
    """
    Hide content (post, comment) - requires moderator role
    """
    try:
        # Check if user is a moderator
        if not hasattr(request.user, 'moderator_role') or not request.user.moderator_role.is_active:
            return Response({'error': 'Access denied. Moderator role required.'}, status=status.HTTP_403_FORBIDDEN)
        
        content_type = request.data.get('content_type')
        content_id = request.data.get('content_id')
        reason = request.data.get('reason', '').strip()
        
        if not all([content_type, content_id, reason]):
            return Response({
                'error': 'Missing required fields: content_type, content_id, reason'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get content
        content_model = Post if content_type == 'post' else Comment
        content = get_object_or_404(content_model, id=content_id)
        
        # Hide content
        content.is_hidden = True
        content.hidden_by = request.user
        content.hidden_at = timezone.now()
        content.hidden_reason = reason
        content.save()
        
        # Log audit
        ModerationAuditLog.objects.create(
            moderator=request.user,
            action='content_hidden',
            content_type=content_type,
            content_id=content_id,
            target_user=content.author,
            details={'reason': reason},
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'message': f'{content_type.title()} hidden successfully',
            'hidden_at': content.hidden_at.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error hiding content: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suspend_user(request, user_id):
    """
    Suspend a user - requires senior moderator role
    """
    try:
        # Check if user is a senior moderator or higher
        if not hasattr(request.user, 'moderator_role') or request.user.moderator_role.role not in ['senior_moderator', 'admin_moderator', 'super_admin']:
            return Response({'error': 'Access denied. Senior moderator role required.'}, status=status.HTTP_403_FORBIDDEN)
        
        target_user = get_object_or_404(User, id=user_id)
        duration_hours = request.data.get('duration_hours', 24)
        reason = request.data.get('reason', '').strip()
        
        if not reason:
            return Response({'error': 'Suspension reason required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Suspend user
        target_user.is_suspended = True
        target_user.suspended_until = timezone.now() + timezone.timedelta(hours=duration_hours)
        target_user.suspended_by = request.user
        target_user.suspension_reason = reason
        target_user.save()
        
        # Log audit
        ModerationAuditLog.objects.create(
            moderator=request.user,
            action='user_suspended',
            content_type='user',
            content_id=user_id,
            target_user=target_user,
            details={
                'duration_hours': duration_hours,
                'reason': reason,
                'suspended_until': target_user.suspended_until.isoformat()
            },
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'message': f'User {target_user.username} suspended successfully',
            'suspended_until': target_user.suspended_until.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error suspending user: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Advanced Search Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def advanced_user_search(request):
    """
    Advanced user search with filters and recommendations
    """
    try:
        query = request.GET.get('q', '').strip()
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        
        # Parse filters
        filters = SearchFilters(
            category=request.GET.get('category'),
            min_followers=int(request.GET.get('min_followers')) if request.GET.get('min_followers') else None,
            max_followers=int(request.GET.get('max_followers')) if request.GET.get('max_followers') else None,
            is_verified=request.GET.get('is_verified') == 'true' if request.GET.get('is_verified') else None,
            is_alpha_user=request.GET.get('is_alpha_user') == 'true' if request.GET.get('is_alpha_user') else None,
            sort_by=request.GET.get('sort_by', 'relevance'),
            sort_order=request.GET.get('sort_order', 'desc')
        )
        
        # Import SearchService
        from .services.search_service import SearchService
        
        # Perform search
        search_results = SearchService.search_users(query, filters, page, limit)
        
        return Response(search_results)
        
    except Exception as e:
        logger.error(f"Error in advanced_user_search: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_recommendations(request):
    """
    Get personalized user recommendations
    """
    try:
        limit = int(request.GET.get('limit', 10))
        
        from .services.search_service import SearchService
        
        recommendations = SearchService.get_user_recommendations(request.user.id, limit)
        
        return Response({
            'recommendations': recommendations,
            'count': len(recommendations)
        })
        
    except Exception as e:
        logger.error(f"Error in get_user_recommendations: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trending_users(request):
    """
    Get trending users
    """
    try:
        limit = int(request.GET.get('limit', 10))
        
        from .services.search_service import SearchService
        
        trending_users = SearchService.get_trending_users(limit)
        
        return Response({
            'trending_users': trending_users,
            'count': len(trending_users)
        })
        
    except Exception as e:
        logger.error(f"Error in get_trending_users: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_similar_users(request, user_id):
    """
    Get users similar to the specified user
    """
    try:
        limit = int(request.GET.get('limit', 10))
        
        from .services.search_service import SearchService
        
        similar_users = SearchService.get_similar_users(user_id, limit)
        
        return Response({
            'similar_users': similar_users,
            'count': len(similar_users)
        })
        
    except Exception as e:
        logger.error(f"Error in get_similar_users: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_search_suggestions(request):
    """
    Get search suggestions for autocomplete
    """
    try:
        query = request.GET.get('q', '').strip()
        limit = int(request.GET.get('limit', 5))
        
        if len(query) < 2:
            return Response({'suggestions': []})
        
        from .services.search_service import SearchService
        
        suggestions = SearchService.get_search_suggestions(query, limit)
        
        return Response({
            'suggestions': suggestions,
            'query': query
        })
        
    except Exception as e:
        logger.error(f"Error in get_search_suggestions: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_popular_searches(request):
    """
    Get popular search terms
    """
    try:
        limit = int(request.GET.get('limit', 10))
        
        from .services.search_service import SearchService
        
        popular_searches = SearchService.get_popular_searches(limit)
        
        return Response({
            'popular_searches': popular_searches,
            'count': len(popular_searches)
        })
        
    except Exception as e:
        logger.error(f"Error in get_popular_searches: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_discovery_feed(request):
    """
    Get discovery feed with recommendations and trending users
    """
    try:
        limit = int(request.GET.get('limit', 20))
        
        from .services.search_service import SearchService
        
        # Get recommendations and trending users
        recommendations = SearchService.get_user_recommendations(request.user.id, limit // 2)
        trending_users = SearchService.get_trending_users(limit // 2)
        
        # Combine and shuffle results
        import random
        discovery_feed = recommendations + trending_users
        random.shuffle(discovery_feed)
        
        return Response({
            'discovery_feed': discovery_feed[:limit],
            'recommendations_count': len(recommendations),
            'trending_count': len(trending_users),
            'total_count': len(discovery_feed[:limit])
        })
        
    except Exception as e:
        logger.error(f"Error in get_discovery_feed: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_search_analytics(request):
    """
    Get search analytics and insights
    """
    try:
        from django.core.cache import cache
        
        # Get popular searches
        from .services.search_service import SearchService
        popular_searches = SearchService.get_popular_searches(10)
        
        # Get recent search trends (mock data for now)
        recent_trends = [
            {'term': 'crypto', 'growth': 15},
            {'term': 'blockchain', 'growth': 12},
            {'term': 'influencer', 'growth': 8},
            {'term': 'developer', 'growth': 6},
            {'term': 'trader', 'growth': 4}
        ]
        
        analytics = {
            'popular_searches': popular_searches,
            'recent_trends': recent_trends,
            'total_searches_today': 1250,
            'unique_searchers': 890,
            'average_results_per_search': 8.5
        }
        
        return Response(analytics)
        
    except Exception as e:
        logger.error(f"Error in get_search_analytics: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== Advanced Messaging Views ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group_conversation(request):
    """Create a new group conversation"""
    try:
        user = request.user
        
        name = request.data.get('name', '').strip()
        participant_ids = request.data.get('participant_ids', [])
        description = request.data.get('description', '').strip()
        is_private = request.data.get('is_private', False)
        
        if not name:
            return Response({
                'error': 'Group name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not participant_ids:
            return Response({
                'error': 'At least one participant is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create group conversation
        conversation = MessagingService.create_group_conversation(
            name=name,
            creator_id=user.id,
            participant_ids=participant_ids,
            description=description,
            is_private=is_private
        )
        
        if not conversation:
            return Response({
                'error': 'Failed to create group conversation'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Group conversation created successfully',
            'conversation_id': conversation.id,
            'name': conversation.name
        })
        
    except Exception as e:
        logger.error(f"Error creating group conversation: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_group_participant(request, conversation_id):
    """Add participant to group conversation"""
    try:
        user = request.user
        participant_id = request.data.get('participant_id')
        
        if not participant_id:
            return Response({
                'error': 'Participant ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        success = MessagingService.add_group_participant(
            conversation_id=conversation_id,
            user_id=participant_id,
            added_by_id=user.id
        )
        
        if success:
            # Notify group about new participant
            MessagingService.notify_group_event(
                conversation_id=conversation_id,
                event_type='participant_added',
                data={'participant_id': participant_id, 'added_by': user.id},
                exclude_user_id=user.id
            )
            
            return Response({
                'message': 'Participant added successfully'
            })
        else:
            return Response({
                'error': 'Failed to add participant'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error adding group participant: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_group_participant(request, conversation_id, participant_id):
    """Remove participant from group conversation"""
    try:
        user = request.user
        
        success = MessagingService.remove_group_participant(
            conversation_id=conversation_id,
            user_id=participant_id,
            removed_by_id=user.id
        )
        
        if success:
            # Notify group about removed participant
            MessagingService.notify_group_event(
                conversation_id=conversation_id,
                event_type='participant_removed',
                data={'participant_id': participant_id, 'removed_by': user.id},
                exclude_user_id=user.id
            )
            
            return Response({
                'message': 'Participant removed successfully'
            })
        else:
            return Response({
                'error': 'Failed to remove participant'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error removing group participant: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def promote_group_participant(request, conversation_id, participant_id):
    """Promote participant in group conversation"""
    try:
        user = request.user
        new_role = request.data.get('new_role', 'moderator')
        
        if new_role not in ['moderator', 'admin']:
            return Response({
                'error': 'Invalid role. Must be moderator or admin'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        success = MessagingService.promote_group_participant(
            conversation_id=conversation_id,
            user_id=participant_id,
            promoted_by_id=user.id,
            new_role=new_role
        )
        
        if success:
            # Notify group about promotion
            MessagingService.notify_group_event(
                conversation_id=conversation_id,
                event_type='participant_promoted',
                data={'participant_id': participant_id, 'new_role': new_role, 'promoted_by': user.id},
                exclude_user_id=user.id
            )
            
            return Response({
                'message': f'Participant promoted to {new_role} successfully'
            })
        else:
            return Response({
                'error': 'Failed to promote participant'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error promoting group participant: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_group_info(request, conversation_id):
    """Get detailed group information"""
    try:
        user = request.user
        
        group_info = MessagingService.get_group_info(
            conversation_id=conversation_id,
            user_id=user.id
        )
        
        if not group_info:
            return Response({
                'error': 'Group not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(group_info)
        
    except Exception as e:
        logger.error(f"Error getting group info: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_messages(request, conversation_id):
    """Search messages in a conversation"""
    try:
        user = request.user
        query = request.GET.get('q', '').strip()
        
        if not query:
            return Response({
                'error': 'Search query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        limit = int(request.GET.get('limit', 20))
        offset = int(request.GET.get('offset', 0))
        
        messages = MessagingService.search_messages(
            conversation_id=conversation_id,
            user_id=user.id,
            query=query,
            limit=limit,
            offset=offset
        )
        
        return Response({
            'messages': messages,
            'query': query,
            'total_results': len(messages),
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        logger.error(f"Error searching messages: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_message_analytics(request, conversation_id):
    """Get message analytics for a conversation"""
    try:
        user = request.user
        days = int(request.GET.get('days', 30))
        
        analytics = MessagingService.get_message_analytics(
            conversation_id=conversation_id,
            user_id=user.id,
            days=days
        )
        
        if not analytics:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(analytics)
        
    except Exception as e:
        logger.error(f"Error getting message analytics: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_analytics(request, conversation_id):
    """Get detailed conversation statistics"""
    try:
        user = request.user
        
        stats = MessagingService.get_conversation_stats(
            conversation_id=conversation_id,
            user_id=user.id
        )
        
        if not stats:
            return Response({
                'error': 'Conversation not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(stats)
        
    except Exception as e:
        logger.error(f"Error getting conversation stats: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile_by_id(request, user_id):
    """Get user profile by user ID"""
    try:
        user = User.objects.get(id=user_id)
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_photos(request, user_id):
    """Gibt alle Bild-Posts eines Users paginiert zurück"""
    logger.info(f"[get_user_photos] user_id={user_id}, auth={request.user.is_authenticated}, request_user={request.user.id}")
    try:
        user = User.objects.get(id=user_id)
        photos = Post.objects.filter(author=user, media_type='image').order_by('-created_at')
        paginator = PageNumberPagination()
        paginator.page_size = 20
        result_page = paginator.paginate_queryset(photos, request)
        serializer = PostSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    except User.DoesNotExist:
        logger.warning(f"[get_user_photos] User {user_id} not found!")
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_activity(request, user_id):
    logger.info(f"[get_user_activity] user_id={user_id}, auth={request.user.is_authenticated}, request_user={request.user.id}")
    try:
        user = User.objects.get(id=user_id)
        posts = Post.objects.filter(author=user)
        comments = Comment.objects.filter(author=user)
        likes = Like.objects.filter(user=user)
        # Temporarily disable mining activity until MiningActivity model is properly defined
        mining = []  # MiningActivity.objects.filter(user=user)
        achievements = UserAchievement.objects.filter(user=user)
        timeline = []
        for post in posts:
            timeline.append({'type': 'post','created_at': post.created_at,'data': PostSerializer(post, context={'request': request}).data})
        for comment in comments:
            timeline.append({'type': 'comment','created_at': comment.created_at,'data': CommentSerializer(comment, context={'request': request}).data})
        for like in likes:
            timeline.append({'type': 'like','created_at': like.created_at,'data': LikeSerializer(like, context={'request': request}).data})
        # Temporarily disable mining and achievement serialization until models are properly defined
        # for mining_activity in mining:
        #     timeline.append({'type': 'mining','created_at': mining_activity.created_at,'data': MiningActivitySerializer(mining_activity, context={'request': request}).data})
        # for achievement in achievements:
        #     timeline.append({'type': 'achievement','created_at': achievement.created_at,'data': AchievementSerializer(achievement, context={'request': request}).data})
        timeline.sort(key=lambda x: x['created_at'], reverse=True)
        paginator = PageNumberPagination()
        paginator.page_size = 20
        result_page = paginator.paginate_queryset(timeline, request)
        return paginator.get_paginated_response(result_page)
    except User.DoesNotExist:
        logger.warning(f"[get_user_activity] User {user_id} not found!")
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_analytics(request, user_id):
    logger.info(f"[get_user_analytics] user_id={user_id}, auth={request.user.is_authenticated}, request_user={request.user.id}")
    try:
        user = User.objects.get(id=user_id)
        # Temporarily disable FollowRelationship queries until database is properly migrated
        analytics = {
            'follower_count': 0,  # Temporarily disabled
            'following_count': 0,  # Temporarily disabled
            'post_count': Post.objects.filter(author=user).count(),
            'like_count': Like.objects.filter(user=user).count(),
            'mining_count': 0,  # Temporarily disabled until MiningActivity is properly defined
            'achievement_count': 0,  # Temporarily disabled
        }
        return Response(analytics)
    except User.DoesNotExist:
        logger.warning(f"[get_user_analytics] User {user_id} not found!")
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_privacy(request, user_id):
    logger.info(f"[get_user_privacy] user_id={user_id}, auth={request.user.is_authenticated}, request_user={request.user.id}")
    try:
        user = User.objects.get(id=user_id)
        # Temporarily use default privacy settings until UserPrivacy model is properly defined
        data = {
            'show_email': False,
            'show_friends': True,
            'show_photos': True,
            'show_activity': True,
            'show_analytics': True,
            'show_social_links': True,
        }
        return Response(data)
    except User.DoesNotExist:
        logger.warning(f"[get_user_privacy] User {user_id} not found!")
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_social_links(request, user_id):
    logger.info(f"[get_user_social_links] user_id={user_id}, auth={request.user.is_authenticated}, request_user={request.user.id}")
    try:
        user = User.objects.get(id=user_id)
        social_links = user.social_media_links if hasattr(user, 'social_media_links') else {}
        return Response({'social_media_links': social_links})
    except User.DoesNotExist:
        logger.warning(f"[get_user_social_links] User {user_id} not found!")
        return Response({'error': 'User not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_photo(request, user_id):
    """Upload eines neuen Profilfotos"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Prüfe Berechtigung
        if request.user.id != user_id:
            return Response({'error': 'Keine Berechtigung'}, status=403)
        
        if 'photo' not in request.FILES:
            return Response({'error': 'Kein Foto gefunden'}, status=400)
        
        photo = request.FILES['photo']
        
        # Validiere Dateityp
        if not photo.content_type.startswith('image/'):
            return Response({'error': 'Nur Bilder erlaubt'}, status=400)
        
        # Validiere Dateigröße (max 5MB)
        if photo.size > 5 * 1024 * 1024:
            return Response({'error': 'Datei zu groß (max 5MB)'}, status=400)
        
        # Speichere Foto
        filename = f"profile_photos/{user_id}_{int(time.time())}_{photo.name}"
        default_storage.save(filename, photo)
        
        # Erstelle Post-Eintrag für das Foto
        post = Post.objects.create(
            author=user,
            content=f"Neues Profilfoto hinzugefügt",
            post_type='photo',
            media_url=f"/media/{filename}"
        )
        
        return Response({
            'success': True,
            'photo_url': f"/media/{filename}",
            'post_id': post.id
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_privacy_settings(request, user_id):
    """Privacy-Einstellungen aktualisieren"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Prüfe Berechtigung
        if request.user.id != user_id:
            return Response({'error': 'Keine Berechtigung'}, status=403)
        
        data = request.data
        
        # Aktualisiere Privacy-Einstellungen
        privacy_settings = {
            'profile_visibility': data.get('profile_visibility', 'public'),
            'show_email': data.get('show_email', False),
            'show_phone': data.get('show_phone', False),
            'allow_friend_requests': data.get('allow_friend_requests', True),
            'show_online_status': data.get('show_online_status', True),
            'allow_messages': data.get('allow_messages', True),
            'show_activity': data.get('show_activity', True),
            'show_photos': data.get('show_photos', True),
            'show_friends': data.get('show_friends', True),
            'show_analytics': data.get('show_analytics', False)
        }
        
        # Speichere in User-Modell oder separater Tabelle
        user.profile_complete = True
        user.save()
        
        return Response({
            'success': True,
            'privacy_settings': privacy_settings
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_social_links(request, user_id):
    """Social-Media-Links aktualisieren"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Prüfe Berechtigung
        if request.user.id != user_id:
            return Response({'error': 'Keine Berechtigung'}, status=403)
        
        data = request.data
        
        # Validiere und aktualisiere Social-Links
        social_links = {}
        valid_platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'github']
        
        for platform in valid_platforms:
            if platform in data:
                url = data[platform].strip()
                if url and is_valid_url(url):
                    social_links[platform] = url
        
        # Speichere in User-Modell
        user.social_media_links = social_links
        user.save()
        
        return Response({
            'success': True,
            'social_links': social_links
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_profile_photo(request, user_id, photo_id):
    """Profilfoto löschen"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Prüfe Berechtigung
        if request.user.id != user_id:
            return Response({'error': 'Keine Berechtigung'}, status=403)
        
        # Finde und lösche Post mit Foto
        post = get_object_or_404(Post, id=photo_id, author=user, post_type='photo')
        
        # Lösche Datei
        if post.media_url:
            file_path = post.media_url.replace('/media/', '')
            if default_storage.exists(file_path):
                default_storage.delete(file_path)
        
        post.delete()
        
        return Response({'success': True})
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_achievements(request, user_id):
    """Benutzer-Achievements abrufen"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Simuliere Achievements basierend auf Benutzer-Aktivität
        achievements = []
        
        # Post-Achievements
        post_count = Post.objects.filter(author=user).count()
        if post_count >= 10:
            achievements.append({
                'id': 'first_10_posts',
                'title': 'Erste 10 Posts',
                'description': 'Du hast 10 Posts erstellt',
                'icon': '📝',
                'unlocked_at': user.created_at
            })
        
        if post_count >= 50:
            achievements.append({
                'id': 'prolific_poster',
                'title': 'Prolific Poster',
                'description': 'Du hast 50 Posts erstellt',
                'icon': '📊',
                'unlocked_at': user.created_at
            })
        
        # Follower-Achievements
        if user.follower_count >= 100:
            achievements.append({
                'id': 'popular_user',
                'title': 'Beliebter Nutzer',
                'description': 'Du hast 100 Follower',
                'icon': '⭐',
                'unlocked_at': user.created_at
            })
        
        # Mining-Achievements (temporarily disabled until mining_stats is properly implemented)
        # mining_stats = user.mining_stats
        # if mining_stats.get('total_mined', 0) >= 1000:
        # Temporarily disable mining achievements
        if False:  # Placeholder for mining achievements
            achievements.append({
                'id': 'mining_master',
                'title': 'Mining Master',
                'description': 'Du hast 1000 Token gemined',
                'icon': '⛏️',
                'unlocked_at': user.created_at
            })
        
        return Response({
            'achievements': achievements,
            'total_achievements': len(achievements),
            'total_possible': 10
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_stats(request, user_id):
    """Erweiterte Benutzer-Statistiken"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Berechne Statistiken
        posts = Post.objects.filter(author=user)
        comments = Comment.objects.filter(author=user)
        
        # Engagement-Rate
        total_likes = sum(post.likes.count() for post in posts)
        total_comments = comments.count()
        engagement_rate = (total_likes + total_comments) / max(posts.count(), 1)
        
        # Aktivitäts-Trends
        now = timezone.now()
        last_week = now - timedelta(days=7)
        last_month = now - timedelta(days=30)
        
        posts_last_week = posts.filter(created_at__gte=last_week).count()
        posts_last_month = posts.filter(created_at__gte=last_month).count()
        
        # Popularität-Score
        popularity_score = (
            user.follower_count * 0.4 +
            total_likes * 0.3 +
            total_comments * 0.2 +
            posts.count() * 0.1
        )
        
        stats = {
            'total_posts': posts.count(),
            'total_likes_received': total_likes,
            'total_comments_received': total_comments,
            'engagement_rate': round(engagement_rate, 2),
            'posts_last_week': posts_last_week,
            'posts_last_month': posts_last_month,
            'popularity_score': round(popularity_score, 2),
            'follower_count': user.follower_count,
            'following_count': user.following.count(),
            'account_age_days': (now - user.created_at).days,
            'profile_completion': 85 if user.profile_complete else 45
        }
        
        return Response(stats)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_user(request, user_id):
    """Benutzer melden"""
    try:
        reported_user = get_object_or_404(User, id=user_id)
        reporter = request.user
        
        if reporter.id == user_id:
            return Response({'error': 'Du kannst dich nicht selbst melden'}, status=400)
        
        data = request.data
        reason = data.get('reason', '')
        description = data.get('description', '')
        
        if not reason:
            return Response({'error': 'Grund erforderlich'}, status=400)
        
        # Erstelle Report (in echter Implementierung würde man ein Report-Modell verwenden)
        report_data = {
            'reporter_id': reporter.id,
            'reported_user_id': user_id,
            'reason': reason,
            'description': description,
            'timestamp': timezone.now()
        }
        
        return Response({
            'success': True,
            'message': 'Report erfolgreich eingereicht'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_recommendations(request, user_id):
    """Benutzer-Empfehlungen basierend auf Interessen"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Finde ähnliche Benutzer basierend auf Posts und Interessen
        user_posts = Post.objects.filter(author=user)
        user_interests = set()
        
        for post in user_posts:
            if post.content:
                # Einfache Interessen-Extraktion aus Post-Inhalten
                words = post.content.lower().split()
                user_interests.update(words)
        
        # Finde Benutzer mit ähnlichen Interessen
        recommendations = []
        all_users = User.objects.exclude(id=user_id)[:20]
        
        for other_user in all_users:
            other_posts = Post.objects.filter(author=other_user)
            other_interests = set()
            
            for post in other_posts:
                if post.content:
                    words = post.content.lower().split()
                    other_interests.update(words)
            
            # Berechne Ähnlichkeit
            common_interests = len(user_interests.intersection(other_interests))
            if common_interests > 0:
                recommendations.append({
                    'user_id': other_user.id,
                    'username': other_user.username,
                    'display_name': other_user.display_name,
                    'avatar_url': other_user.avatar_url,
                    'follower_count': other_user.follower_count,
                    'common_interests': common_interests,
                    'similarity_score': min(common_interests / max(len(user_interests), 1), 1.0)
                })
        
        # Sortiere nach Ähnlichkeit
        recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return Response({
            'recommendations': recommendations[:10],
            'total_found': len(recommendations)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def is_valid_url(url):
    """Validiert URL-Format"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mining_achievements(request):
    """
    Mining Achievements Endpoint (Dummy):
    Gibt eine leere Liste zurück, solange Mining-Achievements nicht aktiviert sind.
    Später kann hier echte Logik ergänzt werden.
    """
    return Response({
        "results": [],
        "count": 0
    })

class PhotoAlbumViewSet(viewsets.ModelViewSet):
    serializer_class = PhotoAlbumSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Nur eigene Alben anzeigen
        return PhotoAlbum.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

class PhotoViewSet(viewsets.ModelViewSet):
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        # Nur Fotos aus eigenen Alben anzeigen
        return Photo.objects.filter(user=self.request.user, album__user=self.request.user, is_deleted=False)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        # Soft-Delete
        instance.is_deleted = True
        instance.save()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def react_to_story(request, story_id):
    """Add a reaction (emoji/text) to a story"""
    story = Story.objects.filter(id=story_id).first()
    if not story:
        return Response({'error': 'Story not found'}, status=404)
    reaction_type = request.data.get('reaction_type', 'emoji')
    value = request.data.get('value')
    if not value:
        return Response({'error': 'No reaction value provided'}, status=400)
    reaction, created = StoryReaction.objects.get_or_create(
        story=story, user=request.user, reaction_type=reaction_type, value=value
    )
    serializer = StoryReactionSerializer(reaction)
    return Response(serializer.data, status=201 if created else 200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_to_story(request, story_id):
    """Add a reply (text/media) to a story"""
    story = Story.objects.filter(id=story_id).first()
    if not story:
        return Response({'error': 'Story not found'}, status=404)
    message = request.data.get('message')
    media_url = request.data.get('media_url')
    if not message and not media_url:
        return Response({'error': 'No reply content provided'}, status=400)
    reply = StoryReply.objects.create(
        story=story, user=request.user, message=message or '', media_url=media_url
    )
    serializer = StoryReplySerializer(reply)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_in_poll(request, story_id):
    """Vote in a story poll"""
    story = Story.objects.filter(id=story_id).first()
    if not story or not story.poll:
        return Response({'error': 'Poll not found for this story'}, status=404)
    option = request.data.get('option')
    if not option or option not in story.poll.options:
        return Response({'error': 'Invalid poll option'}, status=400)
    poll = story.poll
    votes = poll.votes or {}
    user_id = str(request.user.id)
    # Remove previous vote
    for opt, voters in votes.items():
        if user_id in voters:
            voters.remove(user_id)
    # Add new vote
    votes.setdefault(option, []).append(user_id)
    poll.votes = votes
    poll.save()
    serializer = StoryPollSerializer(poll)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_poll(request, story_id):
    story = Story.objects.filter(id=story_id).first()
    if not story or not story.poll:
        return Response({'error': 'Poll not found for this story'}, status=404)
    serializer = StoryPollSerializer(story.poll)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_music_to_story(request, story_id):
    story = Story.objects.filter(id=story_id).first()
    if not story:
        return Response({'error': 'Story not found'}, status=404)
    title = request.data.get('title')
    url = request.data.get('url')
    if not title or not url:
        return Response({'error': 'Title and URL required'}, status=400)
    music = StoryMusic.objects.create(
        story=story, title=title, artist=request.data.get('artist'), url=url, start_time=request.data.get('start_time', 0)
    )
    story.music = music
    story.save()
    serializer = StoryMusicSerializer(music)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_sticker_to_story(request, story_id):
    story = Story.objects.filter(id=story_id).first()
    if not story:
        return Response({'error': 'Story not found'}, status=404)
    sticker_url = request.data.get('sticker_url')
    if not sticker_url:
        return Response({'error': 'Sticker URL required'}, status=400)
    sticker = StorySticker.objects.create(
        story=story, sticker_url=sticker_url,
        x=request.data.get('x', 0.5), y=request.data.get('y', 0.5),
        scale=request.data.get('scale', 1.0), rotation=request.data.get('rotation', 0.0)
    )
    story.stickers.add(sticker)
    story.save()
    serializer = StoryStickerSerializer(sticker)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_highlight(request):
    title = request.data.get('title')
    story_ids = request.data.get('stories', [])
    if not title or not story_ids:
        return Response({'error': 'Title and stories required'}, status=400)
    highlight = StoryHighlight.objects.create(user=request.user, title=title)
    highlight.stories.set(Story.objects.filter(id__in=story_ids))
    highlight.save()
    serializer = StoryHighlightSerializer(highlight)
    return Response(serializer.data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_highlights(request):
    highlights = StoryHighlight.objects.filter(user=request.user)
    serializer = StoryHighlightSerializer(highlights, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_viewers(request, story_id):
    story = Story.objects.filter(id=story_id).first()
    if not story:
        return Response({'error': 'Story not found'}, status=404)
    serializer = StoryViewSerializer(story.views.all(), many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reactions(request, story_id):
    story = Story.objects.filter(id=story_id).first()
    if not story:
        return Response({'error': 'Story not found'}, status=404)
    serializer = StoryReactionSerializer(story.reactions.all(), many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_replies(request, story_id):
    story = Story.objects.filter(id=story_id).first()
    if not story:
        return Response({'error': 'Story not found'}, status=404)
    serializer = StoryReplySerializer(story.replies.all(), many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stickers(request, story_id):
    story = Story.objects.filter(id=story_id).first()
    if not story:
        return Response({'error': 'Story not found'}, status=404)
    serializer = StoryStickerSerializer(story.stickers.all(), many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_analytics(request, group_id):
    """
    Returns analytics data for a group
    """
    try:
        group = Group.objects.get(id=group_id)
        
        # Check if user is member or admin
        membership = GroupMembership.objects.filter(group=group, user=request.user).first()
        if not membership or membership.role not in ['admin', 'moderator']:
            return Response({'error': 'Access denied. Admin or moderator required.'}, status=403)
        
        # Calculate analytics
        total_members = GroupMembership.objects.filter(group=group).count()
        total_posts = Post.objects.filter(group=group).count()
        total_comments = Comment.objects.filter(post__group=group).count()
        
        # Recent activity (last 7 days)
        from datetime import datetime, timedelta
        week_ago = datetime.now() - timedelta(days=7)
        recent_posts = Post.objects.filter(group=group, created_at__gte=week_ago).count()
        recent_comments = Comment.objects.filter(post__group=group, created_at__gte=week_ago).count()
        recent_members = GroupMembership.objects.filter(group=group, joined_at__gte=week_ago).count()
        
        analytics = {
            'group_id': group.id,
            'group_name': group.name,
            'total_members': total_members,
            'total_posts': total_posts,
            'total_comments': total_comments,
            'recent_activity': {
                'posts_last_7_days': recent_posts,
                'comments_last_7_days': recent_comments,
                'new_members_last_7_days': recent_members,
            },
            'engagement_rate': (total_comments / max(total_posts, 1)) * 100,
            'growth_rate': (recent_members / max(total_members, 1)) * 100,
        }
        
        return Response(analytics)
        
    except Group.DoesNotExist:
        return Response({'error': 'Group not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_reports(request, group_id):
    """
    Returns reports data for a group
    """
    try:
        group = Group.objects.get(id=group_id)
        
        # Check if user is member or admin
        membership = GroupMembership.objects.filter(group=group, user=request.user).first()
        if not membership or membership.role not in ['admin', 'moderator']:
            return Response({'error': 'Access denied. Admin or moderator required.'}, status=403)
        
        # Get recent reports (last 30 days)
        from datetime import datetime, timedelta
        month_ago = datetime.now() - timedelta(days=30)
        
        # Mock reports data (in real app, you'd have a Report model)
        reports = [
            {
                'id': 1,
                'type': 'inappropriate_content',
                'status': 'pending',
                'reported_by': 'user123',
                'reported_at': (datetime.now() - timedelta(days=2)).isoformat(),
                'description': 'Post contains inappropriate content',
                'post_id': 456,
            },
            {
                'id': 2,
                'type': 'spam',
                'status': 'resolved',
                'reported_by': 'user456',
                'reported_at': (datetime.now() - timedelta(days=5)).isoformat(),
                'description': 'User posting spam messages',
                'user_id': 789,
            },
            {
                'id': 3,
                'type': 'harassment',
                'status': 'investigating',
                'reported_by': 'user789',
                'reported_at': (datetime.now() - timedelta(days=1)).isoformat(),
                'description': 'User harassing other members',
                'user_id': 123,
            }
        ]
        
        # Filter reports by date
        recent_reports = [r for r in reports if datetime.fromisoformat(r['reported_at']) >= month_ago]
        
        report_stats = {
            'total_reports': len(recent_reports),
            'pending_reports': len([r for r in recent_reports if r['status'] == 'pending']),
            'resolved_reports': len([r for r in recent_reports if r['status'] == 'resolved']),
            'investigating_reports': len([r for r in recent_reports if r['status'] == 'investigating']),
        }
        
        return Response({
            'group_id': group.id,
            'group_name': group.name,
            'report_stats': report_stats,
            'recent_reports': recent_reports,
        })
        
    except Group.DoesNotExist:
        return Response({'error': 'Group not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_music(request, story_id):
    story = Story.objects.filter(id=story_id).first()
    if not story or not story.music:
        return Response({'error': 'Music not found for this story'}, status=404)
    serializer = StoryMusicSerializer(story.music)
    return Response(serializer.data)

# --- SPOTIFY SEARCH PROXY ---
@api_view(['GET'])
@permission_classes([AllowAny])  # Optional: Authentifizierung kann später aktiviert werden
def spotify_search(request):
    query = request.GET.get('q')
    if not query:
        return Response({'error': 'Missing query parameter q'}, status=400)

    # Spotify Credentials aus Settings
    client_id = getattr(settings, 'SPOTIFY_CLIENT_ID', None)
    client_secret = getattr(settings, 'SPOTIFY_CLIENT_SECRET', None)
    if not client_id or not client_secret:
        return Response({'error': 'Spotify credentials not configured'}, status=500)

    # 1. Access Token holen
    token_url = 'https://accounts.spotify.com/api/token'
    auth_response = requests.post(token_url, {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
    })
    if auth_response.status_code != 200:
        return Response({'error': 'Spotify token error', 'details': auth_response.text}, status=500)
    access_token = auth_response.json().get('access_token')
    if not access_token:
        return Response({'error': 'Spotify token missing'}, status=500)

    # 2. Suche an Spotify API
    search_url = 'https://api.spotify.com/v1/search'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'q': query, 'type': 'track', 'limit': 10}
    r = requests.get(search_url, headers=headers, params=params)
    if r.status_code != 200:
        return Response({'error': 'Spotify search error', 'details': r.text}, status=500)
    data = r.json()
    # 3. Songdaten extrahieren
    results = []
    for item in data.get('tracks', {}).get('items', []):
        results.append({
            'id': item['id'],
            'title': item['name'],
            'artist': ', '.join([a['name'] for a in item['artists']]),
            'cover_url': item['album']['images'][0]['url'] if item['album']['images'] else None,
            'preview_url': item.get('preview_url'),
            'spotify_url': item['external_urls']['spotify'],
        })
    return Response({'results': results})

class GroupEventViewSet(ModelViewSet):
    serializer_class = GroupEventSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location']
    ordering = ['-start_time']

    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        queryset = GroupEvent.objects.all().select_related('group', 'created_by')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginator = PageNumberPagination()
        paginator.page_size = 20
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_group_media(request, group_id):
    """
    Returns all image/video posts for a group (paginated)
    """
    posts = Post.objects.filter(group_id=group_id, media_type__in=['image', 'video']).order_by('-created_at')
    paginator = PageNumberPagination()
    paginator.page_size = 20
    result_page = paginator.paginate_queryset(posts, request)
    serializer = PostSerializer(result_page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_group_files(request, group_id):
    """
    Returns all files (documents, PDFs, etc.) shared in a group (paginated)
    """
    files = Message.objects.filter(group_id=group_id, message_type='file').order_by('-created_at')
    paginator = PageNumberPagination()
    paginator.page_size = 20
    result_page = paginator.paginate_queryset(files, request)
    data = [
        {
            'id': f.id,
            'file_name': f.file_name,
            'file_size': f.file_size,
            'sender': {
                'id': f.sender.id,
                'username': f.sender.username,
                'avatar_url': getattr(f.sender, 'avatar_url', None),
            },
            'created_at': f.created_at,
            'download_url': request.build_absolute_uri(f'/api/groups/messages/{f.id}/file-download/')
        }
        for f in result_page
    ]
    return paginator.get_paginated_response(data)



class GroupEventRSVPViewSet(viewsets.ModelViewSet):
    serializer_class = GroupEventRSVPSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-responded_at']

    def get_queryset(self):
        event_id = self.request.query_params.get('event')
        status_filter = self.request.query_params.get('status')
        qs = GroupEventRSVP.objects.all().select_related('user', 'event')
        if event_id:
            qs = qs.filter(event_id=event_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        # Set RSVP for this user/event (update if exists)
        event = serializer.validated_data['event']
        status_val = serializer.validated_data['status']
        obj, created = GroupEventRSVP.objects.update_or_create(
            event=event, user=self.request.user,
            defaults={'status': status_val}
        )
        serializer.instance = obj

    def create(self, request, *args, **kwargs):
        # Custom create to allow idempotent RSVP (update or create)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(self.get_serializer(serializer.instance).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_rsvp(self, request):
        event_id = request.query_params.get('event')
        if not event_id:
            return Response({'error': 'event parameter required'}, status=400)
        try:
            rsvp = GroupEventRSVP.objects.get(event_id=event_id, user=request.user)
            return Response(self.get_serializer(rsvp).data)
        except GroupEventRSVP.DoesNotExist:
            return Response({'status': None})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_group_ai_summary(request, group_id):
    """
    Generiert eine AI-Zusammenfassung und Empfehlungen für die Gruppe (nur Admins)
    """
    try:
        user = request.user
        group = Group.objects.get(id=group_id)
        # Nur Admins dürfen AI-Update triggern
        if not GroupMembership.objects.filter(group=group, user=user, role__in=['admin']).exists():
            return Response({'error': 'Nur Admins dürfen die AI-Zusammenfassung aktualisieren.'}, status=403)
        # Dummy-Logik: Generiere Beispiel-Zusammenfassung und Empfehlungen
        summary = f"Dies ist eine automatisch generierte Zusammenfassung für die Gruppe '{group.name}'."
        recommendations = [
            "Empfohlene Aktivität: Starte eine neue Diskussion!",
            "Empfohlene Aktion: Lade neue Mitglieder ein!",
            "Empfohlener Inhalt: Teile ein interessantes Thema!"
        ]
        group.ai_summary = summary
        group.ai_recommendations = recommendations
        group.save()
        return Response({'ai_summary': summary, 'ai_recommendations': recommendations})
    except Group.DoesNotExist:
        return Response({'error': 'Gruppe nicht gefunden.'}, status=404)
    except Exception as e:
        logger.error(f"Error generating AI summary: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_in_post_poll(request, post_id):
    post = Post.objects.filter(id=post_id).first()
    if not post or not hasattr(post, 'poll'):
        return Response({'error': 'Poll not found for this post'}, status=404)
    poll = post.poll
    option = request.data.get('option')
    if not option or option not in poll.options:
        return Response({'error': 'Invalid poll option'}, status=400)
    # Validierung: Ablaufdatum
    from django.utils import timezone
    if poll.expires_at and poll.expires_at < timezone.now():
        return Response({'error': 'Die Umfrage ist abgelaufen.'}, status=400)
    votes = poll.votes or {}
    user_id = str(request.user.id)
    # Validierung: User darf nur einmal abstimmen
    for voters in votes.values():
        if user_id in voters:
            return Response({'error': 'Du hast bereits abgestimmt.'}, status=400)
    # Add new vote
    votes.setdefault(option, []).append(user_id)
    poll.votes = votes
    poll.save()
    serializer = PostPollSerializer(poll)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post_poll(request, post_id):
    post = Post.objects.filter(id=post_id).first()
    if not post or not hasattr(post, 'poll'):
        return Response({'error': 'Poll not found for this post'}, status=404)
    serializer = PostPollSerializer(post.poll)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_online_status(request, group_id):
    try:
        group = Group.objects.get(id=group_id)
        member_ids = list(group.memberships.values_list('user_id', flat=True))
        member_ids = [str(uid) for uid in member_ids]
        online_map = async_to_sync(get_online_status)(member_ids)
        return Response({'online': online_map})
    except Group.DoesNotExist:
        return Response({'error': 'Group not found'}, status=404)
