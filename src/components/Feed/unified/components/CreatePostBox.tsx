import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

interface CreatePostBoxProps {
  darkMode?: boolean;
  onOpenCreateModal: () => void;
}

const CreatePostBox: React.FC<CreatePostBoxProps> = ({
  darkMode = false,
  onOpenCreateModal
}) => {
  const { user: profile } = useAuth();
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <Card className={`w-full ${darkMode ? 'bg-dark-200 border-gray-800' : 'bg-white'}`}>
      <CardContent className="pt-4">
        <div 
          onClick={onOpenCreateModal}
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors"
        >
          <Avatar className="h-10 w-10">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.display_name || 'User'} />
            ) : null}
            <AvatarFallback>
              {getInitials(profile?.display_name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-muted-foreground">
            Was gibt's Neues?
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostBox;
