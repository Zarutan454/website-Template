
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationFeed from '@/components/notifications/NotificationFeed';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';

const NotificationDropdown: React.FC = () => {
  const { profile, isLoading: profileLoading } = useProfile();
  const { unreadCount } = useNotifications();

  // Wenn kein Profil geladen ist, zeigen wir nur das Bell-Icon ohne Dropdown
  if (!profile || profileLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="relative"
      >
        <Link to="/login">
          <Bell className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <NotificationFeed 
      variant="dropdown" 
      maxHeight="400px" 
    />
  );
};

export default NotificationDropdown;
