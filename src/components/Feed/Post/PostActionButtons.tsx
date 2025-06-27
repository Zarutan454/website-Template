
import React from 'react';
import { ImageIcon, FileVideo, SmileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EmojiPickerButton from './EmojiPickerButton';

interface PostActionButtonsProps {
  isDarkMode: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  onEmojiSelect: (emojiData: { emoji: string }) => void;
  onAttachmentClick: () => void;
  theme: string;
}

const PostActionButtons: React.FC<PostActionButtonsProps> = ({
  isDarkMode,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiSelect,
  onAttachmentClick,
  theme
}) => {
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full",
          isDarkMode 
            ? "text-gray-400 hover:text-primary-400 hover:bg-dark-200" 
            : "text-gray-600 hover:text-primary-500 hover:bg-gray-100"
        )}
        onClick={onAttachmentClick}
        aria-label="Bild hinzufügen"
        data-theme={theme}
      >
        <ImageIcon size={18} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full",
          isDarkMode 
            ? "text-gray-400 hover:text-primary-400 hover:bg-dark-200" 
            : "text-gray-600 hover:text-primary-500 hover:bg-gray-100"
        )}
        onClick={onAttachmentClick}
        aria-label="Video hinzufügen"
        data-theme={theme}
      >
        <FileVideo size={18} />
      </Button>
      <EmojiPickerButton
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        onEmojiSelect={onEmojiSelect}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default PostActionButtons;
