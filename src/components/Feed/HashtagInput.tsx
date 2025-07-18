import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/django-api-new';

interface HashtagInputProps {
  value: string[];
  onChange: (hashtags: string[]) => void;
  placeholder?: string;
  maxHashtags?: number;
  className?: string;
}

const HashtagInput: React.FC<HashtagInputProps> = ({
  value = [],
  onChange,
  placeholder = "Hashtags hinzufügen...",
  maxHashtags = 10,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch hashtag suggestions
  const { data: allHashtags } = useQuery({
    queryKey: ['hashtags'],
    queryFn: async () => {
      const response = await apiClient.get('/hashtags/');
      return response.data as Array<{ name: string }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate suggestions based on input
  useEffect(() => {
    if (!inputValue.trim() || !allHashtags) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allHashtags
      .map(hashtag => hashtag.name)
      .filter(name => 
        name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(name)
      )
      .slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [inputValue, allHashtags, value]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addHashtag = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
    const normalizedHashtag = cleanHashtag.toLowerCase().replace(/\s+/g, '');
    
    if (normalizedHashtag && !value.includes(normalizedHashtag) && value.length < maxHashtags) {
      onChange([...value, normalizedHashtag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeHashtag = (index: number) => {
    const newHashtags = value.filter((_, i) => i !== index);
    onChange(newHashtags);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const hashtag = inputValue.trim();
      if (hashtag) {
        addHashtag(hashtag);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeHashtag(value.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addHashtag(suggestion);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
        {/* Existing hashtags */}
        {value.map((hashtag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1"
          >
            <Hash className="h-3 w-3" />
            {hashtag}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeHashtag(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {/* Input field */}
        {value.length < maxHashtags && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0"
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">#{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {value.length >= maxHashtags && (
        <p className="text-xs text-muted-foreground mt-1">
          Maximum Anzahl von Hashtags erreicht ({maxHashtags})
        </p>
      )}
    </div>
  );
};

export default HashtagInput; 