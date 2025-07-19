import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Users, 
  TrendingUp, 
  Star, 
  Filter, 
  X, 
  Loader2,
  UserPlus,
  MessageCircle,
  Heart,
  Share2,
  BarChart3,
  Clock,
  Hash,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext.utils';
import { apiClient } from '@/lib/django-api-new';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  cover_url?: string;
  influencer_category?: string;
  follower_count: number;
  is_alpha_user: boolean;
  created_at: string;
  relevance_score?: number;
}

interface SearchFilters {
  category?: string;
  min_followers?: number;
  max_followers?: number;
  is_verified?: boolean;
  is_alpha_user?: boolean;
  sort_by: string;
  sort_order: string;
}

interface SearchAnalytics {
  popular_searches: Array<{ term: string; count: number }>;
  recent_trends: Array<{ term: string; growth: number }>;
  total_searches_today: number;
  unique_searchers: number;
  average_results_per_search: number;
}

const AdvancedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'discovery' | 'trending' | 'analytics'>('search');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sort_by: 'relevance',
    sort_order: 'desc'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load initial data
  useEffect(() => {
    loadRecommendations();
    loadTrendingUsers();
    loadAnalytics();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await apiClient.get('/search/recommendations/');
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadTrendingUsers = async () => {
    try {
      const response = await apiClient.get('/search/trending/');
      setTrendingUsers(response.data.trending_users || []);
    } catch (error) {
      console.error('Error loading trending users:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.get('/search/analytics/');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: '1',
        limit: '20',
        ...filters
      });

      const response = await apiClient.get(`/search/advanced/?${params.toString()}`);
      setSearchResults(response.data.results || []);
      
      if (response.data.count === 0) {
        toast.info('Keine Ergebnisse gefunden');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Fehler bei der Suche');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const getSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await apiClient.get(`/search/suggestions/?q=${searchQuery}&limit=5`);
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      getSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleUserClick = (user: User) => {
    navigate(`/profile/${user.username}`);
  };

  const handleFollowUser = async (userId: number) => {
    try {
      await apiClient.post(`/users/${userId}/follow/`);
      toast.success('Benutzer erfolgreich gefolgt');
      // Refresh recommendations
      loadRecommendations();
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Fehler beim Folgen des Benutzers');
    }
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return '';
    
    const labels: Record<string, string> = {
      'crypto_streamer': 'Crypto Streamer',
      'influencer': 'Influencer',
      'content_creator': 'Content Creator',
      'youtuber': 'YouTuber',
      'twitter_influencer': 'Twitter Influencer'
    };
    
    return labels[category] || category;
  };

  const SearchResults = () => (
    <div className="space-y-4">
      {searchResults.map((user) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleUserClick(user)}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback>
              {user.first_name?.[0]}{user.last_name?.[0] || user.username[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate">
                {user.first_name} {user.last_name}
              </h3>
              {user.is_alpha_user && (
                <Badge variant="secondary" className="text-xs">
                  Alpha
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            {user.influencer_category && (
              <p className="text-xs text-muted-foreground">
                {getCategoryLabel(user.influencer_category)}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium">{user.follower_count.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Follower</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleFollowUser(user.id);
              }}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Folgen
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const DiscoveryFeed = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Empfohlene Benutzer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-card rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                  <AvatarFallback>
                    {user.first_name?.[0]}{user.last_name?.[0] || user.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowUser(user.id);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const TrendingUsers = () => (
    <div className="space-y-4">
      {trendingUsers.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleUserClick(user)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback>
                  {user.first_name?.[0]}{user.last_name?.[0] || user.username[0]}
                </AvatarFallback>
              </Avatar>
              {index < 3 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">
                  {user.first_name} {user.last_name}
                </h3>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-muted-foreground text-sm">@{user.username}</p>
              <p className="text-xs text-muted-foreground">
                {user.follower_count.toLocaleString()} Follower
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleFollowUser(user.id);
              }}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Folgen
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const SearchAnalytics = () => (
    <div className="space-y-6">
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Suchen heute</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_searches_today}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.unique_searchers} einzigartige Sucher
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Durchschnittliche Ergebnisse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.average_results_per_search}</div>
                <p className="text-xs text-muted-foreground">pro Suche</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Beliebte Suchen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.popular_searches.slice(0, 3).map((search, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="truncate">#{search.term}</span>
                      <Badge variant="secondary">{search.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Trending Suchbegriffe</CardTitle>
              <CardDescription>Die am schnellsten wachsenden Suchbegriffe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recent_trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">#{trend.term}</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      +{trend.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Erweiterte Suche</h1>
          <p className="text-muted-foreground">
            Finde Benutzer, entdecke Empfehlungen und analysiere Trends
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Suche</TabsTrigger>
          <TabsTrigger value="discovery">Entdeckung</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle>Benutzer suchen</CardTitle>
              <CardDescription>
                Finde Benutzer basierend auf Namen, Kategorie und anderen Kriterien
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={handleSearchChange}
                    placeholder="Suche nach Benutzern..."
                    className="pl-10"
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>

                {/* Suggestions */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full bg-background border rounded-lg shadow-lg mt-1"
                    >
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={!query.trim() || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suche läuft...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Suchen
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 bg-muted rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Kategorie</Label>
                          <Select
                            value={filters.category || ''}
                            onValueChange={(value) => setFilters({ ...filters, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Alle Kategorien" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Alle Kategorien</SelectItem>
                              <SelectItem value="crypto_streamer">Crypto Streamer</SelectItem>
                              <SelectItem value="influencer">Influencer</SelectItem>
                              <SelectItem value="content_creator">Content Creator</SelectItem>
                              <SelectItem value="youtuber">YouTuber</SelectItem>
                              <SelectItem value="twitter_influencer">Twitter Influencer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Sortierung</Label>
                          <Select
                            value={filters.sort_by}
                            onValueChange={(value) => setFilters({ ...filters, sort_by: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="relevance">Relevanz</SelectItem>
                              <SelectItem value="followers">Follower</SelectItem>
                              <SelectItem value="recent">Neueste</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Min. Follower</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={filters.min_followers || ''}
                            onChange={(e) => setFilters({ ...filters, min_followers: parseInt(e.target.value) || undefined })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="alpha-users"
                            checked={filters.is_alpha_user || false}
                            onCheckedChange={(checked) => setFilters({ ...filters, is_alpha_user: checked })}
                          />
                          <Label htmlFor="alpha-users">Nur Alpha User</Label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Suchergebnisse ({searchResults.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <SearchResults />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discovery">
          <DiscoveryFeed />
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>Trending Benutzer</CardTitle>
              <CardDescription>
                Benutzer mit hoher Aktivität und wachsender Beliebtheit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendingUsers />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <SearchAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSearchPage; 
