
import React from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import FeedEmpty from './FeedEmpty';
import FeedError from './FeedError';
import FeedLoading from './FeedLoading';

interface PostListContentProps {
  isLoading: boolean;
  error: Error | null;
  filteredPosts: any[];
  adaptedPosts: any[];
  posts: any[];
  profile: any;
  handleLikePost: (postId: string) => Promise<boolean>;
  handleDeletePost: (postId: string) => Promise<boolean>;
  handleCreateComment: (postId: string, content: string) => Promise<any>;
  handleGetComments: (postId: string) => Promise<any[]>;
  handleSharePost: (postId: string) => Promise<boolean>;
  handleRetry: () => void;
  handleLoginRedirect: () => void;
  adaptPostForCardSync: (post: any, userId: string) => any;
  isDarkMode: boolean;
  handleReportPost: (postId: string, reason: string) => Promise<boolean>;
}

const PostListContent: React.FC<PostListContentProps> = ({
  isLoading,
  error,
  filteredPosts,
  adaptedPosts,
  posts,
  profile,
  handleLikePost,
  handleDeletePost,
  handleCreateComment,
  handleGetComments,
  handleSharePost,
  handleRetry,
  handleLoginRedirect,
  adaptPostForCardSync,
  isDarkMode,
  handleReportPost
}) => {
  if (isLoading) {
    return <FeedLoading />;
  }

  if (error) {
    return <FeedError message={error.message} onRetry={handleRetry} />;
  }

  if (posts.length === 0 || filteredPosts.length === 0) {
    return (
      <FeedEmpty
        darkMode={isDarkMode}
        onCreatePost={() => {
          if (!profile) {
            handleLoginRedirect();
          }
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {filteredPosts.map((post, index) => (
        <motion.div
          key={`post-${post.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.05,
            duration: 0.3,
            ease: "easeOut"
          }}
          className="transform transition-all duration-300 bg-dark-200/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 shadow-lg"
        >
          <PostCard
            post={post}
            onLike={() => handleLikePost(post.id)}
            onDelete={() => handleDeletePost(post.id)}
            onComment={(postId, content) => handleCreateComment(postId, content)}
            onGetComments={() => handleGetComments(post.id)}
            onShare={() => handleSharePost(post.id)}
            onReport={(postId, reason) => handleReportPost(postId, reason)}
            darkMode={isDarkMode}
            currentUserId={profile?.id}
            currentUser={profile}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PostListContent;
