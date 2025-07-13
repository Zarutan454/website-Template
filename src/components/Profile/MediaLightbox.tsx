
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Media } from '@/types/media';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useMobile } from '@/hooks/use-mobile';
import { 
  LightboxControls, 
  MediaContent, 
  LoadingIndicator,
  InfoOverlay 
} from './LightboxComponents';

interface MediaLightboxProps {
  media: Media[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  isMobile?: boolean;
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  isMobile: propIsMobile
}) => {
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showShareUI, setShowShareUI] = useState(false);
  const detectedIsMobile = useMobile();
  
  // Use prop value if provided, otherwise use the detected value
  const isMobile = propIsMobile !== undefined ? propIsMobile : detectedIsMobile;

  // Toggle controls visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Reset loading state when media changes
  useEffect(() => {
    setLoading(true);
    setShowInfo(false);
    setShowShareUI(false);
  }, [currentIndex]);

  useEffect(() => {
    // Add keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          if (showInfo) {
            setShowInfo(false);
          } else {
            onClose();
          }
          break;
        case 'i':
          toggleInfo();
          break;
        case 's':
          toggleShareUI();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showInfo, showShareUI]);

  // Navigation functions
  const navigateToNext = () => {
    if (currentIndex < media.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleDownload = async (): Promise<void> => {
    const currentMedia = media[currentIndex];
    if (!currentMedia) return;

    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `media-${currentMedia.id}${currentMedia.type === 'video' ? '.mp4' : '.jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  };

  const toggleInfo = () => {
    setShowInfo(prev => !prev);
    if (showShareUI) setShowShareUI(false);
  };

  const toggleShareUI = () => {
    setShowShareUI(prev => !prev);
    if (showInfo) setShowInfo(false);
  };

  const handleShareClick = () => {
    if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: currentMedia?.title || 'BSN Media',
        url: currentMedia?.url
      }).catch(error => {
        toggleShareUI();
      });
    } else {
      // Fallback to our custom UI
      toggleShareUI();
    }
  };

  const currentMedia = media[currentIndex];
  
  if (!currentMedia || !isOpen) return null;

  const renderMediaContent = () => (
    <div 
      className="relative w-full h-full flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Loading indicator */}
      {loading && <LoadingIndicator message="Wird geladen..." />}
      
      {/* Media content */}
      <MediaContent 
        media={currentMedia} 
        onLoad={handleImageLoad} 
        onNext={navigateToNext}
        onPrev={navigateToPrevious}
        onClose={onClose}
      />
      
      {/* Navigation controls */}
      <AnimatePresence>
        <LightboxControls 
          showControls={showControls}
          currentIndex={currentIndex}
          totalItems={media.length}
          onClose={onClose}
          onDownload={handleDownload}
          onPrevious={navigateToPrevious}
          onNext={navigateToNext}
          onInfoToggle={toggleInfo}
          onShareClick={handleShareClick}
          mediaUrl={currentMedia.url}
          mediaTitle={currentMedia.title}
        />
      </AnimatePresence>
      
      {/* Info overlay */}
      <InfoOverlay 
        media={currentMedia}
        isVisible={showInfo}
        onClose={() => setShowInfo(false)}
        onDownload={handleDownload}
      />
    </div>
  );

  // Use Drawer component for mobile devices
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={open => !open && onClose()}>
        <DrawerContent 
          className="p-0 max-h-[90vh]"
          onClose={onClose}
        >
          <div className="w-full h-[80vh] bg-black flex items-center justify-center">
            {renderMediaContent()}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Use Dialog for desktop
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
        {renderMediaContent()}
      </DialogContent>
    </Dialog>
  );
};

export default MediaLightbox;
