import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatTimeAgo } from '@/utils/timeAgo';
import { Heart, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CommentAuthor {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  role?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author?: CommentAuthor;
  user?: CommentAuthor;
  user_liked?: boolean;
  like_count?: number;
}

interface UserData {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  role?: string;
}

interface PostCommentSectionProps {
  comments: Comment[];
  isLoading: boolean;
  commentContent: string;
  setCommentContent: (content: string) => void;
  onCommentSubmit: () => void;
  currentUser: UserData | null;
  darkMode?: boolean;
  onLoadComments?: () => Promise<Comment[]>;
  onDeleteComment?: (commentId: string) => Promise<boolean>;
  onLikeComment?: (commentId: string) => Promise<boolean>;
}

const PostCommentSection: React.FC<PostCommentSectionProps> = ({
  comments,
  isLoading,
  commentContent,
  setCommentContent,
  onCommentSubmit,
  currentUser,
  darkMode = true,
  onLoadComments,
  onDeleteComment,
  onLikeComment
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentContent.trim().length > 0) {
      e.preventDefault();
      onCommentSubmit();
    }
  };
  
  // Format date properly
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Verwende ein gut lesbares Format für Kommentare
      return format(date, 'dd.MM.yyyy, HH:mm', { locale: de });
    } catch (error) {
      return formatTimeAgo(new Date());
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Comment Input */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          {currentUser?.avatar_url ? (
            <AvatarImage src={currentUser.avatar_url} />
          ) : (
            <AvatarFallback className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {currentUser?.display_name?.charAt(0) || currentUser?.username?.charAt(0) || '?'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schreibe einen Kommentar..."
            className={`flex-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-full text-sm`}
          />
          
          <Button
            onClick={onCommentSubmit}
            disabled={!commentContent.trim() || isLoading}
            size="sm"
            className="rounded-full px-4"
          >
            Senden
          </Button>
        </div>
      </div>
      
      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner size="md" />
        </div>
      ) : comments.length === 0 ? (
        <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Noch keine Kommentare. Sei der Erste!
        </div>
      ) : (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          <AnimatePresence>
            {comments.filter(comment => comment && comment.author).map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-lg`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {comment.user?.avatar_url || comment.author?.avatar_url ? (
                    <AvatarImage src={comment.user?.avatar_url || comment.author?.avatar_url} />
                  ) : (
                    <AvatarFallback className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      {(comment.user?.display_name || comment.author?.display_name || comment.user?.username || comment.author?.username || '?').charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-sm">
                        {comment.user?.display_name || comment.author?.display_name || comment.user?.username || comment.author?.username || 'Anonymous'}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        {formatDate(comment.created_at || comment.createdAt)}
                      </span>
                    </div>
                    
                    <TooltipProvider>
                      {onDeleteComment && (currentUser?.id === comment.user?.id || currentUser?.id === comment.author_id) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-red-500"
                              onClick={() => onDeleteComment(comment.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Kommentar löschen</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </div>
                  
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${comment.user_liked ? 'text-red-500' : 'text-gray-400'}`}
                      onClick={() => onLikeComment && onLikeComment(comment.id)}
                    >
                      <Heart size={14} className={comment.user_liked ? "fill-current" : ""} />
                    </Button>
                    <span className="text-xs text-gray-400">{comment.like_count || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PostCommentSection;
