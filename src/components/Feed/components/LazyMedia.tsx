import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LazyMediaProps {
  src: string;
  alt: string;
  type: 'image' | 'video' | 'audio';
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

const LazyMedia: React.FC<LazyMediaProps> = ({
  src,
  alt,
  type,
  className = '',
  onLoad,
  onError,
  showControls = true,
  autoPlay = false,
  muted = false,
  loop = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Kombiniere refs
  const setRefs = useCallback((node: HTMLImageElement | HTMLVideoElement | HTMLAudioElement | null) => {
    inViewRef(node);
    if (mediaRef.current !== node) {
      mediaRef.current = node;
    }
  }, [inViewRef]);

  // Media laden wenn sichtbar
  useEffect(() => {
    if (inView && !isLoaded && !isLoading && !error) {
      setIsLoading(true);
    }
  }, [inView, isLoaded, isLoading, error]);

  // Event handlers für Video/Audio
  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    onLoad?.();
    
    if (type === 'video' || type === 'audio') {
      const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
      if (media) {
        setDuration(media.duration);
        if (autoPlay) {
          media.play().catch(console.error);
        }
      }
    }
  }, [type, autoPlay, onLoad]);

  const handleError = useCallback((event: React.SyntheticEvent) => {
    const error = new Error('Media konnte nicht geladen werden');
    setError(error.message);
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  const handleTimeUpdate = useCallback(() => {
    if (type === 'video' || type === 'audio') {
      const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
      if (media) {
        setCurrentTime(media.currentTime);
      }
    }
  }, [type]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (type === 'video' || type === 'audio') {
      const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
      if (media) {
        if (isPlaying) {
          media.pause();
        } else {
          media.play().catch(console.error);
        }
      }
    }
  }, [type, isPlaying]);

  const toggleMute = useCallback(() => {
    if (type === 'video' || type === 'audio') {
      const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
      if (media) {
        media.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  }, [type, isMuted]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Render loading state
  if (!inView) {
    return (
      <div 
        ref={setRefs as React.RefCallback<HTMLDivElement>}
        className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
        style={{ minHeight: '200px' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              setIsLoaded(false);
              setIsLoading(false);
            }}
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  // Render media based on type
  switch (type) {
    case 'image':
      return (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          <img
            ref={setRefs as React.RefCallback<HTMLImageElement>}
            src={src}
            alt={alt}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={handleLoadedData}
            onError={handleError}
            loading="lazy"
          />
        </div>
      );

    case 'video':
      return (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          <video
            ref={setRefs as React.RefCallback<HTMLVideoElement>}
            src={src}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            controls={showControls}
            autoPlay={autoPlay}
            muted={isMuted}
            loop={loop}
            onLoadedData={handleLoadedData}
            onError={handleError}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            preload="metadata"
          />
          {!showControls && (
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={togglePlayPause}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={toggleMute}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
          {!showControls && (
            <div className="absolute bottom-2 left-2 right-16 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          )}
        </div>
      );

    case 'audio':
      return (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          <div className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            <audio
              ref={setRefs as React.RefCallback<HTMLAudioElement>}
              src={src}
              controls={showControls}
              autoPlay={autoPlay}
              muted={isMuted}
              loop={loop}
              onLoadedData={handleLoadedData}
              onError={handleError}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              preload="metadata"
              className="w-full"
            />
            {!showControls && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-gray-600">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default LazyMedia; 