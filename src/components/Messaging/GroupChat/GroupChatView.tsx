import React, { useRef, useEffect } from 'react';
import { useMessaging } from '../../../hooks/useMessaging';
// TODO: Diese Komponente muss auf Django-API migriert werden. useGroupChat wurde entfernt.
import { Spinner } from '../../ui/spinner';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Users, UserPlus, MoreVertical, Settings, UserMinus, Shield, User } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../../ui/dropdown-menu';
import { ScrollArea } from '../../ui/scroll-area';
import { Badge } from '../../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import EnhancedMessageInput from '../EnhancedMessageInput';
import MessageBubble from '../MessageBubble';
import { useAuth } from '@/context/AuthContext.utils';
import type { GroupMember } from '@/hooks/useGroups';
import type { Message } from '@/hooks/useMessaging';
import type { UploadResult } from '../../../utils/storageUtils';
// import { Message } from '../../../hooks/useMessages';
// TODO: Diese Komponente muss auf Django-API migriert werden. useMessages wurde entfernt.
import { toast } from 'sonner';
// import AddGroupMemberModal from './AddGroupMemberModal';
// TODO: AddGroupMemberModal wurde entfernt, Funktionalität vorübergehend deaktiviert.

interface GroupChatViewProps {
  groupId: string;
}

