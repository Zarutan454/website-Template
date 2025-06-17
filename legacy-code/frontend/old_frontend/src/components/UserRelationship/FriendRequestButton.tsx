import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useProfile } from '@/hooks/useProfile';

export interface FriendRequestButtonProps {
  targetUserId: string;
  initialStatus?: 'none' | 'pending' | 'requested' | 'friends';
  onStatusChange?: (newStatus: 'none' | 'pending' | 'requested' | 'friends') => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabels?: boolean;
}

const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  targetUserId,
  initialStatus = 'none',
  onStatusChange,
  size = 'default',
  showLabels = true
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { sendFriendRequest, acceptFriendRequest, removeFriendship } = useUserRelationships();
  const { profile } = useProfile();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleSendRequest = async () => {
    if (!targetUserId || isLoading || !profile?.id) return;
    
    setIsLoading(true);
    
    try {
      const success = await sendFriendRequest(targetUserId);
      if (success) {
        const newStatus = 'pending';
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!targetUserId || isLoading || !profile?.id) return;
    
    setIsLoading(true);
    
    try {
      const success = await acceptFriendRequest(targetUserId);
      if (success) {
        const newStatus = 'friends';
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRelationship = async () => {
    if (!targetUserId || isLoading || !profile?.id) return;
    
    setIsLoading(true);
    
    try {
      const success = await removeFriendship(targetUserId);
      if (success) {
        const newStatus = 'none';
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Error removing relationship:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className="gap-1"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {showLabels && <span>Wird bearbeitet...</span>}
      </Button>
    );
  }

  switch (status) {
    case 'friends':
      return (
        <Button
          variant="outline"
          size={size}
          onClick={handleRemoveRelationship}
          className="gap-1"
        >
          <UserCheck size={16} />
          {showLabels && <span>Freunde</span>}
        </Button>
      );
    
    case 'pending':
      return (
        <Button
          variant="outline"
          size={size}
          onClick={handleRemoveRelationship}
          className="gap-1"
        >
          <UserX size={16} />
          {showLabels && <span>Anfrage zurückziehen</span>}
        </Button>
      );
    
    case 'requested':
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            size={size}
            onClick={handleAcceptRequest}
            className="gap-1"
          >
            <UserCheck size={16} />
            {showLabels && <span>Annehmen</span>}
          </Button>
          <Button
            variant="outline"
            size={size}
            onClick={handleRemoveRelationship}
            className="gap-1"
          >
            <UserX size={16} />
            {showLabels && <span>Ablehnen</span>}
          </Button>
        </div>
      );
    
    default: // 'none'
      return (
        <Button
          variant="default"
          size={size}
          onClick={handleSendRequest}
          className="gap-1"
        >
          <UserPlus size={16} />
          {showLabels && <span>Freund hinzufügen</span>}
        </Button>
      );
  }
};

export default FriendRequestButton;
