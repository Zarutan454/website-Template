
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';

interface NotificationsBadgeProps {
  className?: string;
}

export const NotificationsBadge: React.FC<NotificationsBadgeProps> = ({ className = "" }) => {
  const { unreadCount } = useNotifications();

  if (unreadCount <= 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className={className}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
};
