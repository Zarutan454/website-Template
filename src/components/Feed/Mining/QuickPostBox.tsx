
import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QuickPostBoxProps {
  handleMiningAction: (actionType: string, points: number, tokens: number) => Promise<any>;
  isPerformingAction: string | null;
}

const QuickPostBox: React.FC<QuickPostBoxProps> = ({
  handleMiningAction,
  isPerformingAction
}) => {
  const [postContent, setPostContent] = useState('');
  const isSubmitting = isPerformingAction === 'post';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postContent || postContent.trim().length < 3 || isSubmitting) return;
    
    try {
      await handleMiningAction('post', 20, 2.0);
      setPostContent('');
    } catch (error) {
    }
  };

  return (
    <div className="p-3 border-t border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="text-xs text-gray-400 mb-1">Schneller Beitrag (+2 BSN)</div>
        <Textarea
          placeholder="Was gibt's Neues?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="resize-none h-20 bg-dark-200 border-gray-700"
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || postContent.trim().length < 3}
          className="w-full"
          size="sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gesendet...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Senden
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default QuickPostBox;
