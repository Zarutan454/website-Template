import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, User, Hash, FileText, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/django-api-new';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: number;
  type: 'user' | 'post' | 'hashtag';
  title: string;
  subtitle?: string;
  avatar_url?: string;
  content?: string;
  metadata?: Record<string, any>;
}

interface SearchComponentProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onResultClick,
  placeholder = "Suche nach Nutzern, Posts oder Hashtags...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'hashtags'>('all');
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search API call
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery, activeTab],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { results: [] };

      const params = new URLSearchParams({
        q: debouncedQuery,
        type: activeTab,
      });

      const response = await apiClient.get(`/search/?${params.toString()}`);
      return response.data;
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setIsOpen(false);
    setQuery('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const results = searchResults?.results || [];

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2" />
                Suche läuft...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">
                Fehler beim Laden der Suchergebnisse
              </div>
            ) : results.length > 0 ? (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Alle</TabsTrigger>
                  <TabsTrigger value="users">Nutzer</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="p-0">
                  <SearchResultsList results={results} onResultClick={handleResultClick} />
                </TabsContent>

                <TabsContent value="users" className="p-0">
                  <SearchResultsList 
                    results={results.filter(r => r.type === 'user')} 
                    onResultClick={handleResultClick} 
                  />
                </TabsContent>

                <TabsContent value="posts" className="p-0">
                  <SearchResultsList 
                    results={results.filter(r => r.type === 'post')} 
                    onResultClick={handleResultClick} 
                  />
                </TabsContent>

                <TabsContent value="hashtags" className="p-0">
                  <SearchResultsList 
                    results={results.filter(r => r.type === 'hashtag')} 
                    onResultClick={handleResultClick} 
                  />
                </TabsContent>
              </Tabs>
            ) : debouncedQuery ? (
              <div className="p-4 text-center text-muted-foreground">
                Keine Ergebnisse für "{debouncedQuery}" gefunden
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Search Results List Component
interface SearchResultsListProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results, onResultClick }) => {
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'hashtag':
        return <Hash className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getResultBadge = (type: string) => {
    switch (type) {
      case 'user':
        return <Badge variant="secondary">Nutzer</Badge>;
      case 'post':
        return <Badge variant="outline">Post</Badge>;
      case 'hashtag':
        return <Badge variant="default">Hashtag</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="divide-y">
      {results.map((result) => (
        <div
          key={`${result.type}-${result.id}`}
          className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onResultClick(result)}
        >
          {/* Avatar/Icon */}
          <div className="flex-shrink-0">
            {result.avatar_url ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={result.avatar_url} alt={result.title} />
                <AvatarFallback>
                  {getResultIcon(result.type)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {getResultIcon(result.type)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{result.title}</h4>
              {getResultBadge(result.type)}
            </div>
            {result.subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {result.subtitle}
              </p>
            )}
            {result.content && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {result.content}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchComponent; 