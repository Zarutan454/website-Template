
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { timeAgo } from '@/utils/timeAgo';
import { Send, MessageSquare } from 'lucide-react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

interface CommentsProps {
  comments: any[];
  postId: string;
  onComment: (postId: string, content: string) => Promise<any>;
  currentUserId?: string;
  isLoading?: boolean;
}

const Comments: React.FC<CommentsProps> = ({
  comments,
  postId,
  onComment,
  currentUserId,
  isLoading = false
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComment(postId, newComment);
      setNewComment('');
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" text="Kommentare werden geladen..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Kommentare anzeigen */}
      <div className="space-y-3">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="flex items-start space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800/20 rounded-md transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={comment.author?.avatar_url || ''} 
                  alt={comment.author?.display_name || comment.author?.username || 'User'} 
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {(comment.author?.display_name || comment.author?.username || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {comment.author?.display_name || comment.author?.username || 'Unbekannter Benutzer'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timeAgo(comment.created_at)}
                  </div>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="Noch keine Kommentare"
            description="Sei der Erste, der einen Kommentar hinterlässt!"
            icon={<MessageSquare className="h-10 w-10" />}
            className="py-4 bg-transparent"
          />
        )}
      </div>

      {/* Kommentar-Formular */}
      <form onSubmit={handleSubmitComment} className="flex items-center space-x-2 mt-2">
        <Input
          placeholder="Kommentar schreiben..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-primary/20"
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={!newComment.trim() || isSubmitting}
          variant="default"
          className="gap-1"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {!isSubmitting && "Senden"}
        </Button>
      </form>
    </div>
  );
};

export default Comments;
