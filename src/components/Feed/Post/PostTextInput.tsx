
import React, { useRef, useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import HashtagSearch from './HashtagSearch';

interface PostTextInputProps {
  content: string;
  setContent: (content: string) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  isFocused: boolean;
  isDarkMode: boolean;
  theme: string;
  placeholder: string;
  showHashtagPopover: boolean;
  setShowHashtagPopover: (show: boolean) => void;
  isSearchingHashtags: boolean;
  hashtagSearchResults: any[];
  insertHashtag: (tag: string) => void;
  setCursorPosition: (position: number | null) => void;
}

const PostTextInput: React.FC<PostTextInputProps> = ({
  content,
  setContent,
  handleFocus,
  handleBlur,
  isFocused,
  isDarkMode,
  theme,
  placeholder,
  showHashtagPopover,
  setShowHashtagPopover,
  isSearchingHashtags,
  hashtagSearchResults,
  insertHashtag,
  setCursorPosition,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      
      const cursorPos = textareaRef.current.selectionStart;
      setCursorPosition(cursorPos);
      
      const textUntilCursor = newContent.substring(0, cursorPos);
      const lastHashIndex = textUntilCursor.lastIndexOf('#');
      
      if (lastHashIndex >= 0) {
        const searchTerm = textUntilCursor.substring(lastHashIndex + 1);
        
        if (!searchTerm.includes(' ')) {
          setShowHashtagPopover(true);
        } else {
          setShowHashtagPopover(false);
        }
      } else {
        setShowHashtagPopover(false);
      }
    }
  };

  return (
    <HashtagSearch
      showPopover={showHashtagPopover}
      setShowPopover={setShowHashtagPopover}
      isSearching={isSearchingHashtags}
      searchResults={hashtagSearchResults}
      onSelectHashtag={insertHashtag}
    >
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "w-full resize-none border-0 focus:ring-0 p-0 min-h-[42px] transition-all duration-200",
          isDarkMode 
            ? "bg-transparent text-gray-300 placeholder-gray-500 focus:placeholder-gray-400" 
            : "bg-transparent text-gray-700 placeholder-gray-500 focus:placeholder-gray-600",
          isFocused ? "text-base" : "text-sm"
        )}
        data-theme={theme}
      />
    </HashtagSearch>
  );
};

export default PostTextInput;
