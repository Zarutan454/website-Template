import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatTimeAgo } from '@/utils/timeAgo';
import { toast } from 'sonner';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Comments from './Comments';
import YouTubeEmbed from './YouTubeEmbed';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';

interface PostAuthor {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

interface PostData {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked?: boolean;
  image_url?: string;
  video_url?: string;
  author: PostAuthor;
  media_url?: string;
  media_type?: string;
  token_data?: {
    token_name: string;
    token_symbol: string;
    token_image?: string;
    token_network: string;
    token_address: string;
  };
  nft_data?: {
    nft_id: string;
    nft_name: string;
    nft_image: string;
    nft_collection: string;
    nft_network: string;
  };
}

interface OptimizedPostCardProps {
  post: PostData;
  currentUser?: any;
  isDarkMode?: boolean;
  showMiningRewards?: boolean;
  onLike: (postId: string) => Promise<boolean>;
  onComment?: (postId: string, content: string) => Promise<any>;
  onShare?: (postId: string) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
}

const OptimizedPostCard: React.FC<OptimizedPostCardProps> = ({
  post,
  currentUser,
  isDarkMode = true,
  showMiningRewards = false,
  onLike,
  onComment,
  onShare,
  onDelete,
  onReport
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  
  const isCurrentUserAuthor = currentUser?.id === post.author.id;
  
  const formattedDate = formatTimeAgo(new Date(post.created_at));
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  useEffect(() => {
    if (post?.content) {
      const videoId = extractYoutubeVideoId(post.content);
      if (videoId) {
        setYoutubeVideoId(videoId);
      }
    }
  }, [post?.content, post?.id]);
  
  const handleLike = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      
      const result = await onLike(post.id);
      
      if (result !== newIsLiked) {
        setIsLiked(result);
        setLikesCount(prev => result ? prev + 1 : Math.max(0, prev - 1));
      }
      
      return result;
    } catch (error) {
      console.error("Fehler beim Liken:", error);
      setIsLiked(!isLiked);
      setLikesCount(prev => !isLiked ? prev + 1 : Math.max(0, prev - 1));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleToggleComments = async () => {
    setShowComments(!showComments);
    
    if (!showComments && onComment) {
      setIsLoadingComments(true);
      try {
        // const fetchedComments = await onGetComments(post.id);
        // setComments(fetchedComments);
      } catch (error) {
        console.error("Fehler beim Laden der Kommentare:", error);
      } finally {
        setIsLoadingComments(false);
      }
    }
  };
  
  const handleSubmitComment = async (postId: string, content: string) => {
    if (!onComment || !content.trim()) return null;
    
    try {
      return await onComment(postId, content);
    } catch (error) {
      console.error("Fehler beim Kommentieren:", error);
      return null;
    }
  };
  
  const handleShare = async () => {
    if (!onShare) return false;
    
    try {
      return await onShare(post.id);
    } catch (error) {
      console.error("Fehler beim Teilen:", error);
      return false;
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete) return false;
    
    try {
      const result = await onDelete(post.id);
      if (result) {
        toast.success("Beitrag wurde gelöscht");
      }
      return result;
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      return false;
    }
  };
  
  const handleReport = async () => {
    if (!onReport) return false;
    
    try {
      const result = await onReport(post.id, "Unangemessener Inhalt");
      if (result) {
        toast.success("Beitrag wurde gemeldet");
      }
      return result;
    } catch (error) {
      console.error("Fehler beim Melden:", error);
      return false;
    }
  };
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <Card className={`border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} shadow-md overflow-hidden ${isDarkMode ? 'bg-dark-100' : 'bg-white/90'}`}>
        <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${post.author.id}`}>
              <Avatar className={`h-10 w-10 ${isDarkMode ? 'ring-2 ring-dark-300' : 'ring-2 ring-gray-200'}`}>
                {post.author.avatar_url ? (
                  <AvatarImage src={post.author.avatar_url} alt={post.author.display_name || 'User'} />
                ) : (
                  <AvatarFallback className={`${isDarkMode ? 'bg-dark-300 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {getInitials(post.author.display_name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
            
            <div>
              <div className="flex items-center">
                <Link to={`/profile/${post.author.id}`} className="font-medium hover:underline">
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {post.author.display_name || post.author.username || 'Anonym'}
                  </span>
                </Link>
                {post.author.is_verified && (
                  <CheckCircle2 className="ml-1 h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formattedDate}
              </p>
            </div>
          </div>
          
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isCurrentUserAuthor && onDelete && (
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-500 focus:text-red-500"
                >
                  Beitrag löschen
                </DropdownMenuItem>
              )}
              
              {!isCurrentUserAuthor && onReport && (
                <DropdownMenuItem 
                  onClick={handleReport}
                  className="text-amber-500 focus:text-amber-500"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Beitrag melden
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-4 pt-2">
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm py-2 whitespace-pre-line`}>
            {post.content}
          </p>
          
          {youtubeVideoId && (
            <div className="mt-2 mb-3 rounded-md overflow-hidden">
              <YouTubeEmbed 
                videoId={youtubeVideoId}
                title="YouTube Video"
                className="w-full"
                height={315}
              />
            </div>
          )}
          
          {(post.image_url || post.media_url) && !youtubeVideoId && (
            <div className="mt-2 rounded-md overflow-hidden">
              <img 
                src={post.image_url || post.media_url} 
                alt="Post Inhalt" 
                className="w-full rounded-md object-cover max-h-[500px]" 
                loading="lazy"
              />
            </div>
          )}
          
          {post.video_url && !youtubeVideoId && (
            <div className="mt-2 rounded-md overflow-hidden">
              <video 
                src={post.video_url} 
                controls 
                className="w-full rounded-md" 
                preload="metadata"
              />
            </div>
          )}
          
          {post.token_data && (
            <div className={`mt-2 p-3 rounded-md ${isDarkMode ? 'bg-dark-200' : 'bg-gray-100'}`}>
              <div className="flex items-center">
                {post.token_data.token_image && (
                  <img 
                    src={post.token_data.token_image} 
                    alt={post.token_data.token_name} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div>
                  <Badge variant="outline" className="mb-1">Token</Badge>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {post.token_data.token_name} ({post.token_data.token_symbol})
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Network: {post.token_data.token_network}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {post.nft_data && (
            <div className={`mt-2 p-3 rounded-md ${isDarkMode ? 'bg-dark-200' : 'bg-gray-100'}`}>
              <div className="flex items-center">
                {post.nft_data.nft_image && (
                  <img 
                    src={post.nft_data.nft_image} 
                    alt={post.nft_data.nft_name} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div>
                  <Badge variant="outline" className="mb-1">NFT</Badge>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {post.nft_data.nft_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Collection: {post.nft_data.nft_collection}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className={`flex items-center justify-between mt-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex space-x-4">
              <span>{likesCount} Likes</span>
              <span>{post.comments_count} Kommentare</span>
              <span>{post.shares_count} Shares</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-4 pt-2 border-t border-gray-800">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`flex-1 ${isLiked ? 'text-pink-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              disabled={isProcessing}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>Like</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleComments}
              className={`flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>Kommentar</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className={`flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <Share2 className="mr-1 h-4 w-4" />
              <span>Teilen</span>
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="p-0">
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="w-full px-4 pb-4"
              >
                <Separator className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} mb-3`} />
                <Comments 
                  comments={comments} 
                  postId={post.id}
                  onComment={handleSubmitComment}
                  currentUserId={currentUser?.id}
                  isLoading={isLoadingComments}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OptimizedPostCard;
