from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import GroupMembership

class IsOwnerOrAdmin(BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object or an admin.
        return obj.author == request.user or request.user.is_staff

class CanViewGroup(BasePermission):
    """
    Permission to check if a user can view a group.
    A user can view a group if it is public, or if they are a member.
    """
    def has_object_permission(self, request, view, obj):
        if obj.privacy == 'public':
            return True
        
        if request.user.is_authenticated:
            return GroupMembership.objects.filter(group=obj, user=request.user).exists()
            
        return False 