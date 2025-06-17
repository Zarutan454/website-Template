
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const RecentActivityWidget: React.FC = () => {
  // Beispiel-Netzwerkaktivitäten - sollten später durch echte Daten ersetzt werden
  const networkActivities = [
    { 
      id: 1, 
      type: 'comment', 
      user: { name: 'Maria Schmidt', avatar: null, initials: 'MS' }, 
      content: 'hat deinen Beitrag kommentiert',
      postTitle: 'Meine Gedanken zu BSN Mining...',
      timestamp: new Date(Date.now() - 1800000)
    },
    { 
      id: 2, 
      type: 'like', 
      user: { name: 'Thomas Müller', avatar: null, initials: 'TM' }, 
      content: 'hat deinen Beitrag geliked',
      postTitle: 'Neues Feature auf BSN entdeckt!',
      timestamp: new Date(Date.now() - 3600000)
    },
    { 
      id: 3, 
      type: 'follow', 
      user: { name: 'Julia Weber', avatar: null, initials: 'JW' }, 
      content: 'folgt dir jetzt',
      postTitle: '',
      timestamp: new Date(Date.now() - 7200000)
    },
    { 
      id: 4, 
      type: 'comment', 
      user: { name: 'Markus Becker', avatar: null, initials: 'MB' }, 
      content: 'hat deinen Beitrag kommentiert',
      postTitle: 'Meine ersten NFTs auf BSN',
      timestamp: new Date(Date.now() - 10800000)
    }
  ];

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `Vor ${diffMinutes} Minute${diffMinutes > 1 ? 'n' : ''}`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `Vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
    }
  };

  return (
    <Card className="bg-dark-100 border-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-white">Netzwerk-Aktivitäten</CardTitle>
        <CardDescription>Interaktionen aus deinem Netzwerk</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {networkActivities.map((activity) => (
            <div key={activity.id} className="flex items-start p-3 bg-dark-200 rounded-lg">
              <Avatar className="h-10 w-10 mr-3">
                {activity.user.avatar ? (
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                ) : null}
                <AvatarFallback className="bg-dark-300 text-white">
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="font-medium text-white mr-2">{activity.user.name}</span>
                  {activity.type === 'comment' && <MessageSquare size={14} className="text-primary-400" />}
                  {activity.type === 'like' && <ThumbsUp size={14} className="text-primary-400" />}
                  {activity.type === 'follow' && <User size={14} className="text-primary-400" />}
                </div>
                <p className="text-sm text-gray-400">
                  {activity.content} 
                  {activity.postTitle && <span className="italic"> "{activity.postTitle}"</span>}
                </p>
                <div className="text-xs text-gray-500 mt-1">{formatTime(activity.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
