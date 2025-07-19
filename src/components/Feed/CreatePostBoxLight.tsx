import React from 'react';
import { Image, Gift, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type CreatePostData } from '@/types/posts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CreatePostBoxLightProps {
  darkMode?: boolean;
  onCreatePost: (postData?: Partial<CreatePostData>) => void;
}

// Wir definieren die Buttons als Konfigurationsobjekte für mehr Flexibilität
const POST_ACTION_BUTTONS = [
  { 
    icon: Image, 
    text: 'Foto/Video', 
    action: 'media',
    hoverColor: 'hover:text-green-400'
  },
  { 
    icon: Gift, 
    text: 'Airdrop', 
    action: 'airdrop',
    hoverColor: 'hover:text-yellow-400'
  },
  { 
    icon: Send, 
    text: 'Teilen', 
    action: 'share',
    hoverColor: 'hover:text-blue-400'
  }
];

const CreatePostBoxLight: React.FC<CreatePostBoxLightProps> = ({ 
  darkMode = true, 
  onCreatePost 
}) => {
  const { user: profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Funktion zum Erstellen eines neuen Posts, mit spezifischem Aktionstyp
  const handleClick = (actionType?: string) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um einen Beitrag zu erstellen");
      navigate('/login');
      return;
    }
    
    // Hier setzen wir das action-Attribut als Teil von CreatePostData
    const initialData: Partial<CreatePostData> = actionType ? { action: actionType } : {};
    
    // Zusätzliche Funktionalität je nach Aktionstyp
    if (actionType === 'media') {
      toast.info("Media-Upload wird vorbereitet...");
    } else if (actionType === 'airdrop') {
      toast.info("Airdrop-Funktion wird vorbereitet...");
    } else if (actionType === 'share') {
      toast.info("Teilen-Dialog wird vorbereitet...");
    }
    
    onCreatePost(initialData);
  };

  return (
    <div className={`${darkMode ? 'bg-dark-200' : 'bg-white'} rounded-xl p-4 mb-6 border ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors duration-300`}>
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-600 text-white">
            {getInitials(profile.display_name || profile.username)}
          </AvatarFallback>
        </Avatar>
        <button 
          className={`flex-1 text-left px-4 py-2 rounded-full ${darkMode ? 'bg-dark-100 text-gray-400' : 'bg-gray-100 text-gray-500'} hover:bg-primary-500/10 transition-colors`}
          onClick={() => handleClick()}
          aria-label="Beitrag erstellen"
        >
          Was machst du gerade, {profile.display_name || profile.username}?
        </button>
      </div>
      <div className="flex mt-4 justify-between">
        {POST_ACTION_BUTTONS.map((button, index) => (
          <button 
            key={`post-action-${index}`}
            className={`flex items-center text-gray-400 ${button.hoverColor} transition-colors`}
            onClick={() => handleClick(button.action)}
            aria-label={button.text}
          >
            <button.icon size={20} className="mr-2" />
            <span className="hidden sm:inline">{button.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CreatePostBoxLight;

