from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Exists, OuterRef
from bsn_social_network.models import (
    User, Post, Comment, Like, Friendship, GroupMembership
)
from bsn_social_network.api.serializers import (
    PostSerializer, CommentSerializer, LikeSerializer
)

class PostListCreateView(generics.ListCreateAPIView):
    """
    List and create posts
    """
    serializer_class = PostSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    
    def get_queryset(self):
        """
        Optionally filter by user, group, or feed_type
        """
        queryset = Post.objects.all().order_by('-created_at')
        user_id = self.request.query_params.get('user_id', None)
        group_id = self.request.query_params.get('group_id', None)
        feed_type = self.request.query_params.get('feed_type', 'recent')
        
        # Filter by user if specified
        if user_id is not None:
            queryset = queryset.filter(author_id=user_id)
        
        # Filter by group if specified
        if group_id is not None:
            queryset = queryset.filter(group_id=group_id)
        
        # Apply feed-specific filtering
        if feed_type == 'popular':
            # Popular posts have more likes and comments
            queryset = queryset.annotate(
                popularity_score=Count('likes') + Count('comments') * 2
            ).order_by('-popularity_score', '-created_at')
        elif feed_type == 'following':
            # Get posts from users the current user is following
            if self.request.user.is_authenticated:
                following_users = Friendship.objects.filter(
                    requester=self.request.user, 
                    status='accepted'
                ).values_list('receiver', flat=True)
                
                following_users_as_receiver = Friendship.objects.filter(
                    receiver=self.request.user, 
                    status='accepted'
                ).values_list('requester', flat=True)
                
                all_following = list(following_users) + list(following_users_as_receiver)
                queryset = queryset.filter(author__in=all_following)
        elif feed_type == 'foryou':
            # Personalized feed - more complex logic could be implemented here
            if self.request.user.is_authenticated:
                # Include posts from friends and their interactions
                following_users = Friendship.objects.filter(
                    requester=self.request.user, 
                    status='accepted'
                ).values_list('receiver', flat=True)
                
                following_users_as_receiver = Friendship.objects.filter(
                    receiver=self.request.user, 
                    status='accepted'
                ).values_list('requester', flat=True)
                
                all_following = list(following_users) + list(following_users_as_receiver)
                
                # Include popular posts and posts from followed users
                queryset = queryset.filter(
                    Q(author__in=all_following) |
                    Q(likes__user__in=all_following) |  # Posts liked by friends
                    Q(likes__user=self.request.user)    # Posts the user liked
                ).distinct().order_by('-created_at')
                
        # Add additional filters if needed for other feed types (tokens, nfts, etc.)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a post
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    
    def perform_update(self, serializer):
        post = self.get_object()
        
        # Check if user is the author
        if self.request.user != post.author and not self.request.user.is_staff:
            self.permission_denied(self.request)
            
        serializer.save()
        
    def perform_destroy(self, instance):
        # Check if user is the author
        if self.request.user != instance.author and not self.request.user.is_staff:
            self.permission_denied(self.request)
            
        instance.delete()

class CommentListCreateView(generics.ListCreateAPIView):
    """
    List and create comments for a post
    """
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        post_id = self.kwargs['pk']
        return Comment.objects.filter(post_id=post_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, post=post)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a comment
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def perform_update(self, serializer):
        comment = self.get_object()
        
        # Check if user is the author
        if self.request.user != comment.author and not self.request.user.is_staff:
            self.permission_denied(self.request)
            
        serializer.save()
        
    def perform_destroy(self, instance):
        # Check if user is the author
        if self.request.user != instance.author and not self.request.user.is_staff:
            self.permission_denied(self.request)
            
        instance.delete()

class PostLikeView(APIView):
    """
    Like or unlike a post
    """
    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        
        # Check if like already exists
        like, created = Like.objects.get_or_create(
            user=request.user,
            post=post,
            defaults={'comment': None}
        )
        
        if not created:
            # Unlike if already liked
            like.delete()
            return Response({"message": "Post unliked"})
        
        serializer = LikeSerializer(like)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CommentLikeView(APIView):
    """
    Like or unlike a comment
    """
    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        
        # Check if like already exists
        like, created = Like.objects.get_or_create(
            user=request.user,
            comment=comment,
            defaults={'post': None}
        )
        
        if not created:
            # Unlike if already liked
            like.delete()
            return Response({"message": "Comment unliked"})
        
        serializer = LikeSerializer(like)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FeedView(generics.ListAPIView):
    """
    Get the user's feed with posts from friends and groups
    """
    serializer_class = PostSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Get friends
        friends_as_requester = Friendship.objects.filter(
            requester=user, 
            status='accepted'
        ).values_list('receiver', flat=True)
        
        friends_as_receiver = Friendship.objects.filter(
            receiver=user, 
            status='accepted'
        ).values_list('requester', flat=True)
        
        friend_ids = list(friends_as_requester) + list(friends_as_receiver)
        
        # Get groups the user is a member of
        groups = GroupMembership.objects.filter(
            user=user
        ).values_list('group', flat=True)
        
        # Get posts from friends, own posts, and group posts
        queryset = Post.objects.filter(
            Q(author=user) | 
            Q(author__in=friend_ids) |
            Q(group__in=groups)
        ).order_by('-created_at')
        
        return queryset 