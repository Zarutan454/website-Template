import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '../ui/button';

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration: number;
  waveform?: number[];
  isOwnMessage: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  audioUrl,
  duration,
  waveform = [],
  isOwnMessage,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.addEventListener('loadeddata', () => {
        setAudioLoaded(true);
      });
      
      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true);
        startAnimation();
      });
      
      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false);
        stopAnimation();
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        stopAnimation();
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopAnimation();
    };
  }, [audioUrl]);

  const startAnimation = () => {
    const animate = () => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  const getWaveformBarHeight = (value: number, index: number) => {
    if (waveform.length === 0) return 2;
    
    const normalizedValue = value / 255;
    const baseHeight = 8;
    const maxHeight = 24;
    
    // Create a wave pattern based on index
    const wavePattern = Math.sin((index / waveform.length) * Math.PI * 2);
    const height = baseHeight + (normalizedValue * maxHeight * (0.5 + 0.5 * wavePattern));
    
    return Math.max(2, Math.min(maxHeight, height));
  };

  return (
    <div className={`flex items-center space-x-3 p-2 rounded-lg ${
      isOwnMessage ? 'bg-blue-100' : 'bg-gray-100'
    }`}>
      {/* Play/Pause Button */}
      <Button
        onClick={togglePlayPause}
        variant="ghost"
        size="sm"
        disabled={!audioLoaded}
        className={`w-8 h-8 rounded-full ${
          isOwnMessage ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>

      {/* Waveform Visualization */}
      <div className="flex-1">
        <div className="flex items-center space-x-1 h-6">
          {waveform.length > 0 ? (
            // Use actual waveform data
            waveform.slice(0, 32).map((value, index) => (
              <div
                key={index}
                className={`w-1 rounded ${
                  isOwnMessage ? 'bg-blue-500' : 'bg-gray-500'
                }`}
                style={{
                  height: `${getWaveformBarHeight(value, index)}px`,
                  opacity: isPlaying && index < (currentTime / duration) * waveform.length ? 1 : 0.6,
                }}
              />
            ))
          ) : (
            // Fallback waveform
            Array.from({ length: 32 }, (_, index) => (
              <div
                key={index}
                className={`w-1 rounded ${
                  isOwnMessage ? 'bg-blue-500' : 'bg-gray-500'
                }`}
                style={{
                  height: `${Math.random() * 16 + 4}px`,
                  opacity: isPlaying && index < (currentTime / duration) * 32 ? 1 : 0.6,
                }}
              />
            ))
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div
            className={`h-1 rounded-full transition-all duration-100 ${
              isOwnMessage ? 'bg-blue-500' : 'bg-gray-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Duration Display */}
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <Volume2 className="w-3 h-3" />
        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>

      {/* Loading Indicator */}
      {!audioLoaded && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}
    </div>
  );
}; 