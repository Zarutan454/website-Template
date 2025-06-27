
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserSearch } from '@/hooks/useUserSearch';
import UserSearchResults from './UserSearchResults';

const UserSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { users, isLoading, searchUsers } = useUserSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handler);
    
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);
  
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      }
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [query, searchUsers]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
  };
  
  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
  };
  
  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center border rounded-lg bg-dark-100 border-gray-700 focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500">
        <Search className="ml-3 h-4 w-4 shrink-0 text-gray-500" />
        <Input
          placeholder="Benutzer suchen..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          className="border-0 bg-transparent focus-visible:ring-0 text-white"
        />
        {query && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearSearch}
            className="h-8 w-8 mr-1 p-0 hover:bg-dark-200"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" /> : <X className="h-4 w-4 text-gray-500" />}
          </Button>
        )}
      </div>
      
      {showResults && query.trim() && (
        <UserSearchResults users={users} loading={isLoading} onSelectUser={() => setShowResults(false)} />
      )}
    </div>
  );
};

export default UserSearchBar;
