
import React, { useState } from 'react';
import { Image, Gift, Send } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type CreatePostData } from '@/types/posts';

interface CreatePostBoxProps {
  darkMode?: boolean;
  onCreatePost: (postData: CreatePostData) => void;
  initialContent?: string;
}

const CreatePostBox: React.FC<CreatePostBoxProps> = ({ 
  darkMode = true, 
  onCreatePost,
  initialContent = ''
}) => {
  const { profile } = useProfile();
  const [content, setContent] = useState(initialContent);

  if (!profile) return null;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onCreatePost({ content });
      setContent('');
    }
  };

  return (
    <div className={`${darkMode ? 'bg-dark-200' : 'bg-white'} rounded-xl p-6 mb-6 border ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors duration-300`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-600 text-white">
            {getInitials(profile.display_name || profile.username)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            placeholder={`Was machst du gerade, ${profile.display_name || profile.username}?`}
            className={`border ${darkMode ? 'bg-dark-100 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'} rounded-md p-3 w-full mb-3 min-h-[100px]`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-gray-400 hover:text-green-400 transition-colors">
                <Image size={16} className="mr-2" />
                <span className="hidden sm:inline">Foto/Video</span>
              </Button>
              <Button variant="outline" size="sm" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Gift size={16} className="mr-2" />
                <span className="hidden sm:inline">Airdrop</span>
              </Button>
            </div>
            
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Posten
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostBox;
