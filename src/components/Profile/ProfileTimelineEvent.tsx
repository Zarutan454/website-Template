
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/utils/dateUtils';
import { Trophy, MessageSquare, Coins, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TimelineEvent {
  id: string;
  type: 'post' | 'achievement' | 'token' | 'comment' | 'follow';
  timestamp: string;
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
}

interface ProfileTimelineEventProps {
  event: TimelineEvent;
  onClick?: (event: TimelineEvent) => void;
}

const ProfileTimelineEvent: React.FC<ProfileTimelineEventProps> = ({ event, onClick }) => {
  const getEventIcon = () => {
    switch (event.type) {
      case 'post':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'token':
        return <Coins className="h-5 w-5 text-green-500" />;
      case 'follow':
        return <BadgeCheck className="h-5 w-5 text-purple-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Card 
      className="p-4 border-gray-800/60 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/40 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-gray-800/50 flex-shrink-0">
          {getEventIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{event.title}</h4>
          <p className="text-sm text-gray-400 mt-1">{event.description}</p>
          
          <div className="flex justify-between items-center mt-2">
            <Badge variant="outline" className="text-xs">
              {event.type}
            </Badge>
            <span className="text-xs text-gray-500">{formatRelativeTime(event.timestamp)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileTimelineEvent;
