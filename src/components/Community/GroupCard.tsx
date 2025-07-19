import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, MessageSquare, Calendar, Check, UserMinus, Loader2, Users, Shield, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Group, useGroup } from '@/hooks/useGroups';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const { joinGroup, leaveGroup, isJoining, isLeaving, members } = useGroup(group.id);

  // Bis zu 5 Mitglieder-Avatare (sortiert: Admins zuerst)
  const memberAvatars = (members || [])
    .sort((a, b) => (a.role === 'admin' ? -1 : 1))
    .slice(0, 5);

  // Dummy-Post-Vorschau (Platzhalter, bis API für Vorschau-Post verfügbar)
  const previewPost = group.last_post_preview || null;

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

  const handleKeyDown = (e: React.KeyboardEvent, action: 'join' | 'leave') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction(e as unknown as React.MouseEvent, action);
    }
  };

  const isLoading = isJoining || isLeaving;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        to={`/groups/${group.id}`} 
        className="block h-full"
        aria-label={`Gruppe ${group.name} - ${group.description || 'Keine Beschreibung'}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (e.target as HTMLElement).click();
          }
        }}
      >
        <Card className={`${theme === 'dark' ? 'bg-dark-100 hover:bg-dark-200 border-gray-800' : 'bg-white hover:bg-gray-50 border-gray-200'} overflow-hidden transition-all duration-200 h-full flex flex-col`}>
          <div 
            className="h-24 bg-cover bg-center" 
            style={{ 
              backgroundImage: group.banner_url 
                ? `url(${group.banner_url})` 
                : `linear-gradient(to right, ${theme === 'dark' ? '#1f2937, #111827' : '#f3f4f6, #e5e7eb'})`
            }}
            role="img"
            aria-label={`Banner für Gruppe ${group.name}`}
          >
            {/* Token-Gated Badge */}
            {group.token_gated && (
              <div className="absolute top-2 left-2 z-10">
                <span 
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/90 text-xs font-semibold text-yellow-900 shadow"
                  aria-label="Token-gated Gruppe - Wallet erforderlich"
                >
                  <Lock size={14} aria-hidden="true" /> Token-Gated
                </span>
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-background -mt-8">
                {group.avatar_url ? (
                  <AvatarImage src={group.avatar_url} alt={`Avatar für Gruppe ${group.name}`} />
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
                {/* Admin-Badge */}
                {members?.some(m => m.role === 'admin') && (
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/90 text-xs font-semibold text-white mt-1"
                    aria-label="Gruppe hat Administratoren"
                  >
                    <Shield size={14} aria-hidden="true" /> Admins
                  </span>
                )}
              </div>
            </div>
            {/* Mitglieder-Avatare Overlap-Stack */}
            <div className="flex -space-x-3 mt-2" aria-label="Gruppenmitglieder">
              {memberAvatars.map((m, i) => (
                <Avatar key={m.id} className="h-7 w-7 border-2 border-background bg-white dark:bg-dark-200 z-10" style={{ zIndex: 10 - i }}
                  aria-label={`Avatar von ${m.user.display_name || m.user.username}`}
                >
                  {m.user.avatar_url ? (
                    <AvatarImage src={m.user.avatar_url} alt={`Avatar von ${m.user.username}`} />
                  ) : (
                    <AvatarFallback>{m.user.username.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
              ))}
              {members && members.length > 5 && (
                <span className="ml-2 text-xs text-muted-foreground" aria-label={`und ${members.length - 5} weitere Mitglieder`}>
                  +{members.length - 5} mehr
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
              {group.description || 'Keine Beschreibung'}
            </p>
            {/* Post-Vorschau */}
            {previewPost && (
              <div className="mt-2 p-2 rounded bg-muted text-xs text-muted-foreground line-clamp-2">
                <span className="font-semibold">Letzter Post:</span> {previewPost}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-2">
            <div className="flex items-center text-xs gap-3">
              <span 
                className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                aria-label={`${group.posts_count || 0} Posts`}
              >
                <MessageSquare size={14} aria-hidden="true" />
                {group.posts_count || 0}
              </span>
              <span 
                className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                aria-label={`Erstellt am ${new Date(group.created_at).toLocaleDateString('de-DE')}`}
              >
                <Calendar size={14} aria-hidden="true" />
                {new Date(group.created_at).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <Button 
              variant={group.is_member ? "outline" : "default"}
              size="sm" 
              className={`p-2 h-auto transition-opacity ${isLoading ? 'opacity-50' : ''}`}
              onClick={(e) => handleAction(e, group.is_member ? 'leave' : 'join')}
              onKeyDown={(e) => handleKeyDown(e, group.is_member ? 'leave' : 'join')}
              disabled={isLoading}
              aria-label={group.is_member ? `Gruppe ${group.name} verlassen` : `Gruppe ${group.name} beitreten`}
              title={group.is_member ? 'Gruppe verlassen' : 'Gruppe beitreten'}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : group.is_member ? (
                <UserMinus size={16} aria-hidden="true" />
              ) : (
                <UserPlus size={16} aria-hidden="true" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default GroupCard;
