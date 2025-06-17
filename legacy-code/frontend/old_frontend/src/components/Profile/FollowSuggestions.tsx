
import React from 'react';
import { useFollowSuggestions } from '@/hooks/useFollowSuggestions';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FollowSuggestionsProps {
  limit?: number;
}

const FollowSuggestions: React.FC<FollowSuggestionsProps> = ({ limit = 5 }) => {
  const { suggestions, isLoading, refreshSuggestions } = useFollowSuggestions(limit);
  const { followUser, isProcessing } = useUserRelationships();

  const handleFollow = async (userId: string) => {
    const success = await followUser(userId);
    if (success) {
      refreshSuggestions();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <h3 className="text-lg font-medium">Vorschläge für dich</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-28">
              <div className="flex flex-col items-center">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-3 w-20 mt-2" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null; // Don't show anything if there are no suggestions
  }

  return (
    <div className="py-4">
      <h3 className="text-lg font-medium mb-4">Vorschläge für dich</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {suggestions.map((user) => (
          <motion.div 
            key={user.id} 
            className="flex-shrink-0 w-28"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center">
              <Link to={`/profile/${user.username}`}>
                <Avatar className="h-16 w-16 mb-2 border-2 border-primary hover:border-primary-400 transition-all">
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.display_name || user.username} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-lg">
                      {(user.display_name || user.username)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              <Link to={`/profile/${user.username}`} className="text-sm font-medium truncate w-full text-center">
                {user.display_name || user.username}
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full text-xs h-8"
                onClick={() => handleFollow(user.id)}
                disabled={isProcessing}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Folgen
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FollowSuggestions;
