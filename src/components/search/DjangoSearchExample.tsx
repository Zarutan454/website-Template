import React, { useState, useRef, useEffect } from 'react';
import { useDjangoSearch } from '@/hooks/search/useDjangoSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Users, 
  FileText, 
  Hash, 
  Users2, 
  Clock, 
  TrendingUp,
  Filter,
  X,
  Loader2,
  Star,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Beispiel-Komponente für die Verwendung des Django Search Systems
 * 
 * ALT (Supabase):
 * const { data } = await supabase.from('user_search').select('*').ilike('username', `%${query}%`);
 * 
 * NEU (Django):
 * const { search, results, suggestions } = useDjangoSearch();
 */
const DjangoSearchExample: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'groups' | 'hashtags'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    is_verified: false,
    has_media: false,
    min_likes: 0,
    min_followers: 0
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    results,
    suggestions,
    history,
    trending,
    isLoading,
    error,
    hasMore,
    totalResults,
    search,
    searchUsers,
    searchPosts,
    searchGroups,
    searchHashtags,
    getSuggestions,
    clearSearchHistory,
    loadMore,
    debouncedSearch
  } = useDjangoSearch({
    enableSuggestions: true,
    enableHistory: true,
    debounceMs: 300
  });

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setQuery(value);
    
    if (value.trim()) {
      debouncedSearch(value);
      getSuggestions(value);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    switch (activeTab) {
      case 'users':
        searchUsers(searchQuery, {
          is_verified: filters.is_verified,
          min_followers: filters.min_followers || undefined
        });
        break;
      case 'posts':
        searchPosts(searchQuery, {
          has_media: filters.has_media,
          min_likes: filters.min_likes || undefined
        });
        break;
      case 'groups':
        searchGroups(searchQuery);
        break;
      case 'hashtags':
        searchHashtags(searchQuery);
        break;
      default:
        search(searchQuery);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // Handle history item click
  const handleHistoryClick = (historyItem: { query: string }) => {
    setQuery(historyItem.query);
    handleSearch(historyItem.query);
  };

  // Handle trending item click
  const handleTrendingClick = (trendingItem: { text: string }) => {
    setQuery(trendingItem.text);
    handleSearch(trendingItem.text);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setShowFilters(false);
  };

  // Get result icon based on type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'post':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'group':
        return <Users2 className="w-4 h-4 text-purple-500" />;
      case 'hashtag':
        return <Hash className="w-4 h-4 text-orange-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Suche</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          {query && (
            <Button onClick={clearSearch} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Suche nach Benutzern, Posts, Gruppen, Hashtags..."
            className="pl-10 pr-4"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && query && (
          <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span>{suggestion.text}</span>
                <Badge variant="outline" className="ml-auto">
                  {suggestion.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>Verifizierte Benutzer</span>
                <Switch
                  checked={filters.is_verified}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, is_verified: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Nur Posts mit Medien</span>
                <Switch
                  checked={filters.has_media}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, has_media: checked }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Min. Likes</label>
                <Input
                  type="number"
                  value={filters.min_likes}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_likes: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Min. Follower</label>
                <Input
                  type="number"
                  value={filters.min_followers}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_followers: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Fehler: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isLoading ? 'Suche läuft...' : `${totalResults} Ergebnisse für "${query}"`}
            </h2>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList>
                <TabsTrigger value="all">Alle</TabsTrigger>
                <TabsTrigger value="users">Benutzer</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="groups">Gruppen</TabsTrigger>
                <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{result.title}</h3>
                        <Badge variant="outline">{result.type}</Badge>
                        {result.metadata?.is_verified && (
                          <Star className="w-4 h-4 text-blue-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {result.metadata?.followers_count && (
                          <span>{result.metadata.followers_count} Follower</span>
                        )}
                        {result.metadata?.likes_count && (
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{result.metadata.likes_count}</span>
                          </span>
                        )}
                        {result.metadata?.comments_count && (
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{result.metadata.comments_count}</span>
                          </span>
                        )}
                        {result.metadata?.shares_count && (
                          <span className="flex items-center space-x-1">
                            <Share2 className="w-3 h-3" />
                            <span>{result.metadata.shares_count}</span>
                          </span>
                        )}
                        <span>{formatDate(result.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {results.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                Keine Ergebnisse gefunden
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Lade...
                  </>
                ) : (
                  'Mehr laden'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Search History & Trending */}
      {!query && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  Suchverlauf
                </span>
                <Button
                  onClick={clearSearchHistory}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <span className="text-sm">{item.query}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Kein Suchverlauf vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trending Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                Trendende Suchen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trending.length > 0 ? (
                  trending.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleTrendingClick(item)}
                    >
                      <span className="text-sm">{item.text}</span>
                      {item.count && (
                        <Badge variant="outline" className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Keine trendenden Suchen</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DjangoSearchExample; 
