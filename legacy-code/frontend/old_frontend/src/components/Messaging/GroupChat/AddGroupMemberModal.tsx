import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Users, Search, Loader2, UserPlus, Check } from 'lucide-react';
import { useGroupChat } from '../../../hooks/useGroupChat';
import { useUserSearch } from '../../../hooks/useMessages';
import { ScrollArea } from '../../ui/scroll-area';
import { toast } from 'sonner';

interface AddGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

const AddGroupMemberModal: React.FC<AddGroupMemberModalProps> = ({
  isOpen,
  onClose,
  groupId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { searchUsers } = useUserSearch();
  const { addMember, members } = useGroupChat(groupId);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      
      const existingMemberIds = members?.map(m => m.user_id) || [];
      const filteredResults = results.filter(user => !existingMemberIds.includes(user.id));
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Fehler bei der Benutzersuche');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };
  
  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Bitte wähle mindestens einen Benutzer aus');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedUsers.map(userId => 
          addMember.mutateAsync({ groupId, userId })
        )
      );
      
      toast.success(`${selectedUsers.length} Mitglied${selectedUsers.length > 1 ? 'er' : ''} hinzugefügt`);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error('Fehler beim Hinzufügen der Mitglieder');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} />
            Mitglieder hinzufügen
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Benutzer suchen..."
                className="pr-8"
              />
              {isSearching ? (
                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!searchQuery.trim() || isSearching}
            >
              Suchen
            </Button>
          </div>
          
          <ScrollArea className="h-[250px] rounded-md border">
            {searchResults.length > 0 ? (
              <div className="p-2 space-y-2">
                {searchResults.map(user => (
                  <div 
                    key={user.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                      selectedUsers.includes(user.id) ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ''} alt={user.username || ''} />
                        <AvatarFallback>
                          {user.display_name?.charAt(0) || user.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.display_name || user.username || 'Unbekannt'}
                        </span>
                        {user.username && (
                          <span className="text-xs text-muted-foreground">
                            @{user.username}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      selectedUsers.includes(user.id) 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {selectedUsers.includes(user.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Keine Benutzer gefunden</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8 opacity-50" />
                  <p>Suche nach Benutzern, um sie zur Gruppe hinzuzufügen</p>
                </div>
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length} Benutzer ausgewählt
            </span>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button 
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Hinzufügen...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Hinzufügen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupMemberModal;
