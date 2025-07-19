import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/django-api-new';
import { toast } from 'sonner';

interface Hashtag {
  id: number;
  name: string;
  description: string;
  posts_count: number;
  created_at: string;
}

interface HashtagListProps {
  onHashtagClick?: (hashtag: string) => void;
  showTrending?: boolean;
  maxItems?: number;
}

const HashtagList: React.FC<HashtagListProps> = ({
  onHashtagClick,
  showTrending = true,
  maxItems = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHashtags, setFilteredHashtags] = useState<Hashtag[]>([]);

  // Fetch hashtags
  const { data: hashtags, isLoading, error } = useQuery({
    queryKey: ['hashtags'],
    queryFn: async () => {
      const response = await apiClient.get('/hashtags/');
      return response.data as Hashtag[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch trending hashtags
  const { data: trendingHashtags } = useQuery({
    queryKey: ['hashtags', 'trending'],
    queryFn: async () => {
      const response = await apiClient.get('/hashtags/trending/');
      return response.data as Hashtag[];
    },
    enabled: showTrending,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter hashtags based on search term
  useEffect(() => {
    if (!hashtags) return;
    
    const filtered = hashtags.filter(hashtag =>
      hashtag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hashtag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHashtags(filtered.slice(0, maxItems));
  }, [hashtags, searchTerm, maxItems]);

  const handleHashtagClick = (hashtagName: string) => {
    if (onHashtagClick) {
      onHashtagClick(hashtagName);
    } else {
      // Default behavior: navigate to hashtag page
      window.location.href = `/hashtag/${hashtagName}`;
    }
  };

  const displayHashtags = searchTerm ? filteredHashtags : (trendingHashtags || hashtags || []).slice(0, maxItems);

  if (error) {
    toast.error('Fehler beim Laden der Hashtags');
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showTrending && !searchTerm ? (
            <>
              <TrendingUp className="h-5 w-5" />
              Trending Hashtags
            </>
          ) : (
            <>
              <Hash className="h-5 w-5" />
              Hashtags
            </>
          )}
        </CardTitle>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hashtags durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted animate-pulse">
                <div className="h-4 bg-muted-foreground/20 rounded w-24"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-8"></div>
              </div>
            ))}
          </div>
        ) : displayHashtags.length > 0 ? (
          <div className="space-y-2">
            {displayHashtags.map((hashtag) => (
              <div
                key={hashtag.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleHashtagClick(hashtag.name)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    #{hashtag.name}
                  </Badge>
                  {hashtag.description && (
                    <span className="text-sm text-muted-foreground truncate">
                      {hashtag.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {hashtag.posts_count} Posts
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {searchTerm ? 'Keine Hashtags gefunden' : 'Keine Hashtags verfügbar'}
          </div>
        )}
        
        {hashtags && hashtags.length > maxItems && !searchTerm && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => window.location.href = '/hashtags'}
          >
            Alle Hashtags anzeigen
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default HashtagList; 