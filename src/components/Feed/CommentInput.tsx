import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { apiClient } from '@/lib/django-api-new';
import { Send, Smile } from 'lucide-react';

interface CommentInputProps {
  postId: number;
  onCommentAdded: () => void;
  placeholder?: string;
  className?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  onCommentAdded,
  placeholder = "Schreibe einen Kommentar...",
  className = ""
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Bitte gib einen Kommentar ein');
      return;
    }

    if (content.length > 1000) {
      toast.error('Kommentar ist zu lang (max. 1000 Zeichen)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post(`/api/posts/${postId}/comments/create/`, {
        content: content.trim()
      });

      if (response.status === 201) {
        setContent('');
        toast.success('Kommentar erfolgreich hinzugefügt');
        onCommentAdded();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 
                          'Fehler beim Hinzufügen des Kommentars';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const remainingChars = 1000 - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className={`flex items-start space-x-3 p-4 border-t ${className}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src="/placeholder-avatar.jpg" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={`min-h-[60px] resize-none pr-12 ${
                isFocused ? 'ring-2 ring-primary' : ''
              } ${isOverLimit ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            
            <div className="absolute bottom-2 right-2 flex items-center space-x-2">
              {remainingChars <= 100 && (
                <span className={`text-xs ${
                  isOverLimit ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {remainingChars}
                </span>
              )}
              
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !content.trim() || isOverLimit}
                className="h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isOverLimit && (
            <p className="text-xs text-red-500">
              Kommentar ist zu lang. Bitte kürze ihn auf maximal 1000 Zeichen.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CommentInput; 