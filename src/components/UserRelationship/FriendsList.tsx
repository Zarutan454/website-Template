import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserMinus, Loader2, Search } from 'lucide-react';
import UserRelationshipButton from './UserRelationshipButton';
import { RelationshipUser } from '@/hooks/useUserRelationships';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const FriendsList: React.FC = () => {
  const { user: profile } = useAuth();
  const { getFriends, removeFriendship } = useUserRelationships();
  const [friends, setFriends] = useState<RelationshipUser[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<RelationshipUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (profile?.id) {
      loadFriends();
    }
  }, [profile]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFriends(
        friends.filter(
          friend => 
            friend.username.toLowerCase().includes(query) || 
            friend.display_name?.toLowerCase().includes(query) ||
            friend.bio?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, friends]);
  
  const loadFriends = async () => {
    setLoading(true);
    const data = await getFriends();
    setFriends(data);
    setFilteredFriends(data);
    setLoading(false);
  };
  
  const handleRemoveFriend = async (userId: string) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    const success = await removeFriendship(userId);
    if (success) {
      setFriends(prev => prev.filter(friend => friend.id !== userId));
      setFilteredFriends(prev => prev.filter(friend => friend.id !== userId));
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
  
  return (
    <div className="space-y-4">
      {friends.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Freunde suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      
      {filteredFriends.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {friends.length === 0 ? (
            <>
              <p>Du hast noch keine Freunde.</p>
              <p className="mt-2">Nutze die Suche, um neue Freunde zu finden!</p>
            </>
          ) : (
            <p>Keine Ergebnisse für "{searchQuery}"</p>
          )}
        </div>
      )}
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {filteredFriends.map(friend => (
          <motion.div 
            key={friend.id} 
            className="flex items-start justify-between p-4 bg-background/60 rounded-lg border"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Link to={`/profile/${friend.username}`} className="flex items-start flex-1">
              <Avatar className="h-10 w-10 mr-3">
                {friend.avatar_url ? (
                  <AvatarImage src={friend.avatar_url} alt={friend.username} />
                ) : (
                  <AvatarFallback>
                    {friend.display_name?.charAt(0) || friend.username.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div>
                <p className="font-medium text-foreground">{friend.display_name || friend.username}</p>
                <p className="text-xs text-muted-foreground">@{friend.username}</p>
                {friend.bio && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{friend.bio}</p>
                )}
              </div>
            </Link>
            
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {/* Nachricht senden - kann später implementiert werden */}}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRemoveFriend(friend.id)}
                disabled={actionLoading[friend.id]}
              >
                {actionLoading[friend.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserMinus className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FriendsList;
