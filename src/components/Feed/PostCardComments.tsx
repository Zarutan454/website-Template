import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart } from 'lucide-react';
import { timeAgo } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { useComments } from '@/hooks/post/useComments';
import { useAuth } from '@/context/AuthContext.utils';

interface PostCardCommentsProps {
  postId: string;
  darkMode?: boolean;
  onCommentCountChange?: (count: number) => void;
}

interface User {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

const MIN_COMMENT_LENGTH = 3;

const PostCardComments: React.FC<PostCardCommentsProps> = ({
  postId,
  darkMode = true,
  onCommentCountChange
}) => {
  const [commentText, setCommentText] = useState('');
  const { user: profile } = useAuth();
  
  // Konvertiere postId zu Number für useComments
  const numericPostId = parseInt(postId);
  
  const {
    comments,
    loading,
    error,
    createComment,
    likeComment,
    refresh
  } = useComments(numericPostId);

  // Benachrichtige Parent-Komponente über Änderungen der Kommentar-Anzahl
  useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(comments.length);
    }
  }, [comments.length, onCommentCountChange]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedComment = commentText.trim();
    if (trimmedComment.length < MIN_COMMENT_LENGTH || !profile) {
      if (!profile) {
        toast.error('Du musst angemeldet sein, um zu kommentieren');
      } else {
        toast.error(`Der Kommentar muss mindestens ${MIN_COMMENT_LENGTH} Zeichen lang sein.`);
      }
      return;
    }

    try {
      const success = await createComment(trimmedComment);
      if (success) {
        setCommentText('');
        toast.success('Kommentar veröffentlicht');
      } else {
        toast.error('Fehler beim Veröffentlichen des Kommentars');
      }
    } catch (error) {
      toast.error('Fehler beim Veröffentlichen des Kommentars');
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!profile) {
      toast.error('Du musst angemeldet sein, um zu liken');
      return;
    }
    
    try {
      await likeComment(commentId);
    } catch (error) {
      toast.error('Fehler beim Liken des Kommentars');
    }
  };

  const renderAvatar = (user: User | undefined) => (
    user?.avatar_url ? (
      <img
        src={user.avatar_url}
        alt={user.display_name || user.username || 'User'}
        className="w-full h-full rounded-full object-cover"
      />
    ) : (
      (user?.display_name || user?.username || 'U').charAt(0)
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-2"
    >
      {/* Comment Form */}
      {profile && (
        <form onSubmit={handleCommentSubmit} className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold mr-2">
            {renderAvatar(profile)}
          </div>
          <input
            type="text"
            placeholder="Schreibe einen Kommentar..."
            className={`flex-1 ${darkMode ? 'bg-dark-200 text-white' : 'bg-gray-100 text-gray-900'} rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className={`ml-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'} disabled:opacity-50`}
            disabled={!commentText.trim() || loading}
            aria-label="Kommentar senden"
          >
            <Send size={18} />
          </button>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}

      {/* Comments List */}
      <AnimatePresence>
        {loading ? (
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center text-sm py-2`}>
            Kommentare werden geladen...
          </div>
        ) : comments.length === 0 ? (
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center text-sm py-2`}>
            Noch keine Kommentare. Sei der Erste!
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto p-1">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${darkMode ? 'bg-dark-200/50' : 'bg-gray-50'} rounded-lg p-3`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                  {renderAvatar(comment.author)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {comment.author?.username || 'Unbekannter Nutzer'}
                      </h4>
                      <p className="text-xs text-gray-400">{timeAgo(new Date(comment.created_at))}</p>
                    </div>
                  </div>
                  
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {comment.content}
                  </p>
                  
                  <div className="mt-2 flex items-center">
                    <button
                      className={`flex items-center text-xs ${comment.is_liked ? 'text-pink-500' : darkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-pink-500`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <Heart size={14} className={comment.is_liked ? 'fill-current' : ''} />
                      <span className="ml-1">{comment.likes_count || 0}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCardComments;

