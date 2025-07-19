import { useState, useEffect, useCallback } from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import FloatingCreateButton from './FloatingCreateButton';
import CreatePostModal from './CreatePostModal';
import { Search, Bell, MessageSquare, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { type CreatePostData } from '@/types/posts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider.utils';
import { useMining } from '@/hooks/useMining';
import Logo from '@/components/Logo';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { FloatingMiningButton } from '@/components/mining';
import { useAuth } from '@/context/AuthContext.utils';
import { postUpdateEmitter } from '@/hooks/useProfileMedia';
import StoriesSection from './StoriesSection';
import CreatePostBoxFacebook from '../Feed/CreatePostBoxFacebook';
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';

interface FeedLayoutProps {
  children: React.ReactNode;
  hideRightSidebar?: boolean;
  hideStoriesAndCreatePostBox?: boolean;
}

// Exportiere nur React-Komponenten aus dieser Datei. Alle Hilfsfunktionen/Konstanten werden in FeedLayout.utils.ts ausgelagert.
const FeedLayout: React.FC<FeedLayoutProps> = ({ children, hideRightSidebar = false, hideStoriesAndCreatePostBox = false }) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingPostData, setPendingPostData] = useState<CreatePostData | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user: profile } = useAuth();
  const { theme } = useTheme();
  const { miningStats, isMining, isLoading, error, fetchStats, startMining, stopMining, heartbeat, clearError, isAuthenticated } = useMining();
  const navigate = useNavigate();
  const { handleRefresh } = useUnifiedFeedState({ feedType: 'recent', enableAutoRefresh: true });

  // Entfernt: syncMiningState, da nicht vorhanden

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (isAuthenticated) {
        fetchStats();
        // Entferne Console-Log um Loop zu vermeiden
      }
    }, 60000); // Sync every minute
    
    return () => clearInterval(syncInterval);
  }, [isAuthenticated, fetchStats]);

  useEffect(() => {
    const handleRefreshFeed = () => {
      handleRefresh();
    };
    window.addEventListener('refreshFeed', handleRefreshFeed);
    return () => window.removeEventListener('refreshFeed', handleRefreshFeed);
  }, [handleRefresh]);

  const handleSignOut = async () => {
    try {
      // Use Django logout API
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await fetch('http://localhost:8080/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      // Clear local storage regardless of response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
      toast.success('Erfolgreich abgemeldet');
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear local storage even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
      toast.success('Erfolgreich abgemeldet');
    }
  };

  const handleCreatePost = async (data: CreatePostData): Promise<boolean> => {
    // COMPREHENSIVE FIX: Sanitize all incoming data
    const sanitizeMediaUrl = (mediaUrl: unknown): string | null => {
      if (!mediaUrl) return null;
      if (Array.isArray(mediaUrl)) {
        if (import.meta.env.DEV) {
          console.warn('🚨 ARRAY DETECTED (FeedLayout): Converting media_url array to string:', mediaUrl);
        }
        return mediaUrl[0] || null;
      }
      if (typeof mediaUrl === 'string') {
        return mediaUrl;
      }
      if (import.meta.env.DEV) {
        console.warn('🚨 UNEXPECTED TYPE (FeedLayout): Converting media_url to string:', typeof mediaUrl, mediaUrl);
      }
      return String(mediaUrl);
    };

    try {
      // Extract and sanitize data
      const { content, media_type, hashtags, privacy } = data;
      let { media_url } = data;
      // CRITICAL FIX: Sanitize media_url immediately
      media_url = sanitizeMediaUrl(media_url);
      // content darf nie leer sein (Backend-Pflichtfeld)
      const safeContent = content && content.trim().length > 0 ? content.trim() : (media_url ? ' ' : '');
      if (!safeContent) {
        toast.error('Bitte gib einen Text ein oder lade ein Medium hoch.');
        return false;
      }
      // privacy validieren und fallback
      const validPrivacy = ['public', 'friends', 'private'].includes(privacy) ? privacy : 'public';
      // Create a proper post data object with all fields
      const fullPostData = {
        content: safeContent,
        media_url,
        media_type,
        hashtags: hashtags || [],
        privacy: validPrivacy,
      };
      // Remove undefined values
      Object.keys(fullPostData).forEach(key => {
        if (fullPostData[key as keyof typeof fullPostData] === undefined) {
          delete fullPostData[key as keyof typeof fullPostData];
        }
      });
      // FINAL SANITIZATION: Double-check media_url
      if (fullPostData.media_url && Array.isArray(fullPostData.media_url)) {
        fullPostData.media_url = fullPostData.media_url[0] || null;
      }
      // Use Django API directly
      const response = await fetch('http://localhost:8080/api/posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(fullPostData),
      });
      if (response.ok) {
        toast.success('Beitrag erfolgreich erstellt');
        setShowCreateModal(false);
        if (profile?.id) {
          localStorage.setItem('newPostCreated', JSON.stringify({
            authorId: profile.id.toString(),
            timestamp: Date.now()
          }));
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'newPostCreated',
            newValue: JSON.stringify({
              authorId: profile.id.toString(),
              timestamp: Date.now()
            })
          }));
        }
        window.dispatchEvent(new Event('refreshFeed'));
        return true;
      } else {
        // Fehlertext aus Response extrahieren, falls HTML
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          // Intentionally left empty: fallback to generic error message if response.text() fails
        }
        toast.error('Fehler beim Erstellen des Beitrags: ' + errorText);
        return false;
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen des Beitrags: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
      return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-100">
      {/* Hauptnavigation oben */}
      <Navbar />
      <div className="flex flex-1">
        {/* Left Sidebar (Desktop) */}
        {!isMobile && (
          <div className="w-64 fixed top-14 left-0 bottom-0 z-20 bg-dark-200/95 backdrop-blur-sm border-r border-white/5 overflow-auto hide-scrollbar hidden lg:block">
            <LeftSidebar />
          </div>
        )}
        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 bg-dark-200 lg:hidden overflow-auto hide-scrollbar"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                <Logo />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowMobileMenu(false)}
                >
                  <X size={24} />
                </Button>
              </div>
              <div className="p-4">
                <LeftSidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Main Content */}
        <main className={`flex-1 ${!isMobile ? 'lg:ml-64' : ''} ${!hideRightSidebar && !isMobile ? 'lg:mr-64' : ''} pt-14`}>
          {/* Top Navbar (Mobile) */}
          {isMobile && (
            <div className="sticky top-14 z-10 bg-dark-200/80 backdrop-blur-md border-b border-white/5 px-4 py-2 flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu size={24} />
              </Button>
              <Logo />
              <div className="flex items-center gap-2">
                <Link to="/notifications">
                  <Button variant="ghost" size="icon">
                    <Bell size={20} />
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="ghost" size="icon">
                    <MessageSquare size={20} />
                  </Button>
                </Link>
              </div>
            </div>
          )}
          {/* Content container */}
          <div className="container mx-auto max-w-[700px] px-4 py-6 relative hide-scrollbar">
            {/* Sticky StoriesSection (nur Desktop) */}
            {!hideStoriesAndCreatePostBox && !isMobile && (
              <div className="sticky top-0 z-30 mb-4">
                <StoriesSection />
              </div>
            )}
            {/* Sticky CreatePostBox (nur Desktop) */}
            {!hideStoriesAndCreatePostBox && !isMobile && (
              <div className="sticky top-[120px] z-20 mb-6"> {/* 120px = Höhe der StoriesSection + Margin */}
                <CreatePostBoxFacebook onCreatePost={handleCreatePost} darkMode={theme === 'dark'} />
              </div>
            )}
            {/* Mobile: Stories und CreatePostBox normal */}
            {!hideStoriesAndCreatePostBox && isMobile && (
              <>
                <div className="mb-4">
                  <StoriesSection />
                </div>
                <div className="mb-6">
                  <CreatePostBoxFacebook onCreatePost={handleCreatePost} darkMode={theme === 'dark'} />
                </div>
              </>
            )}
            {/* Main Feed Content */}
            <div className="relative">
              {children}
            </div>
            {/* Floating create button (Mobile) */}
            {isMobile && (
              <FloatingCreateButton onClick={() => setShowCreateModal(true)} />
            )}
            {/* Floating mining button (Mobile and Desktop) */}
            <FloatingMiningButton />
          </div>
        </main>
        {/* Right Sidebar (Desktop) */}
        {!hideRightSidebar && !isMobile && (
          <div className="w-64 fixed top-14 right-0 bottom-0 z-20 bg-dark-200/95 backdrop-blur-sm border-l border-white/5 overflow-auto hide-scrollbar hidden lg:block">
            <RightSidebar />
          </div>
        )}
        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handleCreatePost}
        />
      </div>
    </div>
  );
};

export default FeedLayout;
export { FeedLayout };


