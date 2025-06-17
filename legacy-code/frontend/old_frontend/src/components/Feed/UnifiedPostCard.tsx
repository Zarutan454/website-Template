import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from '@/utils/timeAgo';
import { useNavigate } from 'react-router-dom';
import { useMining } from '@/hooks/useMining';
import { toast } from 'sonner';
import PostContent from './Post/PostContent';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';

export interface UnifiedPostCardProps {
  post: any;
  onLike: () => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  onComment: (content: string) => Promise<any>;
  onGetComments: () => Promise<any[]>;
  onShare: () => Promise<boolean>;
  onReport?: (reason: string) => Promise<boolean>;
  onDeleteComment?: (commentId: string) => Promise<boolean>;
  darkMode?: boolean;
  currentUserId?: string;
  currentUser?: any;
  showMiningRewards?: boolean;
}

const UnifiedPostCard: React.FC<UnifiedPostCardProps> = ({
  post,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onDeleteComment,
  darkMode = true,
  currentUserId,
  currentUser,
  showMiningRewards = false
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const navigate = useNavigate();
  const { recordActivity, isMining } = useMining();
  
  const formattedTimeAgo = timeAgo(post.created_at);
  const isCurrentUserAuthor = currentUserId === post.author.id || currentUserId === post.author_id;

  const toggleComments = async () => {
    if (!showComments) {
      setIsLoadingComments(true);
      try {
        const fetchedComments = await onGetComments();
        setComments(fetchedComments);
      } catch (error) {
        toast.error("Kommentare konnten nicht geladen werden");
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      
      const likeResult = await onLike();
      
      if (likeResult && !isLiked && showMiningRewards && isMining) {
        try {
          await recordActivity('like', 5, 0.5);
          toast.success("👍 +5 Punkte für deinen Like!");
        } catch (error) {
          console.error("Error recording mining activity:", error);
        }
      }
      
      if (!likeResult) {
        setIsLiked(isLiked);
        setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        toast.error("Beim Liken ist ein Fehler aufgetreten");
      }
    } catch (error) {
      console.error("Fehler beim Liken:", error);
      setIsLiked(isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleUserClick = () => {
    if (post.author?.username) {
      navigate(`/profile/${post.author.username}`);
    }
  };

  return (
    <Card className={`border-0 shadow-sm ${darkMode ? 'bg-dark-100' : 'bg-white/80'}`}>
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-start">
          <Avatar className="mr-3 h-10 w-10 cursor-pointer" onClick={handleUserClick}>
            <AvatarImage src={post.author?.avatar_url || ''} alt={post.author?.display_name || post.author?.username} />
            <AvatarFallback>{post.author?.display_name?.charAt(0) || post.author?.username?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <div className="text-sm font-medium leading-none cursor-pointer hover:underline" onClick={handleUserClick}>
                  {post.author?.display_name || post.author?.username || 'Anonymous'}
                </div>
                <div className="text-sm text-gray-400">
                  <span>@{post.author?.username}</span>
                  <span className="mx-1">•</span>
                  <span>{formattedTimeAgo}</span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isCurrentUserAuthor ? (
                    <>
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-red-500 focus:text-red-500"
                      >
                        Beitrag löschen
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => onReport && onReport('inappropriate')}>
                      <Flag className="h-4 w-4 mr-2" />
                      Beitrag melden
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-0">
        <PostContent post={post} darkMode={darkMode} />
      </CardContent>
      
      <CardFooter className="flex flex-col px-4 pt-0 pb-2">
        <div className="w-full flex justify-between items-center mt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <span className="text-sm text-gray-400">{likeCount}</span>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 ml-2"
              onClick={toggleComments}
              disabled={isLoadingComments}
            >
              <MessageCircle className={`h-5 w-5 ${showComments ? 'text-primary' : ''}`} />
            </Button>
            <span className="text-sm text-gray-400">{post.comments_count || 0}</span>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 ml-2"
              onClick={onShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {showComments && (
          <>
            <Separator className="my-3" />
            <div className="space-y-4">
              {isLoadingComments ? (
                <div className="text-center py-2">Kommentare werden geladen...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-2 text-gray-400">Keine Kommentare vorhanden</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatar_url} alt={comment.user?.username} />
                      <AvatarFallback>{comment.user?.username?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="font-medium text-sm">{comment.user?.display_name || comment.user?.username}</span>
                          <span className="ml-2 text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                        </div>
                        {onDeleteComment && comment.user?.id === currentUserId && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => onDeleteComment(comment.id)}
                          >
                            <span className="sr-only">Löschen</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                          </Button>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
              
              <div className="flex space-x-2 mt-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.username} />
                  <AvatarFallback>{currentUser?.username?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex">
                  <input 
                    type="text" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Kommentar schreiben..." 
                    className="flex-1 bg-transparent border-b border-gray-700 focus:outline-none focus:border-primary"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (newComment.trim()) {
                        onComment(newComment)
                          .then(() => setNewComment(''))
                          .catch(() => toast.error("Fehler beim Kommentieren"));
                      }
                    }}
                    disabled={!newComment.trim()}
                  >
                    Senden
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default UnifiedPostCard;
