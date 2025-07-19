
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Image, MessageSquare, Video } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.utils';

export type CreatePostMode = 'text' | 'image' | 'video';

interface CreatePostBoxProps {
  darkMode?: boolean;
  onOpenCreateModal: (mode: CreatePostMode) => void;
  placeholder?: string;
}

const CreatePostBox: React.FC<CreatePostBoxProps> = ({
  darkMode = false,
  onOpenCreateModal,
  placeholder = "Was gibt's Neues?"
}) => {
  const { user: profile } = useAuth();
  const avatarUrl = profile?.avatar_url || '/placeholders/user.png';
  const username = profile?.username || 'Anonym';

  return (
    <Card className={`w-full ${darkMode ? 'bg-dark-200 border-gray-800' : 'bg-white'}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <img src={avatarUrl} alt={username} />
          </Avatar>
          <div 
            onClick={() => onOpenCreateModal('text')}
            className={`
              flex-1 h-10 px-4 flex items-center rounded-full cursor-pointer
              ${darkMode ? 'bg-dark-100 hover:bg-dark-50' : 'bg-gray-100 hover:bg-gray-200'}
            `}
          >
            <span className="text-muted-foreground">{placeholder}</span>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1" 
            onClick={() => onOpenCreateModal('image')}
          >
            <Image className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Bild</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1" 
            onClick={() => onOpenCreateModal('video')}
          >
            <Video className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Video</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1" 
            onClick={() => onOpenCreateModal('text')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Text</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostBox;

