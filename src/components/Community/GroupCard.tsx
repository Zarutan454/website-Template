import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, MessageSquare, Calendar, Check, UserMinus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Group, useGroup } from '@/hooks/useGroups';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const { joinGroup, leaveGroup, isJoining, isLeaving } = useGroup(group.id);

  const handleAction = (e: React.MouseEvent, action: 'join' | 'leave') => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Du musst angemeldet sein, um diese Aktion auszuführen.");
      return;
    }

    if (action === 'join') {
      joinGroup();
    } else {
      leaveGroup();
    }
  };

  const isLoading = isJoining || isLeaving;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/community/group/${group.id}`} className="block h-full">
        <Card className={`${theme === 'dark' ? 'bg-dark-100 hover:bg-dark-200 border-gray-800' : 'bg-white hover:bg-gray-50 border-gray-200'} overflow-hidden transition-all duration-200 h-full flex flex-col`}>
          <div 
            className="h-24 bg-cover bg-center" 
            style={{ 
              backgroundImage: group.banner_url 
                ? `url(${group.banner_url})` 
                : `linear-gradient(to right, ${theme === 'dark' ? '#1f2937, #111827' : '#f3f4f6, #e5e7eb'})`
            }}
          ></div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-background -mt-8">
                {group.avatar_url ? (
                  <AvatarImage src={group.avatar_url} alt={group.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700">
                    {group.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className={`text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{group.name}</CardTitle>
                <CardDescription className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {group.privacy === 'private' ? 'Privat' : 'Öffentlich'} • {group.member_count} {group.member_count === 1 ? 'Mitglied' : 'Mitglieder'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
              {group.description || 'Keine Beschreibung'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-2">
            <div className="flex items-center text-xs gap-3">
              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <MessageSquare size={14} />
                {group.posts_count || 0}
              </span>
              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar size={14} />
                {new Date(group.created_at).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <Button 
              variant={group.is_member ? "outline" : "default"}
              size="sm" 
              className={`p-2 h-auto transition-opacity ${isLoading ? 'opacity-50' : ''}`}
              onClick={(e) => handleAction(e, group.is_member ? 'leave' : 'join')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : group.is_member ? (
                <UserMinus size={16} />
              ) : (
                <UserPlus size={16} />
              )}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default GroupCard;
