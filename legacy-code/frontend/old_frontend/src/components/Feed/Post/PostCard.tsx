import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeAgo } from '@/utils/timeAgo';
import { Heart, MessageSquare, Share, Flag, Bell, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCommentSection } from '@/hooks/comments/useCommentSection';
import { useProfile } from '@/hooks/useProfile';
import PostInteractionButton from './PostInteractionButton';
import PostDropdownMenu from './PostDropdownMenu';
import PostCommentSection from './PostCommentSection';
import { useMining } from '@/hooks/useMining';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';
import YouTubeEmbed from '../YouTubeEmbed';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface PostCardProps {
  post: any;
  onLike: () => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  onComment: (content: string) => Promise<any>;
  onGetComments: () => Promise<any[]>;
  onShare: () => Promise<boolean>;
  onReport?: (reason: string) => Promise<boolean>;
  onToggleNotifications?: () => Promise<boolean>;
  hasNotifications?: boolean;
  darkMode?: boolean;
  currentUserId?: string;
  currentUser?: any;
  showMiningRewards?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onToggleNotifications,
  hasNotifications = false,
  darkMode = true,
  currentUserId,
  currentUser,
  showMiningRewards = false
}) => {
  const [liked, setLiked] = useState<boolean>(post.isLiked || post.is_liked || false);
  const [likeCount, setLikeCount] = useState<number>(post.likesCount || post.likes_count || 0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { recordActivity, isMining } = useMining();
  
  // Comment section logic
  const {
    comments,
    isLoadingComments,
    commentContent,
    showComments,
    setCommentContent,
    toggleComments,
    handleSubmitComment,
    fetchComments
  } = useCommentSection(post.id, () => onGetComments(), onComment);
  
  // Format date properly
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd. MMM yyyy, HH:mm', { locale: de });
    } catch (error) {
      return formatTimeAgo(new Date());
    }
  };
  
  // Extract YouTube video ID if present
  useEffect(() => {
    if (post?.content) {
      const videoId = extractYoutubeVideoId(post.content);
      if (videoId) {
        console.log(`Found YouTube video ID: ${videoId} in post ${post.id}`);
        setYoutubeVideoId(videoId);
      }
    }
  }, [post?.content, post?.id]);
  
  // Update like status when post data changes
  useEffect(() => {
    setLiked(post.isLiked || post.is_liked || false);
    setLikeCount(post.likesCount || post.likes_count || 0);
  }, [post.isLiked, post.is_liked, post.likesCount, post.likes_count]);
  
  // Handle like click with animation and backend update
  const handleLikeClick = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Optimistically update UI
      const newLikedState = !liked;
      const newLikeCount = liked ? likeCount - 1 : likeCount + 1;
      
      setLiked(newLikedState);
      setLikeCount(newLikeCount);
      
      if (newLikedState) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 1000);
      }
      
      // Call backend
      const success = await onLike();
      
      // If backend call fails, revert optimistic updates
      if (!success) {
        setLiked(liked);
        setLikeCount(likeCount);
        toast.error("Beim Liken ist ein Fehler aufgetreten");
      } else if (success && newLikedState && showMiningRewards && isMining) {
        // Record mining activity for successful like
        try {
          await recordActivity('like');
          toast.success("Mining-Geschwindigkeit erhöht für das Liken", {
            icon: "🚀",
          });
        } catch (error) {
          console.error("Error recording activity:", error);
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert optimistic updates on error
      setLiked(liked);
      setLikeCount(likeCount);
      toast.error("Beim Liken ist ein Fehler aufgetreten");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle share with mining rewards
  const handleShareClick = async () => {
    try {
      const success = await onShare();
      
      if (success) {
        if (showMiningRewards && isMining) {
          try {
            await recordActivity('share');
            toast.success("Mining-Geschwindigkeit erhöht für das Teilen", {
              icon: "🚀",
            });
          } catch (error) {
            console.error("Error recording share activity:", error);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Beim Teilen ist ein Fehler aufgetreten");
      return false;
    }
  };
  
  // Handle notification toggle
  const handleNotificationToggle = async () => {
    if (!onToggleNotifications) return false;
    
    try {
      return await onToggleNotifications();
    } catch (error) {
      console.error("Error toggling notification:", error);
      toast.error("Fehler beim Aktualisieren der Benachrichtigungseinstellungen");
      return false;
    }
  };
  
  // Click handler for user profile navigation
  const handleUserClick = () => {
    if (post.user?.username) {
      navigate(`/profile/${post.user.username}`);
    }
  };

  return (
    <TooltipProvider>
      <Card className={`w-full border ${darkMode ? 'border-gray-800' : 'border-gray-200'} rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-dark-200' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-start gap-4 p-4 pb-3">
          <Avatar 
            className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all" 
            onClick={handleUserClick}
          >
            {post.user?.avatar_url ? (
              <AvatarImage src={post.user.avatar_url} />
            ) : null}
            <AvatarFallback className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {post.user?.display_name?.charAt(0) || post.user?.username?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-1">
                  <h4 
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={handleUserClick}
                  >
                    {post.user?.display_name || post.user?.username || 'Anonymous'}
                  </h4>
                  {post.user?.is_verified && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                
                <span className="text-xs text-gray-400">
                  {formatDate(post.created_at || post.createdAt)}
                </span>
              </div>
              
              {currentUserId && post.user?.id === currentUserId && (
                <PostDropdownMenu onDelete={onDelete} postId={post.id} />
              )}
            </div>
            
            <p className="text-sm whitespace-pre-line break-words leading-relaxed">{post.content}</p>
            
            {youtubeVideoId && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <YouTubeEmbed
                  videoId={youtubeVideoId}
                  className="w-full rounded-lg overflow-hidden"
                  height={315}
                  title={`YouTube Video von ${post.user?.display_name || post.user?.username}`}
                />
              </div>
            )}
            
            {post.mediaUrl && !youtubeVideoId && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-full h-auto object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardFooter className="p-3 pt-0 flex flex-col">
          <div className="flex justify-between items-center w-full mb-1">
            <div className="flex items-center text-xs text-gray-400 gap-3">
              <span>{likeCount} Likes</span>
              <span>{post.commentsCount || post.comments_count || 0} Kommentare</span>
            </div>
          </div>
          
          <Separator className={`my-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          
          <div className="flex justify-between items-center w-full px-1 py-1">
            <div className="flex space-x-2">
              <PostInteractionButton
                icon={<Heart size={18} className={liked ? "fill-current text-red-500" : ""} />}
                activeIcon={<Heart size={18} className="fill-current text-red-500" />}
                label="Like"
                isActive={liked}
                isLoading={isProcessing}
                onClick={handleLikeClick}
                tooltip="Beitrag liken"
                showAnimation={showAnimation}
                className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-md px-3`}
              />
              
              <PostInteractionButton
                icon={<MessageSquare size={18} />}
                label="Kommentieren"
                isActive={showComments}
                onClick={toggleComments}
                tooltip="Kommentare anzeigen"
                className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-md px-3`}
              />
              
              <PostInteractionButton
                icon={<Share size={18} />}
                label="Teilen"
                onClick={handleShareClick}
                tooltip="Beitrag teilen"
                className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-md px-3`}
              />
            </div>
            
            <div className="flex space-x-1">
              {onToggleNotifications && (
                <PostInteractionButton
                  icon={<Bell size={18} />}
                  activeIcon={<Bell size={18} className="fill-current text-primary" />}
                  label=""
                  isActive={hasNotifications}
                  onClick={handleNotificationToggle}
                  tooltip={hasNotifications ? "Benachrichtigungen deaktivieren" : "Benachrichtigungen aktivieren"}
                  variant="ghost"
                  className="w-8 h-8 p-0 rounded-full"
                />
              )}
              
              {onReport && currentUserId !== post.user?.id && (
                <PostInteractionButton
                  icon={<Flag size={18} />}
                  label=""
                  onClick={() => onReport("inappropriate")}
                  tooltip="Beitrag melden"
                  variant="ghost"
                  className="w-8 h-8 p-0 rounded-full"
                />
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="w-full mt-2"
              >
                <Separator className={`mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <PostCommentSection
                  comments={comments}
                  isLoading={isLoadingComments}
                  commentContent={commentContent}
                  setCommentContent={setCommentContent}
                  onCommentSubmit={handleSubmitComment}
                  currentUser={currentUser || { id: currentUserId }}
                  darkMode={darkMode}
                  onLoadComments={() => {
                    return fetchComments();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default PostCard;
