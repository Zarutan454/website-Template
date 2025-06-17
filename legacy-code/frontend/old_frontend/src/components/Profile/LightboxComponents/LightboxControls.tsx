
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Download, Info, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LightboxControlsProps {
  showControls: boolean;
  currentIndex: number;
  totalItems: number;
  onClose: () => void;
  onDownload: () => Promise<void>;
  onPrevious: () => void;
  onNext: () => void;
  onInfoToggle?: () => void;
  onShareClick?: () => void;
  mediaUrl: string;
  mediaTitle?: string;
  className?: string;
  controlsPosition?: 'top' | 'center';
}

const LightboxControls: React.FC<LightboxControlsProps> = ({
  showControls,
  currentIndex,
  totalItems,
  onClose,
  onDownload,
  onPrevious,
  onNext,
  onInfoToggle,
  onShareClick,
  mediaUrl,
  mediaTitle,
  className,
  controlsPosition = 'top'
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const buttonClass = "rounded-full bg-black/30 hover:bg-black/50 text-white";

  const handleDownload = async () => {
    try {
      setDownloadProgress(0);
      await onDownload();
    } catch (error) {
    } finally {
      setDownloadProgress(null);
    }
  };

  const handleShare = async () => {
    if (onShareClick) {
      onShareClick();
      return;
    }
    
    try {
      setIsSharing(true);
      if (navigator.share) {
        await navigator.share({
          title: mediaTitle || 'Media',
          url: mediaUrl,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(mediaUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
    } finally {
      setIsSharing(false);
    }
  };

  if (!showControls) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "absolute right-4 z-20 flex space-x-2",
          controlsPosition === 'top' ? 'top-4' : 'top-1/2 -translate-y-1/2',
          className
        )}
      >
        <Button 
          size="icon" 
          variant="ghost" 
          className={buttonClass}
          onClick={handleShare}
          disabled={isSharing}
          aria-label="Share media"
        >
          {isSharing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
        </Button>
        
        {onInfoToggle && (
          <Button 
            size="icon" 
            variant="ghost" 
            className={buttonClass}
            onClick={onInfoToggle}
            aria-label="Show info"
          >
            <Info className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          size="icon" 
          variant="ghost" 
          className={buttonClass}
          onClick={handleDownload}
          disabled={downloadProgress !== null}
          aria-label="Download media"
        >
          {downloadProgress !== null ? (
            <div className="relative h-5 w-5">
              <div 
                className="absolute inset-0 rounded-full border-2 border-white"
                style={{
                  background: `conic-gradient(white ${downloadProgress * 100}%, transparent 0)`
                }}
              />
            </div>
          ) : (
            <Download className="h-5 w-5" />
          )}
        </Button>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className={buttonClass}
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X className="h-5 w-5" />
        </Button>
      </motion.div>
      
      {currentIndex > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20"
        >
          <Button 
            size="icon" 
            variant="ghost" 
            className={buttonClass}
            onClick={onPrevious}
            aria-label="Previous image"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
      
      {currentIndex < totalItems - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20"
        >
          <Button 
            size="icon" 
            variant="ghost" 
            className={buttonClass}
            onClick={onNext}
            aria-label="Next image"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </>
  );
};

export default LightboxControls;
