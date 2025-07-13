
import React from 'react';
import { Hash } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface HashtagResult {
  id: string;
  name: string;
  post_count: number;
}

interface HashtagSearchProps {
  showPopover: boolean;
  setShowPopover: (show: boolean) => void;
  isSearching: boolean;
  searchResults: HashtagResult[];
  onSelectHashtag: (tag: string) => void;
  children: React.ReactNode;
}

const HashtagSearch: React.FC<HashtagSearchProps> = ({
  showPopover,
  setShowPopover,
  isSearching,
  searchResults,
  onSelectHashtag,
  children
}) => {
  return (
    <Popover open={showPopover && searchResults.length > 0} onOpenChange={setShowPopover}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-72" 
        align="start"
        sideOffset={5}
      >
        <Command>
          <CommandList>
            <CommandGroup heading="Hashtags">
              {isSearching ? (
                <CommandItem disabled>Suche...</CommandItem>
              ) : searchResults.length > 0 ? (
                searchResults.map(tag => (
                  <CommandItem 
                    key={tag.id} 
                    onSelect={() => onSelectHashtag(tag.name)}
                    className="flex items-center gap-2"
                  >
                    <Hash size={14} className="text-primary-500" />
                    <span>{tag.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{tag.post_count} Posts</span>
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled>Keine Hashtags gefunden</CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default HashtagSearch;
