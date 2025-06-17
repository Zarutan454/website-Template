
import React, { useState, useEffect } from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import FloatingCreateButton from './FloatingCreateButton';
import CreatePostModal from './CreatePostModal';
import { Search, Bell, MessageSquare, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { type CreatePostData } from '@/types/posts';
import { usePosts } from '@/hooks/usePosts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider';
import { useMining } from '@/hooks/useMining';
import Logo from '@/components/Logo';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { FloatingMiningButton } from '@/components/mining';

interface FeedLayoutProps {
  children: React.ReactNode;
  hideRightSidebar?: boolean;
}

// Export as both default and named export to support both import styles
const FeedLayout: React.FC<FeedLayoutProps> = ({ children, hideRightSidebar = false }) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingPostData, setPendingPostData] = useState<CreatePostData | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { createPost } = usePosts();
  const { profile } = useProfile();
  const { theme } = useTheme();
  const { syncMiningState } = useMining();
  const navigate = useNavigate();

  useEffect(() => {
    if (syncMiningState) {
      syncMiningState().then(status => {
      });
    }
  }, [syncMiningState]);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (syncMiningState) {
        syncMiningState().then(status => {
          console.log("FeedLayout: Periodic sync completed");
        });
      }
    }, 60000); // Sync every minute
    
    return () => clearInterval(syncInterval);
  }, [syncMiningState]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Erfolgreich abgemeldet');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Fehler beim Abmelden');
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
          <div className="container mx-auto max-w-4xl px-4 py-6 relative hide-scrollbar">
            {/* Main content */}
            {children}
            
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
          pendingPostData={pendingPostData}
          onPostCreated={(data) => createPost(data)}
        />
      </div>
    </div>
  );
};

export default FeedLayout;
export { FeedLayout };
