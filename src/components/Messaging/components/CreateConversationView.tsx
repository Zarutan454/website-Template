import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Users, Search, Loader2, UserPlus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useUserSearch, SearchUser } from '@/hooks/useUserSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '../../../utils/api';

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
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null);

  // Hilfsfunktion zum Erstellen einer neuen Konversation
  const createConversation = async (userId: string) => {
    try {
      const response = await api.post('/messaging/conversations/', {
        participant_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Konversation:', error);
      throw error;
    }
  };

  // Load suggested users if no search query
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!profile) return;
      
      setLoadingSuggestions(true);
      try {
        const related = await findRelatedUsers(String(profile.id));
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
    
    setCreatingConversation(userId);
    try {
      const conversation = await createConversation(userId);
      if (conversation) {
        toast.success('Konversation erstellt!');
        navigate(`/messages/${conversation.id}`);
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen der Konversation');
    } finally {
      setCreatingConversation(null);
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
      className="w-full min-w-[340px] max-w-[400px] flex flex-col h-full bg-transparent"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-transparent">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBackToList}
          className="md:hidden"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Neue Nachricht</h2>
          <p className="text-sm text-gray-500">Wähle einen Benutzer aus</p>
        </div>
      </div>
      {/* Search Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-transparent">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Benutzern..."
            className="pl-9 pr-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      {/* User List / Empty State */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        {(isLoading || loadingSuggestions) ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <span className="text-gray-500">Suche läuft...</span>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 w-full">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-300 mb-2">Beginne eine Konversation</h3>
            <p className="text-gray-400 dark:text-gray-500 max-w-xs mx-auto mb-4">
              Suche nach Benutzern, um eine neue Nachricht zu starten
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isSearching ? 'Suchergebnisse' : 'Vorschläge'}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {displayUsers.length} {displayUsers.length === 1 ? 'Benutzer' : 'Benutzer'}
                </Badge>
              </div>
            </div>
            <div className="space-y-1 px-2 pb-4">
              {displayUsers.map(user => {
                const isCreating = creatingConversation === user.id;
                return (
                  <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 ${
                      isCreating ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                    onClick={() => !isCreating && handleStartConversation(user.id)}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary-500/80 to-secondary-600/80 text-white font-medium">
                        {(user.display_name || user.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {user.display_name || user.username}
                        </span>
                        {user.is_verified && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        @{user.username}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isCreating ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <UserPlus size={16} />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CreateConversationView;
