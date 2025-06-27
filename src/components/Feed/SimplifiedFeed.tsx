
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedStateRenderer } from './common';
import { FeedType } from '@/hooks/feed/useFeedData';
import { Post } from '@/types/posts';
import { useTheme } from '@/components/ThemeProvider';
import { useProfile } from '@/hooks/useProfile';
import FeedFilterOptimized from './FeedFilterOptimized';
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { UiFilterType } from '@/hooks/feed/useFilterControl';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import SimplifiedFeedHeader from './components/SimplifiedFeedHeader';
import NewPostsNotification from './components/NewPostsNotification';

interface SimplifiedFeedProps {
  feedType: FeedType;
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  showFilters?: boolean;
  showHeader?: boolean;
  showMiningRewards?: boolean;
  title?: string;
  description?: string;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onRefresh: () => Promise<boolean> | void;
  hasNewPosts?: boolean;
  className?: string;
}

/**
 * Verbesserte Feed-Komponente mit visuellen Verbesserungen und neuen Funktionen
 * für eine bessere Benutzererfahrung
 */
const SimplifiedFeed: React.FC<SimplifiedFeedProps> = ({
  feedType,
  posts,
  isLoading,
  error,
  showFilters = true,
  showHeader = true,
  showMiningRewards = false,
  title,
  description,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onRefresh,
  hasNewPosts = false,
  className = ""
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user: profile } = useAuth()();
  const isDarkMode = theme === 'dark';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [newPostsCount, setNewPostsCount] = useState<number>(0);
  
  const { 
    showFilterMenu, 
    selectedFilter, 
    toggleFilters, 
    handleFilterSelect 
  } = useFilterControl();
  
  // Handler für die Wiederholungsversuche bei Fehlern
  const handleRetry = useCallback(() => {
    onRefresh();
  }, [onRefresh]);
  
  // Handler für die Weiterleitung zur Login-Seite
  const handleLoginRedirect = useCallback(() => {
    navigate('/login');
  }, [navigate]);
  
  // Verbesserter Refresh-Handler mit Rückmeldung an den Benutzer
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setNewPostsCount(0);
    
    try {
      await onRefresh();
      setLastRefreshTime(new Date());
      toast.success("Feed wurde aktualisiert");
    } catch (error) {
      toast.error("Fehler beim Aktualisieren des Feeds");
    } finally {
      // Verzögerung für die Animation, damit der Benutzer die Aktualisierung wahrnimmt
      setTimeout(() => setIsRefreshing(false), 800);
    }
  }, [isRefreshing, onRefresh]);
  
  // Handler für das Ein- und Ausschalten von Benachrichtigungen
  const handleToggleSubscribe = useCallback(() => {
    setIsSubscribed(prev => !prev);
    
    if (!isSubscribed) {
      toast.success(`Du erhältst jetzt Benachrichtigungen für den ${getFeedTitle().toLowerCase()} Feed`);
      
      // Simuliere neue Beiträge nach dem Abonnieren (nur für Demo-Zwecke)
      setTimeout(() => {
        const randomCount = Math.floor(Math.random() * 5) + 1;
        setNewPostsCount(randomCount);
      }, 10000);
    } else {
      toast.info(`Benachrichtigungen für den ${getFeedTitle().toLowerCase()} Feed deaktiviert`);
    }
  }, [isSubscribed]);
  
  // Funktion zum Ermitteln des Feed-Titels
  const getFeedTitle = useCallback(() => {
    if (title) return title;
    
    switch (feedType) {
      case 'recent': return 'Neueste Beiträge';
      case 'popular': return 'Beliebte Beiträge';
      case 'following': return 'Dein Feed';
      case 'tokens': return 'Token-Feed';
      case 'nfts': return 'NFT-Feed';
      case 'foryou': return 'Für dich';
      default: return 'Feed';
    }
  }, [feedType, title]);
  
  // Funktion zum Ermitteln der Feed-Beschreibung
  const getFeedDescription = useCallback(() => {
    if (description) return description;
    
    switch (feedType) {
      case 'recent': return 'Die aktuellsten Beiträge aus dem Netzwerk';
      case 'popular': return 'Die beliebtesten Beiträge im Moment';
      case 'following': return 'Beiträge von Personen, denen du folgst';
      case 'tokens': return 'Alle Beiträge rund um Krypto-Token';
      case 'nfts': return 'Entdecke NFT-bezogene Inhalte';
      case 'foryou': return 'Personalisierte Inhalte für dich';
      default: return 'Entdecke Beiträge';
    }
  }, [feedType, description]);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="space-y-2 mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{getFeedTitle()}</h1>
          <p className="text-muted-foreground">{getFeedDescription()}</p>
        </div>
      )}
      
      {showFilters && (
        <>
          <SimplifiedFeedHeader
            title="Feed"
            isDarkMode={isDarkMode}
            isRefreshing={isRefreshing}
            isSubscribed={isSubscribed}
            postCount={posts.length}
            onRefresh={handleRefresh}
            onToggleSubscribe={handleToggleSubscribe}
          />
          
          <AnimatePresence>
            <NewPostsNotification 
              show={hasNewPosts || newPostsCount > 0} 
              onRefresh={handleRefresh}
              count={newPostsCount}
            />
          </AnimatePresence>
          
          <Card className={`w-full mb-4 ${isDarkMode ? 'bg-dark-100 border-gray-800' : 'bg-white'}`}>
            <CardContent className="px-4 py-3">
              <div className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>Filtern nach</span>
                <button 
                  onClick={toggleFilters}
                  className="text-sm text-primary hover:underline"
                >
                  {showFilterMenu ? 'Filter ausblenden' : 'Filter anzeigen'}
                </button>
              </div>
              
              <FeedFilterOptimized
                showFilters={showFilterMenu}
                selectedFilter={selectedFilter as UiFilterType}
                handleFilterSelect={handleFilterSelect as (filter: UiFilterType | null) => void}
                feedType={feedType}
                lastUpdated={lastRefreshTime}
              />
            </CardContent>
          </Card>
        </>
      )}
      
      <FeedStateRenderer
        isLoading={isLoading}
        error={error}
        posts={posts}
        profile={profile}
        isEmpty={posts.length === 0}
        onLike={onLike}
        onDelete={onDelete}
        onComment={onComment}
        onGetComments={onGetComments}
        onShare={onShare}
        onReport={onReport}
        onRetry={handleRetry}
        onLoginRedirect={handleLoginRedirect}
        isDarkMode={isDarkMode}
        showMiningRewards={showMiningRewards}
      />
    </div>
  );
};

export default SimplifiedFeed;
