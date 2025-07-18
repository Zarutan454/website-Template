import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Crown, UserMinus, ArrowUpRight, Loader2 } from 'lucide-react';

interface GroupMemberCardProps {
  member: {
    id: string;
    user: {
      id: string;
      username: string;
      display_name?: string;
      avatar_url?: string;
    };
    role: string;
    is_online?: boolean;
  };
  isAdmin?: boolean;
  onPromote?: (userId: string) => void;
  onKick?: (userId: string) => void;
  loadingPromote?: boolean;
  loadingKick?: boolean;
}

const GroupMemberCard: React.FC<GroupMemberCardProps> = ({ member, isAdmin, onPromote, onKick, loadingPromote, loadingKick }) => {
  const { user, role, is_online } = member;
  // Entferne das Logging für children, da GroupMemberCard keine dynamischen Children rendert.
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors duration-200 shadow-sm"
      aria-label={`Mitglied ${user.display_name || user.username} (${role})`}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isAdmin) {
          e.preventDefault();
          // Fokus auf Promote, wenn möglich
          const promoteBtn = (e.currentTarget.querySelector('[aria-label="Zum Admin machen"]') as HTMLElement);
          if (promoteBtn) promoteBtn.focus();
        }
      }}
    >
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url} alt={user.display_name || user.username} />
          <AvatarFallback>{user.display_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
        </Avatar>
        {is_online && <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" title="Online"></span>}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-white truncate">{user.display_name || user.username}</span>
        <span className="ml-2 text-xs text-gray-400 uppercase">{role}</span>
      </div>
      {isAdmin && (
        <div className="flex gap-1">
          {/* Promote-Button mit Ladeindikator */}
          {role !== 'admin' && (
            <Button size="icon" variant="ghost" title="Zum Admin machen" aria-label="Zum Admin machen"
              onClick={() => onPromote?.(user.id)} disabled={!!loadingPromote}>
              {loadingPromote ? <Loader2 className="h-4 w-4 animate-spin text-yellow-400" /> : <Crown className="h-4 w-4 text-yellow-400" />}
            </Button>
          )}
          {/* Kick-Button mit Ladeindikator */}
          {role !== 'admin' && (
            <Button size="icon" variant="ghost" title="Mitglied entfernen" aria-label="Mitglied entfernen"
              onClick={() => onKick?.(user.id)} disabled={!!loadingKick}>
              {loadingKick ? <Loader2 className="h-4 w-4 animate-spin text-red-400" /> : <UserMinus className="h-4 w-4 text-red-400" />}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupMemberCard; 