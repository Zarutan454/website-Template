from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from bsn_social_network.models import (
    User, Friendship, UserSettings, NotificationSettings
)
from bsn_social_network.api.serializers import (
    UserSerializer, FriendshipSerializer, UserSettingsSerializer, NotificationSettingsSerializer
)

class UserListView(generics.ListAPIView):
    """
    List all users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """
        Optionally filter by username
        """
        queryset = User.objects.all()
        username = self.request.query_params.get('username', None)
        if username is not None:
            queryset = queryset.filter(username__icontains=username)
        return queryset

class UserDetailView(generics.RetrieveAPIView):
    """
    Retrieve a user
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserFriendsView(APIView):
    """
    List friends of a user
    """
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        
        # Get accepted friendships
        friends_as_requester = Friendship.objects.filter(
            requester=user, 
            status='accepted'
        ).values_list('receiver', flat=True)
        
        friends_as_receiver = Friendship.objects.filter(
            receiver=user, 
            status='accepted'
        ).values_list('requester', flat=True)
        
        # Combine the lists
        friends = User.objects.filter(id__in=list(friends_as_requester) + list(friends_as_receiver))
        
        serializer = UserSerializer(friends, many=True)
        return Response(serializer.data)

class FriendRequestView(APIView):
    """
    Send, accept, or decline friend requests
    """
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        
        # Check if requesting user is the target user or has permission
        if request.user.id != user.id and not request.user.is_staff:
            return Response({"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get pending received requests
        received_requests = Friendship.objects.filter(receiver=user, status='pending')
        serializer = FriendshipSerializer(received_requests, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        receiver = get_object_or_404(User, pk=pk)
        
        # Prevent self-friending
        if request.user.id == receiver.id:
            return Response({"message": "Cannot send friend request to yourself"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if friendship already exists
        if Friendship.objects.filter(requester=request.user, receiver=receiver).exists():
            return Response({"message": "Friend request already sent"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if reverse friendship exists
        if Friendship.objects.filter(requester=receiver, receiver=request.user).exists():
            return Response({"message": "You already have a friend request from this user"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create friendship request
        friendship = Friendship(requester=request.user, receiver=receiver, status='pending')
        friendship.save()
        
        serializer = FriendshipSerializer(friendship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def put(self, request, pk):
        friendship = get_object_or_404(Friendship, pk=pk)
        
        # Check if the current user is the receiver of the request
        if request.user.id != friendship.receiver.id:
            return Response({"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        status_action = request.data.get('status')
        if status_action not in ['accepted', 'declined']:
            return Response({"message": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        
        friendship.status = status_action
        friendship.save()
        
        serializer = FriendshipSerializer(friendship)
        return Response(serializer.data)

class UserSettingsView(APIView):
    """
    Get or update user settings
    """
    def get(self, request):
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
    
    def put(self, request):
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationSettingsView(APIView):
    """
    Get or update notification settings
    """
    def get(self, request):
        settings, created = NotificationSettings.objects.get_or_create(user=request.user)
        serializer = NotificationSettingsSerializer(settings)
        return Response(serializer.data)
    
    def put(self, request):
        settings, created = NotificationSettings.objects.get_or_create(user=request.user)
        serializer = NotificationSettingsSerializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 