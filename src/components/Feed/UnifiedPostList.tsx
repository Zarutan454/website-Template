import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UnifiedPostCard from './UnifiedPostCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare } from 'lucide-react';

interface UnifiedPostListProps {
  posts: any[];
  currentUser: any;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport: (postId: string, reason: string) => Promise<boolean>;
  onDeleteComment?: (commentId: number) => Promise<boolean>;
  isDarkMode?: boolean;
  showMiningRewards?: boolean;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

const UnifiedPostList: React.FC<UnifiedPostListProps> = ({
  posts,
  currentUser,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onDeleteComment,
  isDarkMode = true,
  showMiningRewards = false
}) => {
  if (!posts || posts.length === 0) {
    return (
      <Alert className={isDarkMode ? 'bg-dark-200' : 'bg-gray-100'}>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          Keine Beiträge gefunden. Folge anderen Benutzern oder erstelle deinen ersten Beitrag.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence initial={false}>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            transition={{ 
              layout: { duration: 0.3 },
              delay: index * 0.05
            }}
          >
            <UnifiedPostCard
              post={post}
              onLike={() => onLike(post.id)}
              onDelete={() => onDelete(post.id)}
              onComment={(content) => onComment(post.id, content)}
              onGetComments={() => onGetComments(post.id)}
              onShare={() => onShare(post.id)}
              onReport={(reason) => onReport(post.id, reason)}
              onDeleteComment={onDeleteComment}
              darkMode={isDarkMode}
              currentUserId={currentUser?.id}
              currentUser={currentUser}
              showMiningRewards={showMiningRewards}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedPostList;
