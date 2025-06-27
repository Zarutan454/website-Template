
import React from 'react';
import { SmileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { Theme as EmojiPickerTheme } from 'emoji-picker-react';
import { cn } from '@/lib/utils';

interface EmojiPickerButtonProps {
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  onEmojiSelect: (emojiData: { emoji: string }) => void;
  isDarkMode: boolean;
}

const EmojiPickerButton: React.FC<EmojiPickerButtonProps> = ({
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiSelect,
  isDarkMode
}) => {
  const emojiPickerTheme: EmojiPickerTheme = isDarkMode ? EmojiPickerTheme.DARK : EmojiPickerTheme.LIGHT;

  return (
    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full",
            isDarkMode 
              ? "text-gray-400 hover:text-primary-400 hover:bg-dark-200" 
              : "text-gray-600 hover:text-primary-500 hover:bg-gray-100"
          )}
          aria-label="Emoji hinzufügen"
        >
          <SmileIcon size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 border-0" 
        align="start" 
        sideOffset={5}
      >
        <EmojiPicker
          onEmojiClick={onEmojiSelect}
          searchDisabled={false}
          width={320}
          height={400}
          previewConfig={{
            showPreview: false
          }}
          theme={emojiPickerTheme}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPickerButton;
