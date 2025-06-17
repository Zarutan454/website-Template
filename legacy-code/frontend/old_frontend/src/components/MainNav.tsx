
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home,
  User,
  MessageSquare,
  Bell,
  Menu,
  Coins,
  LogOut,
  Settings,
  Rocket,
  LogIn
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationsPopover } from './notifications/NotificationsPopover';
import { useAuth } from '@/hooks/useAuth';
import { useMining } from '@/hooks/useMining';

interface MainNavProps {
  toggleSidebar?: () => void;
}

const MainNav: React.FC<MainNavProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const { profile, isLoading: profileLoading } = useProfile();
  const { isAuthenticated, logout } = useAuth();
  const { miningStats, isMining } = useMining();
  
  return (
    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800 bg-dark-100">
      {/* Left side: Logo & Menu toggle */}
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            BSN
          </span>
        </Link>
      </div>
      
      {/* Middle: Navigation links */}
      <div className="hidden md:flex items-center space-x-1">
        <Link to="/feed" className="relative group">
          <Button
            variant={location.pathname.includes('/feed') ? "default" : "ghost"}
            size="sm"
            className={location.pathname.includes('/feed') ? "bg-primary-700 hover:bg-primary-600" : ""}
          >
            <Home className="h-4 w-4 mr-2" />
            Feed
          </Button>
        </Link>
        
        <Link to="/chat" className="relative group">
          <Button
            variant={location.pathname.includes('/chat') ? "default" : "ghost"}
            size="sm"
            className={location.pathname.includes('/chat') ? "bg-primary-700 hover:bg-primary-600" : ""}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </Link>
        
        <Link to="/mining" className="relative group">
          <Button
            variant={location.pathname.includes('/mining') ? "default" : "ghost"}
            size="sm"
            className={
              location.pathname.includes('/mining') 
                ? "bg-primary-700 hover:bg-primary-600" 
                : isMining 
                ? "bg-green-800/30 text-green-500 hover:bg-green-800/50 hover:text-green-400" 
                : ""
            }
          >
            <Coins className={`h-4 w-4 mr-2 ${isMining ? "text-green-500" : ""}`} />
            Mining
            {isMining && (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                Active
              </span>
            )}
          </Button>
        </Link>
        
        <Link to="/create-token" className="relative group">
          <Button
            variant={location.pathname.includes('/create-token') ? "default" : "ghost"}
            size="sm"
            className={location.pathname.includes('/create-token') ? "bg-primary-700 hover:bg-primary-600" : ""}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Token
          </Button>
        </Link>
      </div>
      
      {/* Right side: User & Notifications */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <NotificationsPopover />
            
            {/* BSN Balance */}
            {isMining && miningStats?.total_tokens_earned !== undefined && (
              <div className="hidden md:flex items-center bg-dark-200 rounded-full px-3 py-1">
                <Coins className="h-3.5 w-3.5 text-primary-500 mr-1.5" />
                <span className="text-xs font-medium text-white">
                  {miningStats.total_tokens_earned.toFixed(2)} BSN
                </span>
              </div>
            )}
            
            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.username || 'User'} />
                    ) : null}
                    <AvatarFallback className="bg-primary-900 text-primary-50">
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-dark-100 border-gray-800 text-white">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">
                      {profile?.display_name || profile?.username || 'User'}
                    </p>
                    {profile?.username && (
                      <p className="text-xs text-gray-400">@{profile.username}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${profile?.id}`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Einstellungen</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button size="sm" variant="ghost">
                <LogIn className="h-4 w-4 mr-2" />
                Anmelden
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Registrieren</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MainNav;
