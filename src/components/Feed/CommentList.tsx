import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/django-api-new';
import { Heart, MessageCircle, MoreHorizontal, ThumbsUp } from 'lucide-react';
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

interface CommentListProps {
  postId: number;
  onCommentCountChange?: (count: number) => void;
  className?: string;
}

const CommentList: React.FC<CommentListProps> = ({
  postId,
  onCommentCountChange,
  className = ""
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/posts/${postId}/comments/`);
      setComments(response.data.results || response.data);
      onCommentCountChange?.(response.data.results?.length || response.data.length || 0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Laden der Kommentare';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleLikeComment = async (commentId: number) => {
    try {
      await apiClient.post(`/api/comments/${commentId}/like/`);
      
      // Update local state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? {
                ...comment,
                is_liked_by_user: !comment.is_liked_by_user,
                likes_count: comment.is_liked_by_user 
                  ? comment.likes_count - 1 
                  : comment.likes_count + 1
              }
            : comment
        )
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Liken des Kommentars';
      toast.error(errorMessage);
    }
  };

  const handleCommentAdded = () => {
    fetchComments();
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

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Noch keine Kommentare</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {displayedComments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage 
              src={comment.author.avatar_url || "/placeholder-avatar.jpg"} 
              alt={comment.author.username}
            />
            <AvatarFallback>
              {comment.author.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {comment.author.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm text-foreground mb-2">
                {comment.content}
              </p>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment.id)}
                  className={`h-6 px-2 text-xs ${
                    comment.is_liked_by_user 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart className={`h-3 w-3 mr-1 ${
                    comment.is_liked_by_user ? 'fill-current' : ''
                  }`} />
                  {comment.likes_count > 0 && comment.likes_count}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Antworten
                </Button>
              </div>
            </div>
            
            {/* Nested Comments */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-2 space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex space-x-2">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage 
                        src={reply.author.avatar_url || "/placeholder-avatar.jpg"} 
                        alt={reply.author.username}
                      />
                      <AvatarFallback>
                        {reply.author.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/30 rounded-lg p-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-xs">
                            {reply.author.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-foreground">
                          {reply.content}
                        </p>
                        
                        <div className="flex items-center space-x-3 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikeComment(reply.id)}
                            className={`h-5 px-1 text-xs ${
                              reply.is_liked_by_user 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Heart className={`h-2 w-2 mr-1 ${
                              reply.is_liked_by_user ? 'fill-current' : ''
                            }`} />
                            {reply.likes_count > 0 && reply.likes_count}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {hasMoreComments && !showAllComments && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllComments(true)}
          className="text-primary hover:text-primary/80"
        >
          Alle {comments.length} Kommentare anzeigen
        </Button>
      )}
      
      {showAllComments && hasMoreComments && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllComments(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          Weniger anzeigen
        </Button>
      )}
    </div>
  );
};

export default CommentList; 