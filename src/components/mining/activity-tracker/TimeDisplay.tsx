
import React from 'react';
import { Clock } from 'lucide-react';

interface TimeDisplayProps {
  timeElapsed: number;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeElapsed }) => {
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center text-gray-400">
      <Clock className="mr-1 h-4 w-4" />
      <span>Aktive Zeit: {formatTime(timeElapsed)}</span>
    </div>
  );
};

export default TimeDisplay;
