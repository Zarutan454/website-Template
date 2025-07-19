import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { RelationshipUser } from '@/hooks/useUserRelationships';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext.utils';

const BlockedUsers: React.FC = () => {
  const { user: profile } = useAuth();
  const { getBlockedUsers, unblockUser } = useUserRelationships();
  const [blockedUsers, setBlockedUsers] = useState<RelationshipUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  
  const loadBlockedUsers = useCallback(async () => {
    setLoading(true);
    const data = await getBlockedUsers();
    setBlockedUsers(data);
    setLoading(false);
  }, [getBlockedUsers]);
  
  useEffect(() => {
    if (profile?.id) {
      loadBlockedUsers();
    }
  }, [profile, loadBlockedUsers]);
  
  const handleUnblock = async (userId: string) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    const success = await unblockUser(userId);
    if (success) {
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
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
  
  if (blockedUsers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Du hast keine Nutzer blockiert</p>
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
      {blockedUsers.map(user => (
        <motion.div 
          key={user.id} 
          className="flex items-center justify-between p-4 bg-background/60 rounded-lg border"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Link to={`/profile/${user.username}`} className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.username} />
              ) : (
                <AvatarFallback>
                  {user.display_name?.charAt(0) || user.username.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <p className="font-medium text-foreground">{user.display_name || user.username}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
              {user.bio && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>
              )}
            </div>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleUnblock(user.id)}
            disabled={actionLoading[user.id]}
          >
            {actionLoading[user.id] ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2 text-red-500" />
            )}
            Entsperren
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BlockedUsers;

