import React from 'react';
import { useVoiceMessage } from '../../../hooks/useVoiceMessage';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceMessagePlayerProps {
  messageId: number;
  duration: number;
  waveform: number[];
  isOwnMessage?: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  messageId,
  duration,
  waveform,
  isOwnMessage = false,
}) => {
  const {
    isPlaying,
    currentPlayingId,
    playVoiceMessage,
    stopPlaying,
    formatDuration,
  } = useVoiceMessage();

  const isCurrentlyPlaying = isPlaying && currentPlayingId === messageId;

  const handlePlayPause = async () => {
    if (isCurrentlyPlaying) {
      stopPlaying();
    } else {
      await playVoiceMessage(messageId);
    }
  };

  // Normalize waveform data for visualization
  const normalizedWaveform = waveform.map((value, index) => {
    const normalized = Math.min(value * 100, 100);
    return Math.max(normalized, 5); // Minimum height of 5px
  });

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
      isOwnMessage ? 'bg-blue-100' : 'bg-gray-100'
    }`}>
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isCurrentlyPlaying
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isCurrentlyPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} />
        )}
      </button>

      {/* Waveform Visualization */}
      <div className="flex-1">
        <div className="flex items-center space-x-1 h-8">
          {normalizedWaveform.map((height, index) => (
            <div
              key={index}
              className={`w-1 rounded-full transition-all duration-300 ${
                isCurrentlyPlaying && index < (normalizedWaveform.length * 0.3)
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
              }`}
              style={{
                height: `${height}%`,
                minHeight: '4px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center space-x-1 text-sm text-gray-600">
        <Volume2 size={14} />
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Playing Indicator */}
      {isCurrentlyPlaying && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-500">Playing</span>
        </div>
      )}
    </div>
  );
}; 