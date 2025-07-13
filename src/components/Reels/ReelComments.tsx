import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useReels, ReelComment } from '../../hooks/useReels';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface ReelCommentsProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReelComments: React.FC<ReelCommentsProps> = ({ reelId, isOpen, onClose }) => {
  const [comment, setComment] = useState('');
  const { getReelComments, commentOnReel, formatTimeSince } = useReels();
  const { user: profile } = useAuth();
  
  const { data: comments, isLoading } = useQuery({
    queryKey: ['reel-comments', reelId],
    queryFn: () => getReelComments(reelId),
    enabled: isOpen
  });
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !profile) return;
    
    try {
      await commentOnReel.mutateAsync({ reelId, content: comment });
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute inset-0 bg-background z-10 flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
          <h2 className="text-xl font-semibold">Kommentare</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment: ReelComment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.avatar_url || ''} alt={comment.user?.display_name || comment.user?.username || ''} />
                    <AvatarFallback>{comment.user?.display_name?.[0] || comment.user?.username?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {comment.user?.display_name || comment.user?.username || 'Unbekannter Nutzer'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeSince(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Noch keine Kommentare. Sei der Erste!
            </div>
          )}
        </div>
        
        {profile && (
          <form 
            onSubmit={handleSubmitComment}
            className="p-4 border-t sticky bottom-0 bg-background flex gap-2"
          >
            <Input
              placeholder="Kommentar hinzufügen..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1"
              maxLength={500}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!comment.trim() || commentOnReel.isPending}
            >
              {commentOnReel.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ReelComments;
