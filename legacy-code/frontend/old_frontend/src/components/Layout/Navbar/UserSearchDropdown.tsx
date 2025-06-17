
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserSearchDropdownProps {
  className?: string;
}

const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      setIsLoading(true);
      // Implementiere hier die tatsächliche Suche mit deinem Backend
      // Für jetzt simulieren wir Ergebnisse
      setTimeout(() => {
        setSearchResults([
          { id: 1, username: 'user1', displayName: 'User One', avatarUrl: null },
          { id: 2, username: 'user2', displayName: 'User Two', avatarUrl: null },
        ]);
        setIsLoading(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };
  
  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="w-9 px-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search size={18} />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-dark-100 border border-gray-800 rounded-md shadow-xl z-50">
          <div className="p-2">
            <Input
              placeholder="Suche nach Benutzern..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-dark-200 border-gray-700"
              autoFocus
            />
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin h-5 w-5 border-t-2 border-primary rounded-full"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="px-4 py-2 hover:bg-dark-200 cursor-pointer flex items-center gap-3"
                    onClick={() => handleUserClick(user.username)}
                  >
                    <Avatar className="h-8 w-8">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} />
                      ) : null}
                      <AvatarFallback className="bg-primary-900 text-primary-100">
                        {user.displayName?.charAt(0) || user.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                Keine Benutzer gefunden
              </div>
            ) : null}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {searchQuery.length < 2 ? 'Min. 2 Zeichen eingeben' : 
               isLoading ? 'Suche...' : 
               `${searchResults.length} Ergebnisse`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => navigate('/explore/users')}
            >
              <Users size={14} className="mr-1"/> Alle Benutzer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchDropdown;
