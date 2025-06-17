
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchUser } from '@/hooks/useUserSearch';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users } from 'lucide-react';

interface UserSearchResultsProps {
  users: SearchUser[];
  loading: boolean;
  onSelectUser: () => void;
  maxResults?: number;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({ 
  users, 
  loading, 
  onSelectUser,
  maxResults = 5
}) => {
  // Begrenze Anzahl der angezeigten Ergebnisse
  const displayedUsers = users.slice(0, maxResults);
  
  if (loading) {
    return (
      <div className="absolute z-10 mt-2 w-full bg-dark-100 rounded-md border border-gray-700 shadow-lg overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2 border-b border-gray-700 last:border-0 flex items-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-dark-300 mr-2" />
            <div className="flex-1">
              <div className="h-4 bg-dark-300 rounded w-24 mb-1" />
              <div className="h-3 bg-dark-300 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (displayedUsers.length === 0) {
    return (
      <div className="absolute z-10 mt-2 w-full bg-dark-100 rounded-md border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-4 text-center text-gray-400">
          Keine Benutzer gefunden
        </div>
      </div>
    );
  }
  
  return (
    <div className="absolute z-10 mt-2 w-full bg-dark-100 rounded-md border border-gray-700 shadow-lg overflow-hidden">
      {displayedUsers.map((user) => (
        <Link
          key={user.id}
          to={`/profile/${user.username}`}
          className="block p-3 hover:bg-dark-200 transition-colors border-b border-gray-700 last:border-0"
          onClick={onSelectUser}
        >
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary-500/80 to-secondary-600/80 text-sm">
                {user.display_name?.[0] || user.username[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">
                {user.display_name || user.username}
              </div>
              <div className="text-xs text-gray-400 truncate">
                @{user.username}
              </div>
            </div>
            
            {user.followers_count > 0 && (
              <div className="text-xs text-gray-500 flex items-center ml-2">
                <Users size={12} className="mr-1" />
                {user.followers_count}
              </div>
            )}
          </div>
          
          {user.bio && (
            <div className="mt-1 text-xs text-gray-400 line-clamp-1 pl-11">
              {user.bio}
            </div>
          )}
        </Link>
      ))}
      
      {users.length > maxResults && (
        <Link
          to={`/search?q=${encodeURIComponent(users[0]?.display_name || '')}`}
          className="block p-2 text-center text-primary-400 hover:text-primary-300 hover:bg-dark-200 text-sm"
          onClick={onSelectUser}
        >
          Alle {users.length} Ergebnisse anzeigen
        </Link>
      )}
    </div>
  );
};

export default UserSearchResults;
