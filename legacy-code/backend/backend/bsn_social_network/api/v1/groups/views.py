from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from bsn_social_network.models import (
    Group, GroupMembership, User, Post
)
from bsn_social_network.api.serializers import (
    GroupSerializer, GroupMembershipSerializer, UserSerializer, PostSerializer
)

class GroupListCreateView(generics.ListCreateAPIView):
    """
    List and create groups
    """
    serializer_class = GroupSerializer
    
    def get_queryset(self):
        """
        Filter by name or get user's groups
        """
        queryset = Group.objects.all()
        name = self.request.query_params.get('name', None)
        my_groups = self.request.query_params.get('my_groups', None)
        
        if name is not None:
            queryset = queryset.filter(name__icontains=name)
        
        if my_groups == 'true':
            user_groups = GroupMembership.objects.filter(
                user=self.request.user
            ).values_list('group', flat=True)
            queryset = queryset.filter(id__in=user_groups)
            
        return queryset
    
    def perform_create(self, serializer):
        group = serializer.save(creator=self.request.user)
        
        # Add creator as admin
        GroupMembership.objects.create(
            group=group,
            user=self.request.user,
            role='admin'
        )

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a group
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    
    def perform_update(self, serializer):
        group = self.get_object()
        
        # Check if user is admin
        try:
            membership = GroupMembership.objects.get(group=group, user=self.request.user)
            if membership.role != 'admin' and not self.request.user.is_staff:
                self.permission_denied(self.request)
        except GroupMembership.DoesNotExist:
            self.permission_denied(self.request)
            
        serializer.save()
        
    def perform_destroy(self, instance):
        # Check if user is admin
        try:
            membership = GroupMembership.objects.get(group=instance, user=self.request.user)
            if membership.role != 'admin' and not self.request.user.is_staff:
                self.permission_denied(self.request)
        except GroupMembership.DoesNotExist:
            self.permission_denied(self.request)
            
        instance.delete()

class GroupMemberListView(generics.ListAPIView):
    """
    List group members
    """
    serializer_class = UserSerializer
    
    def get_queryset(self):
        group_id = self.kwargs['pk']
        group = get_object_or_404(Group, pk=group_id)
        
        memberships = GroupMembership.objects.filter(group=group).values_list('user', flat=True)
        return User.objects.filter(id__in=memberships)

class GroupJoinView(APIView):
    """
    Join or leave a group
    """
    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        
        # For private groups, this would need invitation logic
        if group.privacy == 'private':
            # In a real app, check if user has an invitation
            pass
        
        # Check if already a member
        membership, created = GroupMembership.objects.get_or_create(
            group=group,
            user=request.user,
            defaults={'role': 'member'}
        )
        
        if not created:
            return Response({"message": "Already a member of this group"})
        
        serializer = GroupMembershipSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def delete(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        
        try:
            membership = GroupMembership.objects.get(group=group, user=request.user)
            
            # Prevent creator from leaving without transferring ownership
            if group.creator == request.user:
                # Check if there are other admins
                other_admins = GroupMembership.objects.filter(
                    group=group, 
                    role='admin'
                ).exclude(user=request.user).exists()
                
                if not other_admins:
                    return Response(
                        {"message": "Cannot leave group. Transfer admin role to another member first."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            membership.delete()
            return Response({"message": "Successfully left the group"})
            
        except GroupMembership.DoesNotExist:
            return Response(
                {"message": "Not a member of this group"},
                status=status.HTTP_400_BAD_REQUEST
            )

class GroupMemberDetailView(APIView):
    """
    Update or remove a group member
    """
    def put(self, request, group_pk, user_pk):
        group = get_object_or_404(Group, pk=group_pk)
        target_user = get_object_or_404(User, pk=user_pk)
        
        # Check if requester is admin
        try:
            requester_membership = GroupMembership.objects.get(group=group, user=request.user)
            if requester_membership.role != 'admin' and not request.user.is_staff:
                return Response(
                    {"message": "Only group admins can update member roles"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except GroupMembership.DoesNotExist:
            return Response(
                {"message": "You are not a member of this group"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get target membership
        try:
            target_membership = GroupMembership.objects.get(group=group, user=target_user)
        except GroupMembership.DoesNotExist:
            return Response(
                {"message": "User is not a member of this group"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update role
        new_role = request.data.get('role')
        if new_role not in ['member', 'admin']:
            return Response(
                {"message": "Invalid role. Must be 'member' or 'admin'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        target_membership.role = new_role
        target_membership.save()
        
        serializer = GroupMembershipSerializer(target_membership)
        return Response(serializer.data)
    
    def delete(self, request, group_pk, user_pk):
        group = get_object_or_404(Group, pk=group_pk)
        target_user = get_object_or_404(User, pk=user_pk)
        
        # Check if requester is admin
        try:
            requester_membership = GroupMembership.objects.get(group=group, user=request.user)
            if requester_membership.role != 'admin' and not request.user.is_staff:
                return Response(
                    {"message": "Only group admins can remove members"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except GroupMembership.DoesNotExist:
            return Response(
                {"message": "You are not a member of this group"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get target membership
        try:
            target_membership = GroupMembership.objects.get(group=group, user=target_user)
        except GroupMembership.DoesNotExist:
            return Response(
                {"message": "User is not a member of this group"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent removing the creator
        if target_user == group.creator:
            return Response(
                {"message": "Cannot remove the group creator"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        target_membership.delete()
        return Response({"message": "Member removed from group"})

class GroupPostListView(generics.ListAPIView):
    """
    List posts in a group
    """
    serializer_class = PostSerializer
    
    def get_queryset(self):
        group_id = self.kwargs['pk']
        group = get_object_or_404(Group, pk=group_id)
        
        # For private groups, check if user is a member
        if group.privacy == 'private':
            is_member = GroupMembership.objects.filter(
                group=group, 
                user=self.request.user
            ).exists()
            
            if not is_member and not self.request.user.is_staff:
                return Post.objects.none()
        
        return Post.objects.filter(group=group).order_by('-created_at') 