import React, { useEffect, useState, startTransition, Suspense } from 'react';
import { motion } from 'framer-motion';
import PostCard from './Post/PostCard';
import FeedLoading from './FeedLoading';
import FeedEmpty from './FeedEmpty';
import FeedError from './FeedError';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { useMining } from '@/hooks/useMining';
import CreatePostBoxLight from './CreatePostBoxLight';
import { Spinner } from '@/components/ui/spinner';
import { CreatePostData } from '@/types/posts';
import { toast } from 'sonner';
import MiningStatusIndicator from './Mining/MiningStatusIndicator';

// Lazy load the CreatePostForm component
const CreatePostForm = React.lazy(() => import('./CreatePostForm'));

const FeedPage: React.FC = () => {
  const { 
    adaptedPosts, 
    isLoading, 
    error,
    fetchPosts, 
    createPost,
    likePost, 
    deletePost, 
    createComment, 
    getPostComments,
    sharePost
  } = usePosts();
  
  const { profile } = useProfile();
  const { theme } = useTheme();
  const { feedType = 'recent' } = useParams<{ feedType: string }>();
  const navigate = useNavigate();
  const { isMining } = useMining();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [createFormTab, setCreateFormTab] = useState<string>('text');
  
  const isDarkMode = theme === 'dark';
  
  useEffect(() => {
    if (profile) {
      fetchPosts(feedType);
    }
  }, [profile, feedType, refreshKey]);
  
  const handleCreatePost = async (content: string, mediaUrl?: string | null) => {
    if (!profile) return false;
    
    try {
      const result = await createPost({ 
        content,
        media_url: mediaUrl || undefined
      });
      
      if (result.success) {
        setRefreshKey(prev => prev + 1);
        toast.success("Beitrag erfolgreich erstellt!");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Fehler beim Erstellen des Beitrags");
      return false;
    }
  };
  
  const handleLikePost = async (postId: string) => {
    try {
      const success = await likePost(postId);
      return success;
    } catch (error) {
      console.error("Error liking post:", error);
      return false;
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    try {
      const success = await deletePost(postId);
      
      if (success) {
        setRefreshKey(prev => prev + 1);
      }
      
      return success;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  };
  
  const handleCreateComment = async (postId: string, content: string) => {
    try {
      const comment = await createComment({ post_id: postId, content });
      return comment;
    } catch (error) {
      console.error("Error creating comment:", error);
      return null;
    }
  };
  
  const handleGetComments = async (postId: string) => {
    try {
      return await getPostComments(postId);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };
  
  const handleSharePost = async (postId: string) => {
    try {
      return await sharePost(postId);
    } catch (error) {
      console.error("Error sharing post:", error);
      return false;
    }
  };

  const handleOpenCreatePost = (postData?: Partial<CreatePostData>) => {
    const action = postData?.action;
    let initialTab = 'text';
    
    if (action === 'media') {
      initialTab = 'media';
      toast.info("Media-Upload Modus ausgewählt");
    } else if (action === 'airdrop') {
      initialTab = 'airdrop';
      toast.info("Airdrop Modus ausgewählt");
    } else if (action === 'share') {
      initialTab = 'share';
      toast.info("Teilen Modus ausgewählt");
    }
    
    setCreateFormTab(initialTab);
    
    startTransition(() => {
      setShowCreateFormModal(true);
    });
  };
  
  const renderFeedContent = () => {
    if (isLoading) {
      return <FeedLoading />;
    }
    
    if (error) {
      return <FeedError message={error.message} onRetry={() => setRefreshKey(prev => prev + 1)} />;
    }
    
    if (!adaptedPosts || adaptedPosts.length === 0) {
      return (
        <FeedEmpty 
          darkMode={isDarkMode} 
          onCreatePost={() => {}} 
          message="Keine Beiträge gefunden" 
          description="Sei der Erste, der etwas postet!"
        />
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {adaptedPosts.map((post, index) => (
          <motion.div
            key={`feed-post-${post.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
            className="transform transition-all duration-300"
          >
            <PostCard 
              post={post}
              onLike={() => handleLikePost(post.id)}
              onDelete={() => handleDeletePost(post.id)}
              onComment={(content) => handleCreateComment(post.id, content)}
              onGetComments={() => handleGetComments(post.id)}
              onShare={() => handleSharePost(post.id)}
              currentUserId={profile?.id}
              darkMode={isDarkMode}
              currentUser={profile}
              showMiningRewards={isMining}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  };
  
  return (
    <div className="max-w-3xl mx-auto w-full p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {feedType === 'following' ? 'Meine Timeline' : 
            feedType === 'popular' ? 'Beliebte Beiträge' : 
            feedType === 'tokens' ? 'Token-Beiträge' :
            feedType === 'nfts' ? 'NFT-Beiträge' : 'Neuste Beiträge'}
          </h1>
          
          <MiningStatusIndicator showDetailed />
        </div>
        
        {profile && (
          <div className="mt-4">
            <CreatePostBoxLight 
              darkMode={isDarkMode} 
              onCreatePost={handleOpenCreatePost} 
            />
            
            {showCreateFormModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-200 rounded-lg w-full max-w-xl max-h-[90vh] overflow-auto">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <Spinner size="lg" />
                      <span className="ml-2">Lade Formular...</span>
                    </div>
                  }>
                    <CreatePostForm 
                      onCreatePost={handleCreatePost} 
                      darkMode={isDarkMode}
                      showMiningRewards={isMining}
                      onClose={() => setShowCreateFormModal(false)}
                      initialTab={createFormTab}
                    />
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {renderFeedContent()}
    </div>
  );
};

export default FeedPage;
