import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

const FollowersModal: React.FC<FollowersModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  type 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {type === 'followers' ? 'Follower' : 'Following'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>{type === 'followers' ? 'Follower' : 'Following'}-Liste wird bald verfügbar sein</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Schließen</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowersModal;
