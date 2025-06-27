import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Users, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useUserSearch, SearchUser } from '@/hooks/useUserSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// TODO: Diese Komponente muss auf Django-API migriert werden. useMessages wurde entfernt.
import { useAuth } from '@/context/AuthContext';

interface CreateConversationViewProps {
  handleBackToList: () => void;
  isMobile: boolean;
  theme: string;
}

const CreateConversationView: React.FC<CreateConversationViewProps> = ({
  handleBackToList,
  isMobile,
  theme
}) => {
  const navigate = useNavigate();
  const { user: profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { users, isLoading, searchUsers, findRelatedUsers } = useUserSearch();
  const [suggestedUsers, setSuggestedUsers] = useState<SearchUser[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // TODO: Diese Komponente muss auf Django-API migriert werden. useMessages wurde entfernt.
  const { createConversation } = useMessages(null);

  // Load suggested users if no search query
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!profile) return;
      
      setLoadingSuggestions(true);
      try {
        const related = await findRelatedUsers(profile.id);
        setSuggestedUsers(related || []);
      } catch (error) {
        console.warn('Fehler beim Laden der Vorschläge:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    if (!searchQuery.trim()) {
      loadSuggestions();
    }
  }, [profile, findRelatedUsers, searchQuery]);

  // Handle search input change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchUsers]);

  const handleStartConversation = async (userId: string) => {
    if (!profile) {
      toast.error('Du musst angemeldet sein, um Nachrichten zu senden');
      return;
    }
    
    try {
      const conversation = await createConversation(userId);
      if (conversation) {
        navigate(`/messages/${conversation.id}`);
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen der Konversation');
    }
  };
  
  const displayUsers = searchQuery.trim() ? users : suggestedUsers;
  const isSearching = searchQuery.trim().length > 0;
  
  return (
    <motion.div
      initial={isMobile ? { x: 300, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full md:w-2/3 flex flex-col`}
    >
      <div className="p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBackToList}
          className="md:hidden"
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-lg font-semibold">Neue Nachricht</h2>
      </div>
      
      <Separator />
      
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Benutzern..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {(isLoading || loadingSuggestions) ? (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Suche läuft...</span>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={40} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">
              {isSearching 
                ? 'Keine Benutzer für diese Suche gefunden' 
                : 'Beginne eine Nachricht an einen Benutzer'}
            </p>
          </div>
        ) : (
          <div>
            <div className="p-3 text-sm text-gray-500">
              {isSearching ? 'Suchergebnisse' : 'Vorschläge'}
            </div>
            {displayUsers.map(user => (
              <div 
                key={user.id}
                className={`p-4 flex items-center gap-3 hover:bg-${theme === 'dark' ? 'gray-800' : 'gray-100'} cursor-pointer transition-colors`}
                onClick={() => handleStartConversation(user.id)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-500/80 to-secondary-600/80">
                    {(user.display_name || user.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.display_name || user.username}</div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CreateConversationView;
