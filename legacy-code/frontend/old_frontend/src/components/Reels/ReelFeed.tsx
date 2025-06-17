import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useReels } from '../../hooks/useReels';
import { useProfile } from '../../hooks/useProfile';
import ReelCard from './ReelCard';
import ReelCreator from './ReelCreator';

interface ReelFeedProps {
  className?: string;
  userId?: string; // Optional: to show only reels from a specific user
}

const ReelFeed: React.FC<ReelFeedProps> = ({ className = '', userId }) => {
  const { reels, isLoadingReels, getUserReels, activeReelIndex, setActiveReelIndex } = useReels();
  const { profile } = useProfile();
  const [isReelCreatorOpen, setIsReelCreatorOpen] = useState(false);
  const [userReels, setUserReels] = useState<any[]>([]);
  const [isLoadingUserReels, setIsLoadingUserReels] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const loadUserReels = async () => {
      if (userId) {
        setIsLoadingUserReels(true);
        try {
          const data = await getUserReels(userId);
          setUserReels(data);
        } catch (error) {
          console.error('Error loading user reels:', error);
        } finally {
          setIsLoadingUserReels(false);
        }
      }
    };
    
    loadUserReels();
  }, [userId, getUserReels]);
  
  const displayReels = userId ? userReels : reels;
  const isLoading = userId ? isLoadingUserReels : isLoadingReels;
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!feedRef.current || !displayReels || displayReels.length === 0) return;
    
    const { scrollTop, clientHeight } = e.currentTarget;
    const reelHeight = clientHeight;
    const newIndex = Math.round(scrollTop / reelHeight);
    
    if (newIndex !== activeReelIndex && newIndex >= 0 && newIndex < displayReels.length) {
      setActiveReelIndex(newIndex);
    }
  };
  
  const handleNextReel = () => {
    if (!feedRef.current || !displayReels) return;
    
    const nextIndex = Math.min(activeReelIndex + 1, displayReels.length - 1);
    setActiveReelIndex(nextIndex);
    
    feedRef.current.scrollTo({
      top: nextIndex * feedRef.current.clientHeight,
      behavior: 'smooth'
    });
  };
  
  const handlePrevReel = () => {
    if (!feedRef.current) return;
    
    const prevIndex = Math.max(activeReelIndex - 1, 0);
    setActiveReelIndex(prevIndex);
    
    feedRef.current.scrollTo({
      top: prevIndex * feedRef.current.clientHeight,
      behavior: 'smooth'
    });
  };
  
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!displayReels || displayReels.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <p className="text-muted-foreground text-center mb-2">
          {userId 
            ? 'Dieser Nutzer hat noch keine Reels erstellt'
            : 'Keine Reels verfügbar'}
        </p>
        {profile && (!userId || userId === profile.id) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setIsReelCreatorOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Reel erstellen
          </Button>
        )}
        
        <ReelCreator 
          isOpen={isReelCreatorOpen} 
          onClose={() => setIsReelCreatorOpen(false)} 
        />
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      {/* Create reel button */}
      {profile && (!userId || userId === profile.id) && (
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsReelCreatorOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Reel erstellen
          </Button>
        </div>
      )}
      
      {/* Reels feed */}
      <div 
        ref={feedRef}
        className="h-full overflow-y-auto snap-y snap-mandatory"
        onScroll={handleScroll}
      >
        {displayReels.map((reel, index) => (
          <div 
            key={reel.id} 
            className="h-full w-full snap-start snap-always"
          >
            <ReelCard 
              reel={reel} 
              isActive={index === activeReelIndex}
              onNext={handleNextReel}
              onPrev={handlePrevReel}
            />
          </div>
        ))}
      </div>
      
      <ReelCreator 
        isOpen={isReelCreatorOpen} 
        onClose={() => setIsReelCreatorOpen(false)} 
      />
    </div>
  );
};

export default ReelFeed;
