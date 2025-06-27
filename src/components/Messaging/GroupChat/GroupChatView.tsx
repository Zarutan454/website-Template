import React, { useRef, useEffect } from 'react';
// import { useGroupChat } from '../../../hooks/useGroupChat';
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
import { useProfile } from '../../../hooks/useProfile';
import { ScrollArea } from '../../ui/scroll-area';
import { Badge } from '../../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import EnhancedMessageInput from '../EnhancedMessageInput';
import MessageBubble from '../MessageBubble';
import { UploadResult } from '../../../utils/storageUtils';
// import { Message } from '../../../hooks/useMessages';
// TODO: Diese Komponente muss auf Django-API migriert werden. useMessages wurde entfernt.
import { toast } from 'sonner';
// import AddGroupMemberModal from './AddGroupMemberModal';
// TODO: AddGroupMemberModal wurde entfernt, Funktionalität vorübergehend deaktiviert.

interface GroupChatViewProps {
  groupId: string;
}

const GroupChatView: React.FC<GroupChatViewProps> = ({ groupId }) => {
  // const { 
  //   messages, 
  //   isLoadingMessages, 
  //   members, 
  //   isLoadingMembers,
  //   sendGroupMessage,
  //   removeMember,
  //   updateMemberRole,
  //   isAdmin,
  //   getUserRole
  // } = useGroupChat(groupId);
  
  const { user: profile } = useAuth()();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = React.useState(false);
  
  const group = members && members.length > 0 
    ? { id: groupId, name: 'Group Chat' } as ChatGroup 
    : null;
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (content: string, attachment?: UploadResult) => {
    if (!content.trim() && !attachment) return;
    
    try {
      // await sendGroupMessage.mutateAsync({
      //   content: content.trim(),
      //   attachment_url: attachment?.url,
      //   message_type: attachment ? getMessageTypeFromAttachment(attachment) : 'text',
      //   attachment_name: attachment?.name,
      //   attachment_size: attachment?.size,
      //   attachment_type: attachment?.type
      // });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    }
  };
  
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
  
  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Möchtest du dieses Mitglied wirklich entfernen?')) return;
    
    try {
      // await removeMember.mutateAsync({ groupId, userId });
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Fehler beim Entfernen des Mitglieds');
    }
  };
  
  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      // await updateMemberRole.mutateAsync({ groupId, userId, role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Fehler beim Aktualisieren der Rolle');
    }
  };
  
  const renderMemberItem = (member: GroupMember) => {
    const isCurrentUser = member.user_id === profile?.id;
    const memberRole = member.role;
    
    return (
      <div key={member.id} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatar_url || ''} alt={member.username || ''} />
            <AvatarFallback>
              {member.display_name?.charAt(0) || member.username?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {member.display_name || member.username || 'Unbekannt'}
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
                <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, 'admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Zum Admin machen
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, 'member')}>
                  <User className="mr-2 h-4 w-4" />
                  Zum Mitglied machen
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={() => handleRemoveMember(member.user_id)}
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
    <div className="flex flex-col h-full">
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
          {isAdmin() && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mitglied hinzufügen</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
              {isAdmin() && (
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
          <ScrollArea className="flex-1 p-3">
            {messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((message: Message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isGroupChat={true}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Keine Nachrichten in dieser Gruppe</p>
              </div>
            )}
          </ScrollArea>
          
          <EnhancedMessageInput 
            onSendMessage={handleSendMessage}
            isDisabled={!profile}
            placeholder="Nachricht an Gruppe schreiben..."
          />
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