const GroupChatView: React.FC<GroupChatViewProps> = ({ groupId }) => {
  const { user: profile } = useAuth(); // useAuth korrekt verwenden
  const {
    getGroupMembers,
    promoteGroupMember,
    demoteGroupMember,
    kickGroupMember,
    uploadGroupFile,
    downloadGroupFile,
    searchGroupMessages,
    getGroupMessages,
    sendGroupMessage,
  } = useMessaging();
  const [members, setMembers] = React.useState<GroupMember[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = React.useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = React.useState(false);

  // Mitglieder laden
  useEffect(() => {
    setIsLoadingMembers(true);
    getGroupMembers(groupId).then(setMembers).finally(() => setIsLoadingMembers(false));
  }, [groupId, getGroupMembers]);

  // Nachrichten laden
  const loadMessages = React.useCallback(() => {
    setIsLoadingMessages(true);
    getGroupMessages(groupId).then(setMessages).finally(() => setIsLoadingMessages(false));
  }, [groupId, getGroupMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Nachrichtensuche
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchGroupMessages(groupId, searchQuery.trim());
    setSearchResults(results);
  };

  // File Upload
  const handleFileUpload = async (file: File) => {
    try {
      await uploadGroupFile(groupId, file);
      loadMessages(); // Nach Upload Nachrichten neu laden
    } catch (error) {
      toast.error('Fehler beim Hochladen der Datei');
    }
  };

  // Nachricht senden
  const handleSendMessage = async (content: string, attachment?: UploadResult) => {
    if (!content.trim() && !attachment) return;
    try {
      await sendGroupMessage(
        groupId,
        content.trim(),
        attachment ? getMessageTypeFromAttachment(attachment) : 'text',
        attachment?.url,
        attachment?.name,
        attachment?.size,
        attachment?.type
      );
      loadMessages();
    } catch (error) {
      toast.error('Fehler beim Senden der Nachricht');
    }
  };

  // Admin Controls
  const handlePromote = async (userId: string) => {
    try {
      await promoteGroupMember(groupId, userId);
      getGroupMembers(groupId).then(setMembers);
    } catch (error) {
      toast.error('Fehler beim Befördern');
    }
  };
  const handleDemote = async (userId: string) => {
    try {
      await demoteGroupMember(groupId, userId);
      getGroupMembers(groupId).then(setMembers);
    } catch (error) {
      toast.error('Fehler beim Herabstufen');
    }
  };
  const handleKick = async (userId: string) => {
    try {
      await kickGroupMember(groupId, userId);
      getGroupMembers(groupId).then(setMembers);
    } catch (error) {
      toast.error('Fehler beim Entfernen');
    }
  };

  // Hilfsfunktion für Rollenprüfung
  const isAdmin = () => {
    const me = members.find(m => m.user.id === profile?.id);
    return me?.role === 'admin' || false;
  };

  // Hilfsfunktion für Attachment-Typ
  const getMessageTypeFromAttachment = (attachment: UploadResult): 'text' | 'image' | 'video' | 'audio' | 'file' => {
    const type = attachment.type.split('/')[0];
    switch (type) {
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'audio':
        return 'audio';
      default:
        return 'file';
    }
  };

  // Member-Rendering angepasst an GroupMember-Interface
  const renderMemberItem = (member: GroupMember) => {
    const isCurrentUser = String(member.user.id) === String(profile?.id);
    const memberRole = member.role;
    return (
      <div key={member.id} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.user.avatar_url || ''} alt={member.user.username || ''} />
            <AvatarFallback>
              {member.user.username?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {member.user.username || 'Unbekannt'}
              {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(Du)</span>}
            </span>
            <div className="flex items-center">
              {memberRole === 'admin' ? (
                <Badge variant="outline" className="text-xs px-1 py-0 h-4 gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Mitglied
                </span>
              )}
            </div>
          </div>
        </div>
        {isAdmin() && !isCurrentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {memberRole === 'member' ? (
                <DropdownMenuItem onClick={() => handlePromote(member.user.id)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Zum Admin machen
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleDemote(member.user.id)}>
                  <User className="mr-2 h-4 w-4" />
                  Zum Mitglied machen
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={() => handleKick(member.user.id)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Entfernen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };
  
  // Ersatz für group-Objekt (da keine eigene Group-API geladen wird)
  const group = {
    id: groupId,
    name: 'Group Chat',
    avatar_url: null,
    membersCount: members.length
  };

  if (isLoadingMessages || isLoadingMembers) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Gruppe nicht gefunden</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full" role="region" aria-label="Gruppenchat">
      {/* Group Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={group.avatar_url || ''} alt={group.name} />
            <AvatarFallback>
              <Users className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium">{group.name}</h3>
            <p className="text-xs text-muted-foreground">
              {members?.length || 0} Mitglieder
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {profile && (
            <EnhancedMessageInput 
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isDisabled={!profile}
              placeholder="Nachricht an Gruppe schreiben..."
            />
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <Users className="mr-2 h-4 w-4" />
                Mitglieder anzeigen
              </DropdownMenuItem>
              {profile && (
                <>
                  <DropdownMenuItem onClick={() => {}}>
                    <Settings className="mr-2 h-4 w-4" />
                    Gruppeneinstellungen
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => {}}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Gruppe verlassen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-3" role="log" aria-label="Nachrichtenliste" aria-live="polite" aria-relevant="additions">
            {messages && messages.length > 0 ? (
              <div role="list" className="space-y-3">
                {messages.map((message: Message) => (
                  <div key={message.id} role="listitem" aria-label={`Nachricht von ${message.sender.display_name || message.sender.username || 'Unbekannt'}`}>
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      isGroupChat={true}
                    />
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">Noch keine Nachrichten</div>
            )}
          </ScrollArea>
          
          {profile && (
            <EnhancedMessageInput 
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isDisabled={!profile}
              placeholder="Nachricht an Gruppe schreiben..."
            />
          )}
        </div>
        
        {/* Members Sidebar */}
        <div className="hidden md:block w-64 border-l overflow-hidden">
          <div className="p-3 border-b">
            <h4 className="font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              Mitglieder ({members?.length || 0})
            </h4>
          </div>
          
          <ScrollArea className="h-[calc(100%-49px)]">
            <div className="p-3 space-y-1">
              {members?.map(renderMemberItem)}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* <AddGroupMemberModal 
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        groupId={groupId}
      /> */}
    </div>
  );
};

export default GroupChatView;

