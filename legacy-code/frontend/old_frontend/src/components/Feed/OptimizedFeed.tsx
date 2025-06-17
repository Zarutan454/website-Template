
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useFeedState } from '@/hooks/feed/useFeedState';
import { FeedType } from '@/hooks/feed/useFeedData';
import { usePosts } from '@/hooks/usePosts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Bell, BellOff, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';
import { ScrollArea } from "@/components/ui/scroll-area";
import FeedStateRenderer from './common/FeedStateRenderer';
import CreatePostBoxLight from './CreatePostBoxLight';
import { useNavigate } from 'react-router-dom';

interface OptimizedFeedProps {
  feedType: FeedType;
  showFilters?: boolean;
  showCreatePostForm?: boolean;
  showHeader?: boolean;
  enableAutoRefresh?: boolean;
  showMiningRewards?: boolean;
  title?: string;
  description?: string;
}

/**
 * Optimierte Feed-Komponente, die verschiedene Feed-Funktionalitäten in einer
 * einzigen, performanten Komponente vereint
 */
const OptimizedFeed: React.FC<OptimizedFeedProps> = ({
  feedType,
  showFilters = true,
  showCreatePostForm = true,
  showHeader = true,
  enableAutoRefresh = true,
  showMiningRewards = false,
  title,
  description
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Profile und Posts Hooks
  const { profile, isAuthenticated } = useProfile();
  const { 
    adaptedPosts, 
    isLoading, 
    error, 
    fetchPosts, 
    likePost, 
    deletePost, 
    createComment, 
    getPostComments, 
    sharePost 
  } = usePosts();
  
  // Verbesserte Feed-Zustandsverwaltung
  const {
    showFilterMenu,
    selectedFilter,
    hasNewPosts,
    isRefreshing,
    lastRefresh,
    refreshFeed,
    toggleFilters,
    handleFilterSelect,
    enableAutoRefresh: activateAutoRefresh
  } = useFeedState(feedType);
  
  // Initial-Fetch und bei Typ- oder Refresh-Änderung
  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchPosts(feedType);
    }
  }, [feedType, isAuthenticated, profile, fetchPosts]);
  
  // Auto-Refresh-Aktivierung
  useEffect(() => {
    if (enableAutoRefresh) {
      activateAutoRefresh(true);
    }
    return () => activateAutoRefresh(false);
  }, [enableAutoRefresh, activateAutoRefresh]);
  
  // Like-Handler
  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu liken");
      return false;
    }
    
    try {
      return await likePost(postId);
    } catch (error) {
      console.error('Fehler beim Liken:', error);
      return false;
    }
  };
  
  // Kommentar-Handler
  const handleCreateComment = async (postId: string, content: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um zu kommentieren");
      return null;
    }
    
    try {
      return await createComment({ post_id: postId, content });
    } catch (error) {
      console.error('Fehler beim Kommentieren:', error);
      return null;
    }
  };
  
  // Lösch-Handler
  const handleDeletePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu löschen");
      return false;
    }
    
    try {
      const result = await deletePost(postId);
      if (result) {
        await fetchPosts(feedType);
        toast.success("Beitrag erfolgreich gelöscht");
      }
      return result;
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      return false;
    }
  };
  
  // Share-Handler
  const handleSharePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu teilen");
      return false;
    }
    
    try {
      return await sharePost(postId);
    } catch (error) {
      console.error('Fehler beim Teilen:', error);
      return false;
    }
  };
  
  // Report-Handler
  const handleReportPost = async (postId: string, reason: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu melden");
      return false;
    }
    
    try {
      toast.success("Beitrag wurde gemeldet");
      return true;
    } catch (error) {
      console.error('Fehler beim Melden:', error);
      return false;
    }
  };
  
  // Retry-Handler
  const handleRetry = () => {
    if (isAuthenticated) {
      fetchPosts(feedType);
    }
  };
  
  // Login-Redirect-Handler
  const handleLoginRedirect = () => {
    navigate('/login');
  };
  
  // Post-Erstellung-Handler
  const handleOpenCreatePost = () => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu erstellen");
      navigate('/login');
      return;
    }
    
    navigate('/post/create');
  };
  
  // Abonnieren-Handler
  const handleToggleSubscribe = () => {
    setIsSubscribed(prev => !prev);
    
    if (!isSubscribed) {
      toast.success(`Du erhältst jetzt Benachrichtigungen für den ${getFeedTitle().toLowerCase()} Feed`);
    } else {
      toast.info(`Benachrichtigungen für den ${getFeedTitle().toLowerCase()} Feed deaktiviert`);
    }
  };
  
  // Feed-Titel basierend auf Feed-Typ oder übergebenen Titel
  const getFeedTitle = () => {
    if (title) return title;
    
    switch (feedType) {
      case 'recent': return 'Neueste Beiträge';
      case 'popular': return 'Beliebte Beiträge';
      case 'following': return 'Dein Feed';
      case 'tokens': return 'Token-Feed';
      case 'nfts': return 'NFT-Feed';
      default: return 'Feed';
    }
  };
  
  // Feed-Beschreibung basierend auf Feed-Typ oder übergebener Beschreibung
  const getFeedDescription = () => {
    if (description) return description;
    
    switch (feedType) {
      case 'recent': return 'Die aktuellsten Beiträge aus dem Netzwerk';
      case 'popular': return 'Die beliebtesten Beiträge im Moment';
      case 'following': return 'Beiträge von Personen, denen du folgst';
      case 'tokens': return 'Alle Beiträge rund um Krypto-Token';
      case 'nfts': return 'Entdecke NFT-bezogene Inhalte';
      default: return 'Entdecke Beiträge';
    }
  };
  
  // Filterliste basierend auf Feed-Typ
  const getFilterOptions = () => {
    const commonFilters = [
      { id: 'Neueste', label: 'Neueste' },
      { id: 'Beliebt', label: 'Beliebt' }
    ];
    
    if (feedType === 'tokens') {
      return [...commonFilters, { id: 'Tokens', label: 'Nur Tokens' }];
    } else if (feedType === 'nfts') {
      return [...commonFilters, { id: 'NFTs', label: 'Nur NFTs' }];
    } else if (feedType === 'following') {
      return [...commonFilters, { id: 'Folge ich', label: 'Folge ich' }];
    }
    
    return commonFilters;
  };
  
  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="space-y-2 mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{getFeedTitle()}</h1>
          <p className="text-muted-foreground">{getFeedDescription()}</p>
        </div>
      )}
      
      {showCreatePostForm && isAuthenticated && (
        <div className="mb-6">
          <CreatePostBoxLight 
            darkMode={isDarkMode} 
            onCreatePost={handleOpenCreatePost} 
          />
        </div>
      )}
      
      {showFilters && (
        <Card className={`w-full mb-4 ${isDarkMode ? 'bg-dark-100 border-gray-800' : 'bg-white'}`}>
          <CardHeader className="px-4 py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Feed</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleSubscribe}
                  className="hidden sm:flex"
                >
                  {isSubscribed ? (
                    <>
                      <BellOff className="h-4 w-4 mr-1" />
                      Abbestellen
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-1" />
                      Abonnieren
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshFeed}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Aktualisieren
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {hasNewPosts && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-4 py-2 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-center"
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={refreshFeed}
                  className="w-full"
                >
                  Neue Beiträge verfügbar
                  <RefreshCw className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <CardContent className="px-4 py-3">
            <div className="text-sm font-medium mb-2 flex items-center justify-between">
              <span>Filtern nach</span>
              <button 
                onClick={toggleFilters}
                className="text-sm text-primary hover:underline flex items-center"
              >
                <Filter className="h-3 w-3 mr-1" />
                {showFilterMenu ? 'Filter ausblenden' : 'Filter anzeigen'}
              </button>
            </div>
            
            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ScrollArea className="whitespace-nowrap pb-2 mt-2">
                    <div className="flex space-x-2 py-1">
                      {getFilterOptions().map((filter) => (
                        <Button
                          key={filter.id}
                          variant={selectedFilter === filter.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFilterSelect(filter.id)}
                          className="rounded-full"
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
      
      <FeedStateRenderer
        isLoading={isLoading}
        error={error}
        posts={adaptedPosts}
        profile={profile}
        isEmpty={adaptedPosts.length === 0}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
        onComment={handleCreateComment}
        onGetComments={getPostComments}
        onShare={handleSharePost}
        onReport={handleReportPost}
        onRetry={handleRetry}
        onLoginRedirect={handleLoginRedirect}
        isDarkMode={isDarkMode}
        showMiningRewards={showMiningRewards}
      />
    </div>
  );
};

export default OptimizedFeed;
