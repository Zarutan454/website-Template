import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { RelationshipUser } from '@/hooks/useUserRelationships';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const FriendRequestList: React.FC = () => {
  const { user: profile } = useAuth();
  const { getFriendRequests, acceptFriendRequest, removeFriendship } = useUserRelationships();
  const [requests, setRequests] = useState<RelationshipUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  
  const loadFriendRequests = useCallback(async () => {
    setLoading(true);
    const data = await getFriendRequests();
    setRequests(data);
    setLoading(false);
  }, [getFriendRequests]);
  
  useEffect(() => {
    if (profile?.id) {
      loadFriendRequests();
    }
  }, [profile, loadFriendRequests]);
  
  const handleAccept = async (userId: string) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    const success = await acceptFriendRequest(userId);
    if (success) {
      setRequests(prev => prev.filter(request => request.id !== userId));
    }
    setActionLoading(prev => ({ ...prev, [userId]: false }));
  };
  
  const handleDecline = async (userId: string) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    const success = await removeFriendship(userId);
    if (success) {
      setRequests(prev => prev.filter(request => request.id !== userId));
    }
    setActionLoading(prev => ({ ...prev, [userId]: false }));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Keine ausstehenden Freundschaftsanfragen</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {requests.map(request => (
        <motion.div 
          key={request.id} 
          className="flex items-center justify-between p-4 bg-background/60 rounded-lg border"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Link to={`/profile/${request.username}`} className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              {request.avatar_url ? (
                <AvatarImage src={request.avatar_url} alt={request.username} />
              ) : (
                <AvatarFallback>
                  {request.display_name?.charAt(0) || request.username.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <p className="font-medium text-foreground">{request.display_name || request.username}</p>
              <p className="text-xs text-muted-foreground">@{request.username}</p>
            </div>
          </Link>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDecline(request.id)}
              disabled={actionLoading[request.id]}
            >
              {actionLoading[request.id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleAccept(request.id)}
              disabled={actionLoading[request.id]}
            >
              {actionLoading[request.id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FriendRequestList;
