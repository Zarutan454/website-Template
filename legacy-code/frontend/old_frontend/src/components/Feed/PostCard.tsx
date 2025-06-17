
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from 'framer-motion';
import Comments from './Comments';
import PostHeader from './PostComponents/PostHeader';
import PostContent from './PostComponents/PostContent';
import PostActions from './PostComponents/PostActions';
import PostMenu from './PostComponents/PostMenu';

interface PostCardProps {
  post: {
    id: string;
    author: {
      id: string;
      avatar_url?: string;
      display_name?: string;
      username: string;
      is_verified?: boolean;
    };
    content: string;
    created_at: string;
    updated_at?: string;
    image_url?: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    is_liked: boolean;
    is_repost: boolean;
    original_post_id?: string;
    original_author?: {
      id: string;
      avatar_url?: string;
      display_name?: string;
      username: string;
    };
    has_comments?: boolean;
    comments?: any[];
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
  };
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
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
  darkMode = true,
  currentUserId,
  currentUser,
  showMiningRewards = true
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  
  const isCurrentUserAuthor = currentUserId === post.author.id;

  const toggleComments = async () => {
    setShowComments(!showComments);
    
    if (!showComments && !post.has_comments) {
      setIsLoadingComments(true);
      try {
        const fetchedComments = await onGetComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
      } finally {
        setIsLoadingComments(false);
      }
    }
  };

  return (
    <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow duration-200 ${darkMode ? 'bg-dark-100' : 'bg-white/80'}`}>
      <CardHeader className="pt-4 pb-2">
        <PostHeader 
          author={post.author} 
          created_at={post.created_at} 
          darkMode={darkMode} 
        />
      </CardHeader>
      
      <CardContent className="px-4 py-0">
        <PostContent 
          content={post.content} 
          image_url={post.image_url} 
        />
        
        {/* Display token data if available */}
        {post.token_data && (
          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <img 
                src={post.token_data.token_image || '/images/token-default.png'} 
                alt={post.token_data.token_name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/token-default.png';
                }}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{post.token_data.token_name}</h4>
              <p className="text-xs text-muted-foreground">{post.token_data.token_symbol} • {post.token_data.token_network}</p>
            </div>
            <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Token
            </div>
          </div>
        )}
        
        {/* Display NFT data if available */}
        {post.nft_data && (
          <div className="mt-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
              <img 
                src={post.nft_data.nft_image || '/images/nft-default.png'} 
                alt={post.nft_data.nft_name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/nft-default.png';
                }}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{post.nft_data.nft_name}</h4>
              <p className="text-xs text-muted-foreground">{post.nft_data.nft_collection} • {post.nft_data.nft_network}</p>
            </div>
            <div className="text-xs bg-violet-500/10 text-violet-500 px-2 py-1 rounded-full">
              NFT
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col px-4 pt-2 pb-2">
        <div className="w-full flex justify-between items-center mt-2">
          <PostActions 
            postId={post.id}
            isLiked={isLiked}
            onLike={async (postId) => {
              const result = await onLike(postId);
              setIsLiked(result);
              return result;
            }}
            onToggleComments={toggleComments}
            onShare={() => onShare(post.id)}
            showComments={showComments}
            showMiningRewards={showMiningRewards}
          />
          
          <PostMenu 
            isCurrentUserAuthor={isCurrentUserAuthor} 
            postId={post.id} 
            onDelete={onDelete} 
          />
        </div>
        
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="mt-3"
            >
              <Separator className="bg-gray-800" />
              <Comments 
                comments={comments} 
                postId={post.id}
                onComment={onComment}
                currentUserId={currentUserId}
                isLoading={isLoadingComments}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
