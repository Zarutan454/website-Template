
import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Post, CreatePostData } from '@/types/posts';

// FeedListItem außerhalb der Komponente laden, um zirkuläre Abhängigkeiten zu vermeiden
const FeedListItem = React.lazy(() => import('../FeedListItem'));

interface VirtualRow {
  index: number;
  start: number;
  size: number;
}

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface UserData {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  role?: string;
}

interface PostRendererProps {
  virtualRow: VirtualRow;
  post: Post;
  isVisible: boolean;
  shouldPreload: boolean;
  isDarkMode: boolean;
  showMiningRewards: boolean;
  currentUser: UserData | null;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<Comment>;
  onGetComments: (postId: string) => Promise<Comment[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onMeasureHeight?: (height: number) => void;
}

/**
 * Optimierte Post-Rendering-Komponente für virtualisierte Listen
 * - Lazy Loading für Inhalte basierend auf Sichtbarkeit
 * - Performance-optimiert durch Memoization
 * - Unterstützt Vorabladen für bessere UX
 */
const PostRenderer: React.FC<PostRendererProps> = ({
  virtualRow,
  post,
  isVisible,
  shouldPreload,
  isDarkMode,
  showMiningRewards,
  currentUser,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onMeasureHeight
}) => {
  const [loadedContent, setLoadedContent] = useState<boolean>(false);
  const [loadedComments, setLoadedComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const postRef = useRef<HTMLDivElement>(null);

  // Effekt für Lazy Loading
  useEffect(() => {
    if (isVisible || shouldPreload) {
      setLoadedContent(true);
    }
  }, [isVisible, shouldPreload]);
  
  // Effekt für Höhenmessung
  useEffect(() => {
    if (isVisible && postRef.current && onMeasureHeight) {
      // Verwende ResizeObserver für kontinuierliches Messen
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          onMeasureHeight(height);
        }
      });
      
      resizeObserver.observe(postRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isVisible, onMeasureHeight, loadedContent, showComments]);

  // Kommentare laden, wenn sie angezeigt werden sollen
  const handleToggleComments = async () => {
    const newShowState = !showComments;
    setShowComments(newShowState);

    if (newShowState && loadedComments.length === 0 && !isCommentsLoading) {
      try {
        setIsCommentsLoading(true);
        const comments = await onGetComments(post.id);
        setLoadedComments(comments);
      } catch (error) {
        toast.error('Kommentare konnten nicht geladen werden');
      } finally {
        setIsCommentsLoading(false);
      }
    }
  };

  // Verwende useMemo für die Styling-Props, um unnötige Neuberechnungen zu vermeiden
  const itemStyle = useMemo(() => ({
    position: 'absolute' as const, // TypeScript Fix: explizit als 'absolute' typisieren
    top: 0,
    left: 0,
    width: '100%',
    height: `${virtualRow.size}px`,
    transform: `translateY(${virtualRow.start}px)`,
  }), [virtualRow.size, virtualRow.start]);

  return (
    <div
      ref={postRef}
      style={itemStyle}
      data-testid={`post-item-${post.id}`}
      aria-hidden={!isVisible ? 'true' : 'false'}
    >
      {/* Nur rendern, wenn entweder der Post sichtbar ist oder vorgeladen werden soll */}
      {(loadedContent || isVisible || shouldPreload) && (
        <React.Suspense fallback={
          <div className="p-4 rounded-lg border animate-pulse bg-accent/10 h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Lade Beitrag...</p>
          </div>
        }>
          <FeedListItem
            key={post.id}
            post={post}
            index={virtualRow.index}
            profile={currentUser}
            onLike={onLike}
            onDelete={onDelete}
            onComment={onComment}
            onGetComments={onGetComments}
            onShare={onShare}
            onReport={onReport}
            isDarkMode={isDarkMode}
            showMiningRewards={showMiningRewards}
            commentsData={loadedComments}
            showComments={showComments}
            onToggleComments={handleToggleComments}
            isCommentsLoading={isCommentsLoading}
          />
        </React.Suspense>
      )}
    </div>
  );
};

// Optimierte Memo-Vergleichsfunktion mit tieferem Vergleich relevanter Eigenschaften
function arePropsEqual(prevProps: PostRendererProps, nextProps: PostRendererProps) {
  // Wenn sich die Sichtbarkeit oder Vorladestatus ändern, re-rendern
  if (prevProps.isVisible !== nextProps.isVisible || 
      prevProps.shouldPreload !== nextProps.shouldPreload) {
    return false;
  }
  
  // Bei Änderungen an Virtualisierungsdaten re-rendern
  if (prevProps.virtualRow.start !== nextProps.virtualRow.start || 
      prevProps.virtualRow.size !== nextProps.virtualRow.size) {
    return false;
  }
  
  // Wenn sich der Post ändert (z.B. durch Likes), re-rendern
  if (prevProps.post.id !== nextProps.post.id || 
      prevProps.post.likes_count !== nextProps.post.likes_count ||
      prevProps.post.comments_count !== nextProps.post.comments_count ||
      prevProps.post.is_liked !== nextProps.post.is_liked) {
    return false;
  }
  
  // Bei allen anderen Fällen keine Änderung
  return true;
}

// Memoization für bessere Rendering-Performance
export default memo(PostRenderer, arePropsEqual);
