import React from 'react';
// import { useGroupChat, ChatGroup } from '../../../hooks/useGroupChat';
import { Spinner } from '../../ui/spinner';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Users, Plus, MessageSquare } from 'lucide-react';
import { ScrollArea } from '../../ui/scroll-area';
import { Badge } from '../../ui/badge';
import { format, isToday, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import CreateGroupModal from './CreateGroupModal';

interface GroupChatListProps {
  onSelectGroup: (groupId: string) => void;
  selectedGroupId?: string;
  isMobile: boolean;
}

const GroupChatList: React.FC<GroupChatListProps> = ({ 
  onSelectGroup, 
  selectedGroupId,
  isMobile
}) => {
  // const { groups, isLoadingGroups, createGroup } = useGroupChat();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const handleCreateGroup = async (name: string, description: string, avatarUrl?: string) => {
    try {
      // const newGroup = await createGroup.mutateAsync({ name, description, avatar_url: avatarUrl });
      // onSelectGroup(newGroup.id);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: de });
    } else if (isYesterday(date)) {
      return 'Gestern';
    } else {
      return format(date, 'dd.MM.yy', { locale: de });
    }
  };

  // Fallback: Zeige immer leeren State, bis Gruppen-Logik implementiert ist
  return (
    <motion.div 
      initial={isMobile ? { x: -300, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      <div className="p-3 flex items-center justify-between border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gruppen
        </h2>
        <Button 
          size="sm" 
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Neu
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center p-6">
          <MessageSquare size={40} className="mx-auto mb-4 opacity-50" />
          <p>Keine Gruppen gefunden</p>
          <p className="text-sm mt-2">
            Erstelle eine neue Gruppe, um mit mehreren Personen zu chatten
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Gruppe erstellen
          </Button>
        </div>
      </div>
      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </motion.div>
  );
};

export default GroupChatList;
