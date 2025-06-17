
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useUserRelationships } from "@/hooks/useUserRelationships";
import { Loader2, UserPlus, UserMinus, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type?: 'followers' | 'following';
}

interface UserListItem {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  isFollowing?: boolean;
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  userId,
  type = 'followers'
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(type);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { followUser, unfollowUser, isFollowing } = useUserRelationships();
  
  const isOwnProfile = profile?.id === userId;
  
  // Lade Follower- oder Following-Liste
  useEffect(() => {
    if (!isOpen || !userId) return;
    
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        let data;
        
        if (activeTab === 'followers') {
          // Hole alle Benutzer, die userId folgen
          const { data: relationships, error } = await supabase
            .from('user_relationships')
            .select(`
              user_id,
              users:user_id (
                id, 
                username, 
                display_name, 
                avatar_url, 
                bio
              )
            `)
            .eq('related_user_id', userId)
            .eq('relationship_type', 'following');
            
          if (error) throw error;
          
          data = relationships.map(item => ({
            ...item.users,
            isFollowing: false // Wird später aktualisiert
          }));
        } else {
          // Hole alle Benutzer, denen userId folgt
          const { data: relationships, error } = await supabase
            .from('user_relationships')
            .select(`
              related_user_id,
              users:related_user_id (
                id, 
                username, 
                display_name, 
                avatar_url, 
                bio
              )
            `)
            .eq('user_id', userId)
            .eq('relationship_type', 'following');
            
          if (error) throw error;
          
          data = relationships.map(item => ({
            ...item.users,
            isFollowing: false // Wird später aktualisiert
          }));
        }
        
        // Wenn eingeloggt, prüfen welchen Benutzern wir folgen
        if (profile?.id) {
          for (const user of data) {
            if (user.id !== profile.id) {
              user.isFollowing = await isFollowing(user.id);
            }
          }
        }
        
        setUsers(data);
      } catch (error) {
        toast.error('Fehler beim Laden der Benutzerliste');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [isOpen, userId, activeTab, profile?.id, isFollowing]);
  
  // Gefilterte Benutzerliste basierend auf der Suche
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      (user.display_name || '').toLowerCase().includes(query)
    );
  });
  
  // Folge oder entfolge einem Benutzer
  const handleToggleFollow = async (targetUser: UserListItem) => {
    if (!profile || processingIds[targetUser.id]) return;
    
    setProcessingIds(prev => ({ ...prev, [targetUser.id]: true }));
    
    try {
      if (targetUser.isFollowing) {
        const success = await unfollowUser(targetUser.id);
        if (success) {
          setUsers(prev => 
            prev.map(user => 
              user.id === targetUser.id 
                ? { ...user, isFollowing: false } 
                : user
            )
          );
          toast.success(`Du folgst ${targetUser.display_name || targetUser.username} nicht mehr`);
        }
      } else {
        const success = await followUser(targetUser.id);
        if (success) {
          setUsers(prev => 
            prev.map(user => 
              user.id === targetUser.id 
                ? { ...user, isFollowing: true } 
                : user
            )
          );
          toast.success(`Du folgst jetzt ${targetUser.display_name || targetUser.username}`);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Aktion konnte nicht ausgeführt werden');
    } finally {
      setProcessingIds(prev => ({ ...prev, [targetUser.id]: false }));
    }
  };
  
  // Navigiere zum Profil eines Benutzers
  const navigateToProfile = (username: string) => {
    onClose();
    navigate(`/profile/${username}`);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'followers' ? 'Follower' : 'Folgt'}
          </DialogTitle>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="followers">Follower</TabsTrigger>
              <TabsTrigger value="following">Folgt</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4"
            />
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? 'Keine Benutzer gefunden'
                : activeTab === 'followers'
                  ? 'Keine Follower'
                  : 'Folgt niemandem'}
            </div>
          ) : (
            <ul className="space-y-3 p-1">
              {filteredUsers.map(user => (
                <li 
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100/5 rounded-md transition-colors"
                >
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer" 
                    onClick={() => navigateToProfile(user.username)}
                  >
                    <Avatar className="h-10 w-10 border border-gray-700/50">
                      <AvatarImage src={user.avatar_url || ''} alt={user.username} />
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate">
                        {user.display_name || user.username}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  
                  {profile && profile.id !== user.id && (
                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      className="ml-2"
                      onClick={() => handleToggleFollow(user)}
                      disabled={processingIds[user.id]}
                    >
                      {processingIds[user.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Folgst du</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Folgen</span>
                        </>
                      )}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
