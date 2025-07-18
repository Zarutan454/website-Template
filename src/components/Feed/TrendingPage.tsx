import React, { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import FeedLoading from './FeedLoading';
import FeedEmpty from './FeedEmpty';
import FeedError from './FeedError';
import { toast } from 'sonner';
import { postRepository } from '@/repositories/PostRepository';
import { isValid } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const TrendingPage: React.FC = () => {
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user: profile } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  useEffect(() => {
    // TODO: Django-API-Migration: TrendingPage auf Django-API umstellen
    // Die gesamte Logik für das Laden der Trending-Daten muss auf die Django-API migriert werden.
    // Aktuell ist keine Funktionalität vorhanden, da Supabase entfernt wurde.
    fetchTrendingPosts();
  }, []);
  
  /**
   * Überprüft und korrigiert ungültige Datumswerte in Posts
   */
  const validateAndFixPostDates = (posts: any[]): any[] => {
    return posts.map(post => {
      // Prüfe, ob created_at existiert und ein gültiges Datum ist
      if (post.created_at) {
        const date = new Date(post.created_at);
        if (!isValid(date)) {
          post.created_at = new Date().toISOString(); // Fallback auf aktuelles Datum
        }
      } else {
        // Wenn kein created_at vorhanden ist, setze aktuelles Datum
        post.created_at = new Date().toISOString();
      }
      
      return post;
    });
  };
  
  const fetchTrendingPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("[TrendingPage] Fetching trending posts...");
      
      // TODO: Django-API-Migration: Supabase-Aufrufe durch Django-API-Aufrufe ersetzen
      // const { data, error } = await supabase
      //   .from('posts')
      //   .select(`
      //     *,
      //     user:author_id(id, username, display_name, avatar_url)
      //   `)
      //   .order('likes_count', { ascending: false })
      //   .limit(20);
      
      // if (error) throw error;
      
      console.log(`[TrendingPage] Fetched ${trendingPosts?.length || 0} trending posts`);
      
      // Prüfe und korrigiere Datumswerte, bevor weitere Verarbeitung stattfindet
      const validatedPosts = validateAndFixPostDates(trendingPosts || []);
      
      if (profile) {
        const postsWithLikeStatus = await Promise.all(
          validatedPosts.map(async (post) => {
            const isLiked = await postRepository.isPostLikedByUser(profile.id, post.id);
            return {
              ...post,
              is_liked_by_user: isLiked
            };
          })
        );
        setTrendingPosts(postsWithLikeStatus || []);
      } else {
        setTrendingPosts(validatedPosts);
      }
    } catch (err) {
      console.error('Error fetching trending posts:', err);
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Trending-Posts'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLikePost = async (postId: string) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um Beiträge zu liken");
      return false;
    }
    
    try {
      console.log(`[TrendingPage] Liking post ${postId}`);
      const result = await postRepository.togglePostLike(profile.id, postId);
      
      if (result.success) {
        await fetchTrendingPosts();
        return result.isLiked;
      }
      
      return false;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um Beiträge zu löschen");
      return false;
    }
    
    try {
      console.log(`[TrendingPage] Deleting post ${postId}`);
      // TODO: Django-API-Migration: Supabase-Aufrufe durch Django-API-Aufrufe ersetzen
      // const result = await postRepository.deletePost(postId);
      
      // if (result) {
      //   setTrendingPosts(prev => prev.filter(post => post.id !== postId));
      //   toast.success("Beitrag erfolgreich gelöscht");
      // } else {
      //   toast.error("Fehler beim Löschen des Beitrags");
      // }
      
      // return result;
      toast.error("Diese Funktion ist noch nicht implementiert.");
      return false;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  };
  
  const handleCreateComment = async (postId: string, content: string) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um zu kommentieren");
      return null;
    }
    
    try {
      return await postRepository.createComment(profile.id, postId, content);
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return null;
    }
  };
  
  const handleGetComments = async (postId: string) => {
    try {
      return await postRepository.getPostComments(postId);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error("Kommentare konnten nicht geladen werden");
      return [];
    }
  };
  
  const handleSharePost = async (postId: string) => {
    try {
      console.log(`[TrendingPage] Sharing post ${postId}`);
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link zum Beitrag wurde in die Zwischenablage kopiert");
      
      if (profile) {
        await postRepository.sharePost(postId);
        fetchTrendingPosts(); // Aktualisiere die Anzeige
      }
      
      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error("Der Link konnte nicht kopiert werden");
      return false;
    }
  };
  
  const handleReportPost = async (postId: string, reason: string) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um Beiträge zu melden");
      return false;
    }
    
    try {
      const result = await postRepository.reportPost(profile.id, postId, reason);
      
      if (result) {
        toast.success("Deine Meldung wurde erfolgreich übermittelt. Unser Team wird den Beitrag überprüfen.");
      } else {
        toast.error("Fehler beim Melden des Beitrags.");
      }
      
      return result;
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  };
  
  if (isLoading) {
    return <FeedLoading />;
  }
  
  if (error) {
    return <FeedError message={error.message} onRetry={fetchTrendingPosts} />;
  }
  
  if (trendingPosts.length === 0) {
    return <FeedEmpty darkMode={isDarkMode} onCreatePost={() => {}} />;
  }
  
  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
        Trending Posts
      </h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {trendingPosts.map((post, index) => (
          <motion.div
            key={`trending-post-${post.id}`}
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
              onComment={(postId, content) => handleCreateComment(postId, content)}
              onGetComments={() => handleGetComments(post.id)}
              onShare={() => handleSharePost(post.id)}
              onReport={(postId, reason) => handleReportPost(postId, reason)}
              currentUserId={profile?.id}
              darkMode={isDarkMode}
              currentUser={profile}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TrendingPage;
