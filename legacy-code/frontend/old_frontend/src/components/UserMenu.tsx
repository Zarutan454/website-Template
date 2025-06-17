import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { 
  User, Settings, LogOut, HelpCircle, Moon, Sun, Wallet, Shield,
  UserPlus, MessageSquare, Users
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { toast } from 'sonner';

const UserMenu = () => {
  const { profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Erfolgreich abgemeldet");
      navigate('/login');
    } catch (error) {
      toast.error("Fehler beim Abmelden");
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative rounded-full">
        <Avatar className="h-8 w-8 bg-dark-300">
          <AvatarFallback className="bg-dark-300 text-gray-400">
            <User size={14} />
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!profile) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
          Login
        </Button>
        <Button size="sm" onClick={() => navigate('/register')}>
          Registrieren
        </Button>
      </div>
    );
  }

  const userInitial = profile.display_name?.charAt(0) || profile.username?.charAt(0) || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full focus:ring-0 focus:ring-offset-0">
          <Avatar className="h-8 w-8 border border-gray-700">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {userInitial}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.display_name || profile.username}</p>
            <p className="text-xs leading-none text-muted-foreground">@{profile.username}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`/profile/${profile.username}`} className="cursor-pointer flex w-full items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Mein Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/friends" className="cursor-pointer flex w-full items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Freunde</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wallet" className="cursor-pointer flex w-full items-center">
            <Wallet className="mr-2 h-4 w-4" />
            <span>Wallet</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="cursor-pointer flex w-full items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Benachrichtigungen</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notification-settings" className="cursor-pointer flex w-full items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Einstellungen</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="cursor-pointer">
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/faq" className="cursor-pointer flex w-full items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Hilfe & Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Abmelden</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
