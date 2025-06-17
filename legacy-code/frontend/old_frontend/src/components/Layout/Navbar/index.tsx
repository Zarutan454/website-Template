
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import NavbarLinks from './NavbarLinks';
import UserSearchDropdown from './UserSearchDropdown';
import NotificationDropdown from './NotificationDropdown';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { profile } = useProfile();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-dark-100 border-dark-300 backdrop-blur supports-[backdrop-filter]:bg-dark-100/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden sm:inline-block font-bold text-xl">BSN</span>
          </Link>
          
          <div className="hidden md:flex">
            <NavbarLinks />
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserSearchDropdown />
          
          <NotificationDropdown />
          
          {profile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
                      <AvatarFallback className="bg-primary-900 text-primary-100">
                        {profile.display_name?.charAt(0) || profile.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-dark-100 p-0">
                  <div className="grid gap-4 py-4">
                    <div className="px-4 flex flex-col items-center justify-center space-y-2">
                      <Avatar className="h-16 w-16">
                        {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
                        <AvatarFallback className="bg-primary-900 text-primary-100 text-xl">
                          {profile.display_name?.charAt(0) || profile.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <h2 className="text-xl font-bold">{profile.display_name}</h2>
                        <p className="text-gray-400">@{profile.username}</p>
                      </div>
                      <div className="flex w-full justify-center space-x-4 mt-2">
                        <div className="text-center">
                          <p className="text-lg font-bold">{profile.followers_count || 0}</p>
                          <p className="text-sm text-gray-400">Follower</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{profile.following_count || 0}</p>
                          <p className="text-sm text-gray-400">Following</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{profile.mined_tokens?.toFixed(2) || "0.00"}</p>
                          <p className="text-sm text-gray-400">Token</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="bg-gray-800" />
                    
                    <div className="grid gap-1 px-2">
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to={`/profile/${profile.username}`} onClick={() => setOpen(false)}>
                          <User className="mr-2 h-4 w-4" />
                          Mein Profil
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/settings" onClick={() => setOpen(false)}>
                          <Bell className="mr-2 h-4 w-4" />
                          Benachrichtigungen
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start text-red-500 hover:text-red-400 hover:bg-red-950/20"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Abmelden
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </motion.div>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 bg-dark-100">
              <div className="px-7">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                  <span>BSN</span>
                </Link>
              </div>
              <Separator className="my-4 bg-gray-800" />
              <NavbarLinks className="px-7" isMobile />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
