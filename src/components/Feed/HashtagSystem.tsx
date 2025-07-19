import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { apiClient } from '@/lib/django-api-new';
import { Hash, TrendingUp, Search } from 'lucide-react';

interface Hashtag {
  id: number;
  name: string;
  post_count: number;
  is_trending?: boolean;
}

interface HashtagSystemProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

const HashtagSystem: React.FC<HashtagSystemProps> = ({
  value,
  onChange,
  placeholder = "Schreibe etwas...",
  className = "",
  showSuggestions = true
}) => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [showSuggestionsPopover, setShowSuggestionsPopover] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentHashtag, setCurrentHashtag] = useState('');

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      const response = await apiClient.get('/api/hashtags/trending/');
      setTrendingHashtags(response.data.results || response.data);
    } catch (error: unknown) {
      console.error('Failed to fetch trending hashtags:', error);
    }
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check if we're typing a hashtag
    const beforeCursor = newValue.substring(0, cursorPos);
    const hashtagMatch = beforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch && showSuggestions) {
      const hashtagStart = hashtagMatch[1];
      setCurrentHashtag(hashtagStart);
      setShowSuggestionsPopover(true);
      searchHashtags(hashtagStart);
    } else {
      setShowSuggestionsPopover(false);
    }
  };

  const searchHashtags = async (query: string) => {
    if (query.length < 1) {
      setHashtags([]);
      return;
    }

    try {
      const response = await apiClient.get(`/api/hashtags/search/?q=${encodeURIComponent(query)}`);
      setHashtags(response.data.results || response.data);
    } catch (error: unknown) {
      console.error('Failed to search hashtags:', error);
    }
  };

  const insertHashtag = (hashtagName: string) => {
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    // Find the start of the current hashtag
    const hashtagStart = beforeCursor.lastIndexOf('#');
    const newValue = beforeCursor.substring(0, hashtagStart) + 
                    `#${hashtagName} ` + 
                    afterCursor;
    
    onChange(newValue);
    setShowSuggestionsPopover(false);
    
    // Focus back to input
    setTimeout(() => {
      const input = document.querySelector('input') as HTMLInputElement;
      if (input) {
        input.focus();
        const newCursorPos = hashtagStart + hashtagName.length + 2; // +2 for # and space
        input.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleHashtagClick = (hashtagName: string) => {
    // Navigate to hashtag page or search
    window.location.href = `/hashtag/${hashtagName}`;
  };

  const renderHashtags = (text: string) => {
    const hashtagRegex = /#(\w+)/g;
    const parts = text.split(hashtagRegex);
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        result.push(parts[i]);
      } else {
        // Hashtag
        result.push(
          <Badge
            key={i}
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            onClick={() => handleHashtagClick(parts[i])}
          >
            #{parts[i]}
          </Badge>
        );
      }
    }

    return result;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-10"
        />
        
        {showSuggestions && (
          <Popover open={showSuggestionsPopover} onOpenChange={setShowSuggestionsPopover}>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Hashtags suchen..." />
                <CommandList>
                  <CommandEmpty>Keine Hashtags gefunden.</CommandEmpty>
                  <CommandGroup heading="Vorschläge">
                    {hashtags.map((hashtag) => (
                      <CommandItem
                        key={hashtag.id}
                        onSelect={() => insertHashtag(hashtag.name)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span>#{hashtag.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {hashtag.post_count} Posts
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Trending Hashtags */}
      {trendingHashtags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Trending Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.slice(0, 5).map((hashtag) => (
              <Badge
                key={hashtag.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => insertHashtag(hashtag.name)}
              >
                #{hashtag.name}
                {hashtag.is_trending && (
                  <TrendingUp className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Hashtag Preview */}
      {value && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span>Vorschau</span>
          </div>
          <div className="p-3 border rounded-lg bg-muted/50">
            <div className="space-x-1">
              {renderHashtags(value)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagSystem; 