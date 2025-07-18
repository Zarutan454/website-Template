import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { apiClient } from '@/lib/django-api-new';
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  likes_count: number;
  is_liked_by_user: boolean;
  replies?: Comment[];
}

interface NestedCommentsProps {
  comment: Comment;
  postId: number;
  onCommentAdded: () => void;
  depth?: number;
}

const NestedComments: React.FC<NestedCommentsProps> = ({
  comment,
  postId,
  onCommentAdded,
  depth = 0
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);

  const maxDepth = 3; // Maximum nesting depth
  const canReply = depth < maxDepth;

  const handleLikeComment = async (commentId: number) => {
    try {
      await apiClient.post(`/api/comments/${commentId}/like/`);
      
      // Update local state
      setReplies(prevReplies => 
        prevReplies.map(reply => 
          reply.id === commentId 
            ? {
                ...reply,
                is_liked_by_user: !reply.is_liked_by_user,
                likes_count: reply.is_liked_by_user 
                  ? reply.likes_count - 1 
                  : reply.likes_count + 1
              }
            : reply
        )
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Liken des Kommentars';
      toast.error(errorMessage);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error('Bitte gib eine Antwort ein');
      return;
    }

    if (replyContent.length > 500) {
      toast.error('Antwort ist zu lang (max. 500 Zeichen)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post(`/api/comments/${comment.id}/replies/`, {
        content: replyContent.trim(),
        parent_comment: comment.id
      });

      if (response.status === 201) {
        setReplyContent('');
        setShowReplyInput(false);
        toast.success('Antwort erfolgreich hinzugefügt');
        onCommentAdded();
        
        // Add new reply to local state
        setReplies(prevReplies => [response.data, ...prevReplies]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Hinzufügen der Antwort';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply(e);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: de 
      });
    } catch {
      return 'vor kurzem';
    }
  };

  const remainingChars = 500 - replyContent.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex space-x-2">
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage 
            src={comment.author.avatar_url || "/placeholder-avatar.jpg"} 
            alt={comment.author.username}
          />
          <AvatarFallback>
            {comment.author.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-xs">
                {comment.author.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            <p className="text-xs text-foreground mb-2">
              {comment.content}
            </p>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikeComment(comment.id)}
                className={`h-5 px-1 text-xs ${
                  comment.is_liked_by_user 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageCircle className="h-2 w-2 mr-1" />
                {comment.likes_count > 0 && comment.likes_count}
              </Button>
              
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Antworten
                </Button>
              )}
              
              {replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showReplies ? (
                    <ChevronUp className="h-2 w-2 mr-1" />
                  ) : (
                    <ChevronDown className="h-2 w-2 mr-1" />
                  )}
                  {replies.length} Antwort{replies.length !== 1 ? 'en' : ''}
                </Button>
              )}
            </div>
          </div>
          
          {/* Reply Input */}
          {showReplyInput && canReply && (
            <div className="mt-2 ml-4">
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <div className="relative">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Antworte auf ${comment.author.username}...`}
                    className={`min-h-[40px] resize-none pr-12 text-xs ${
                      isOverLimit ? 'border-red-500' : ''
                    }`}
                    disabled={isSubmitting}
                  />
                  
                  <div className="absolute bottom-1 right-1">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting || !replyContent.trim() || isOverLimit}
                      className="h-6 w-6 p-0"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {isOverLimit && (
                  <p className="text-xs text-red-500">
                    Antwort ist zu lang. Bitte kürze sie auf maximal 500 Zeichen.
                  </p>
                )}
              </form>
            </div>
          )}
          
          {/* Nested Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-2 ml-4 space-y-2">
              {replies.map((reply) => (
                <NestedComments
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onCommentAdded={onCommentAdded}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NestedComments; 