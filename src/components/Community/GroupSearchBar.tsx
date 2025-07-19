
import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

interface GroupSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const GroupSearchBar: React.FC<GroupSearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery,
  placeholder = "Gruppen durchsuchen...",
  className = ""
}) => {
  const { theme } = useTheme();
  const [localQuery, setLocalQuery] = React.useState(searchQuery);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounce search query updates
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  // Sync with external search query changes
  React.useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search 
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          } ${isFocused ? 'text-primary-500' : ''}`}
          size={20}
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          className={`pl-10 pr-12 h-12 text-base ${
            theme === 'dark' ? 'bg-dark-100 border-gray-800' : 'bg-gray-100 border-gray-300'
          } ${isFocused ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          aria-label="Gruppen durchsuchen"
          role="searchbox"
        />
        
        {/* Clear button */}
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleClear}
            aria-label="Suche löschen"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Mobile search suggestions */}
      {isFocused && localQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2 text-sm text-muted-foreground">
            Tippe Enter um zu suchen
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSearchBar;
