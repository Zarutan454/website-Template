
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCw } from 'lucide-react';
import { Media } from '@/types/media';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MediaContentProps {
  media: Media;
  onLoad: () => void;
  className?: string;
  onNext?: () => void;
  onPrev?: () => void;
  onClose?: () => void;
}

const ZOOM_STEP = 0.5;
const MAX_ZOOM = 4;
const MIN_ZOOM = 1;
const ROTATION_STEP = 90;

const MediaContent: React.FC<MediaContentProps> = ({ 
  media, 
  onLoad, 
  className, 
  onNext, 
  onPrev, 
  onClose 
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaCache = useRef<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map());
  
  // Reset state when media changes
  useEffect(() => {
    setScale(MIN_ZOOM);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsLoaded(false);

    // Check cache for media
    const cachedMedia = mediaCache.current.get(media.url);
    if (cachedMedia) {
      if (cachedMedia instanceof HTMLImageElement && cachedMedia.complete) {
        onLoad();
        setIsLoaded(true);
      }
    }
  }, [media.id, media.url, onLoad]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (onPrev && scale === 1) onPrev();
          break;
        case 'ArrowRight':
          if (onNext && scale === 1) onNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
          handleRotate();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen && document.fullscreenElement) {
            document.exitFullscreen();
          } else if (onClose) {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose, scale, isFullscreen]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
      if (newScale === MIN_ZOOM) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + ROTATION_STEP) % 360);
  }, []);

  const handleMediaLoad = useCallback((e: React.SyntheticEvent) => {
    onLoad();
    setIsLoaded(true);
    mediaCache.current.set(media.url, e.target as HTMLImageElement | HTMLVideoElement);
  }, [media.url, onLoad]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Reset position when scale is 1
  useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const renderVideo = () => (
    <div className="relative w-full h-full flex items-center justify-center">
      <video
        src={media.url}
        className="max-h-full max-w-full object-contain"
        controls
        autoPlay
        muted
        playsInline
        onLoadedData={handleMediaLoad}
      />
    </div>
  );

  const renderImage = () => (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full flex items-center justify-center overflow-hidden", className)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gray-700 rounded-lg w-full h-full" />
        </div>
      )}
      <img
        src={media.url}
        alt={media.title || "Media"}
        className={cn(
          "transition-transform duration-150 select-none",
          isLoaded ? 'opacity-100' : 'opacity-0',
          isDragging ? "transition-none" : ""
        )}
        style={{
          transform: `
            scale(${scale}) 
            translate(${position.x / scale}px, ${position.y / scale}px)
            rotate(${rotation}deg)
          `,
          maxHeight: '100%',
          maxWidth: '100%',
          objectFit: 'contain',
          touchAction: 'none'
        }}
        onLoad={handleMediaLoad}
        draggable={false}
        loading="lazy"
      />
      
      <div className="absolute bottom-4 right-4 flex space-x-2 bg-black/50 rounded-lg p-1 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRotate}
          className="text-white h-8 w-8 hover:bg-white/20"
          aria-label="Rotate image"
        >
          <RotateCw size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={scale <= 1}
          className="text-white h-8 w-8 hover:bg-white/20"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={scale >= 4}
          className="text-white h-8 w-8 hover:bg-white/20"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="text-white h-8 w-8 hover:bg-white/20"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </Button>
      </div>
      
      {/* Image metadata */}
      {(media.title || media.description) && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          {media.title && (
            <h3 className="text-white text-sm font-medium">{media.title}</h3>
          )}
          {media.description && (
            <p className="text-white/80 text-xs mt-1">{media.description}</p>
          )}
        </div>
      )}
    </div>
  );

  return media.type === 'video' ? renderVideo() : renderImage();
};

export default MediaContent;
