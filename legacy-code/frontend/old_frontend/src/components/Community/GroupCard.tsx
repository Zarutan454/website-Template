
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, MessageSquare, Calendar, Check, UserMinus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Group } from '@/hooks/useGroups';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { useFollowSystem } from '@/hooks/useFollowSystem';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const [isMember, setIsMember] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Prüfen, ob der aktuelle Benutzer bereits Mitglied der Gruppe ist
    const checkMembership = async () => {
      if (!profile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('id')
          .eq('user_id', profile.id)
          .eq('group_id', group.id)
          .maybeSingle();
          
        if (error) throw error;
        setIsMember(!!data);
      } catch (error) {
      }
    };
    
    checkMembership();
  }, [profile?.id, group.id]);

  const handleJoinGroup = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!profile) {
      toast.error("Du musst angemeldet sein, um einer Gruppe beizutreten");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: profile.id,
          role: 'member'
        });
        
      if (error) {
        // Wenn der Fehler auf einen Constraint verstößt (Benutzer ist bereits Mitglied)
        if (error.code === '23505') {
          toast.info(`Du bist bereits Mitglied der Gruppe "${group.name}"`);
        } else {
          throw error;
        }
      } else {
        setIsMember(true);
        toast.success(`Du bist der Gruppe "${group.name}" beigetreten`);
      }
    } catch (error) {
      toast.error("Fehler beim Beitreten der Gruppe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!profile) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('user_id', profile.id)
        .eq('group_id', group.id);
        
      if (error) throw error;
      
      setIsMember(false);
      toast.success(`Du hast die Gruppe "${group.name}" verlassen`);
    } catch (error) {
      toast.error("Fehler beim Verlassen der Gruppe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/community/group/${group.id}`}>
        <Card className={`${theme === 'dark' ? 'bg-dark-100 hover:bg-dark-200 border-gray-800' : 'bg-white hover:bg-gray-50 border-gray-200'} overflow-hidden transition-all duration-200 h-full`}>
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
                  <AvatarImage src={group.avatar_url} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700">
                    {group.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className={`text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{group.name}</CardTitle>
                <CardDescription className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {group.is_private ? 'Privat' : 'Öffentlich'} • {group.member_count} {group.member_count === 1 ? 'Mitglied' : 'Mitglieder'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
              {group.description || 'Keine Beschreibung'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <div className="flex items-center text-xs gap-3">
              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <MessageSquare size={14} />
                {group.posts_count || 0}
              </span>
              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar size={14} />
                {new Date(group.updated_at).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <Button 
              variant={isMember ? "outline" : "ghost"}
              size="sm" 
              className={`p-1 h-auto ${isLoading ? 'opacity-50' : ''}`}
              onClick={isMember ? handleLeaveGroup : handleJoinGroup}
              disabled={isLoading}
            >
              {isMember ? (
                <UserMinus size={16} className="text-red-500" />
              ) : (
                <UserPlus size={16} className="text-primary" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default GroupCard;
