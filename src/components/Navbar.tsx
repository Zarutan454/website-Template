import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useMining } from '@/hooks/useMining';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useSidebarData } from '@/hooks/useSidebarData';
import { userAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ThemeProvider';
import Logo from '@/components/Logo';
import { MessagesBadge } from './Messaging/MessagesBadge';
import { NotificationsBadge } from './notifications/NotificationsBadge';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLanguage } from '@/components/LanguageProvider';
import { getFullUrl } from '@/utils/url';
import { Search, Bell, MessageSquare, Globe, Menu, X, Settings, User, LogOut } from 'lucide-react';
import { getAvatarUrl } from '../utils/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { language, setLanguage } = useLanguage();
  
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error: unknown) {
      toast.error('Fehler beim Abmelden');
    }
  };

  // Navigate to user profile with the correct username
  const navigateToProfile = () => {
    if (user?.username) {
      navigate(`/profile/${user.username}`);
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  };

  // Dynamische Navbar-Hintergrundfarbe basierend auf Scroll und Seite
  const navbarBg = isScrolled
    ? 'bg-dark-200/90 backdrop-blur-lg shadow-lg'
    : isLandingPage
      ? 'bg-transparent'
      : 'bg-dark-200 backdrop-blur-md';

  // Landingpage-spezifische Navigationslinks
  const landingNavItems = [
    { 
      label: language === 'de' ? 'Home' : 'Home', 
      href: '#home' 
    },
    { 
      label: language === 'de' ? 'Features' : 'Features', 
      href: '#features' 
    },
    { 
      label: language === 'de' ? 'Mining' : 'Mining', 
      href: '#mining' 
    },
    { 
      label: language === 'de' ? 'Roadmap' : 'Roadmap', 
      href: '#roadmap' 
    },
    { 
      label: language === 'de' ? 'FAQ' : 'FAQ', 
      href: '#faq' 
    },
  ];
  
  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarBg}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14">
          {/* Left section - Logo */}
          <div className="flex-shrink-0 w-1/4">
            <Logo variant={isLandingPage ? "default" : "small"} withText={!isLandingPage ? false : true} />
          </div>
          
          {/* Center section - Navigation Links */}
          <div className="flex-grow flex justify-center">
            {isLandingPage ? (
              <div className="hidden md:flex items-center space-x-8">
                {landingNavItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : (
              isAuthenticated && (
                <div className="hidden md:flex items-center justify-center space-x-1">
                  <Link to="/feed">
                    <Button variant="ghost" size="sm" className="nav-item">
                      Feed
                    </Button>
                  </Link>
                  
                  <Link to="/reels">
                    <Button variant="ghost" size="sm" className="nav-item">
                      Reels
                    </Button>
                  </Link>
                  
                  <Link to="/marketplace">
                    <Button variant="ghost" size="sm" className="nav-item">
                      NFT-Markt
                    </Button>
                  </Link>
                  
                  <Link to="/mining">
                    <Button variant="ghost" size="sm" className="nav-item">
                      Mining
                    </Button>
                  </Link>
                  
                  <Link to="/achievements">
                    <Button variant="ghost" size="sm" className="nav-item">
                      Achievements
                    </Button>
                  </Link>
                  
                  <Link to="/wallet">
                    <Button variant="ghost" size="sm" className="nav-item">
                      Wallet
                    </Button>
                  </Link>
                </div>
              )
            )}
          </div>
          
          {/* Right section - Controls */}
          <div className="flex-shrink-0 w-1/4 flex justify-end">
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/search">
                    <Search size={20} />
                  </Link>
                </Button>
                
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/notifications">
                    <div className="relative">
                      <Bell size={20} />
                      <NotificationsBadge className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 text-[10px]" />
                    </div>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/messages">
                    <div className="relative">
                      <MessageSquare size={20} />
                      <MessagesBadge className="absolute -top-1 -right-1" />
                    </div>
                  </Link>
                </Button>
                
                <ThemeToggle />
                
                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-dark-300/30 backdrop-blur-md hover:bg-dark-200/50 transition-all"
                    >
                      <Globe size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-dark-200/90 backdrop-blur-lg border-white/10">
                    <DropdownMenuItem 
                      onClick={() => setLanguage('de')}
                      className={`${language === 'de' ? 'bg-primary/20 text-primary' : ''}`}
                    >
                      <span className="mr-2">🇩🇪</span>
                      <span>Deutsch</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLanguage('en')}
                      className={`${language === 'en' ? 'bg-primary/20 text-primary' : ''}`}
                    >
                      <span className="mr-2">🇬🇧</span>
                      <span>English</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(user?.avatar_url)} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-dark-200/90 backdrop-blur-lg border-white/10">
                    <DropdownMenuLabel>{language === 'de' ? 'Mein Account' : 'My Account'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={navigateToProfile}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{language === 'de' ? 'Profil' : 'Profile'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/notification-settings')}>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>{language === 'de' ? 'Benachrichtigungen' : 'Notifications'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{language === 'de' ? 'Einstellungen' : 'Settings'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{language === 'de' ? 'Abmelden' : 'Sign Out'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              isLandingPage ? (
                <>
                  {/* Language Selector for Landing Page */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="bg-dark-300/30 backdrop-blur-md hover:bg-dark-200/50 transition-all"
                      >
                        <Globe size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-dark-200/90 backdrop-blur-lg border-white/10">
                      <DropdownMenuItem 
                        onClick={() => setLanguage('de')}
                        className={`${language === 'de' ? 'bg-primary/20 text-primary' : ''}`}
                      >
                        <span className="mr-2">🇩🇪</span>
                        <span>Deutsch</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLanguage('en')}
                        className={`${language === 'en' ? 'bg-primary/20 text-primary' : ''}`}
                      >
                        <span className="mr-2">🇬🇧</span>
                        <span>English</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <ThemeToggle />
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      className="mr-2 bg-dark-300/30 backdrop-blur-md hover:bg-dark-200/50 transition-all"
                    >
                      {language === 'de' ? 'Login' : 'Login'}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/20">
                      {language === 'de' ? 'Registrieren' : 'Register'}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Language Selector for Non-Landing Pages */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="bg-dark-300/30 backdrop-blur-md hover:bg-dark-200/50 transition-all"
                      >
                        <Globe size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-dark-200/90 backdrop-blur-lg border-white/10">
                      <DropdownMenuItem 
                        onClick={() => setLanguage('de')}
                        className={`${language === 'de' ? 'bg-primary/20 text-primary' : ''}`}
                      >
                        <span className="mr-2">🇩🇪</span>
                        <span>Deutsch</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLanguage('en')}
                        className={`${language === 'en' ? 'bg-primary/20 text-primary' : ''}`}
                      >
                        <span className="mr-2">🇬🇧</span>
                        <span>English</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <ThemeToggle />
                  <Link to="/login">
                    <Button>
                      {language === 'de' ? 'Login' : 'Login'}
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated && (
              <>
                {/* Language Selector for Mobile */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-dark-300/30 backdrop-blur-md hover:bg-dark-200/50 transition-all"
                  onClick={toggleLanguage}
                >
                  <Globe size={18} />
                  <span className="sr-only">
                    {language === 'de' ? 'Sprache ändern' : 'Change language'}
                  </span>
                </Button>
                
                <ThemeToggle />
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="bg-dark-300/30 backdrop-blur-md hover:bg-dark-200/50 transition-all"
                >
                  <Menu size={24} />
                </Button>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                {/* Language Selector for Mobile */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-dark-300/30 backdrop-blur-md hover:bg-dark-200/50 transition-all"
                  onClick={toggleLanguage}
                >
                  <Globe size={18} />
                  <span className="sr-only">
                    {language === 'de' ? 'Sprache ändern' : 'Change language'}
                  </span>
                </Button>
                
                <ThemeToggle />
                {isLandingPage ? (
                  <>
                    <Link to="/login">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-dark-300/30 backdrop-blur-md border-white/10 hover:bg-dark-200/50 transition-all"
                      >
                        {language === 'de' ? 'Login' : 'Login'}
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      onClick={() => setMobileMenuOpen(true)}
                      className="md:hidden bg-dark-300/30 backdrop-blur-md hover:bg-dark-200/50 transition-all"
                    >
                      <Menu size={24} />
                    </Button>
                  </>
                ) : (
                  <Link to="/login">
                    <Button>
                      {language === 'de' ? 'Login' : 'Login'}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-dark-200/98 flex flex-col md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <Logo />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto py-6 px-4">
              {isAuthenticated ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.avatar_url ? getAvatarUrl(user.avatar_url) : ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white">{user?.display_name || user?.username}</h3>
                      <p className="text-sm text-gray-400">@{user?.username}</p>
                    </div>
                  </div>
                  
                  {/* Language Selector in Mobile Menu */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 mb-4">
                    <div className="flex items-center">
                      <Globe size={18} className="mr-3 text-primary-400" />
                      <span className="text-white">
                        {language === 'de' ? 'Sprache' : 'Language'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className={`px-2 py-1 rounded ${language === 'de' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400'}`}
                        onClick={() => setLanguage('de')}
                      >
                        🇩🇪 DE
                      </button>
                      <button 
                        className={`px-2 py-1 rounded ${language === 'en' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400'}`}
                        onClick={() => setLanguage('en')}
                      >
                        🇬🇧 EN
                      </button>
                    </div>
                  </div>
                  
                  <nav className="space-y-2">
                    <Link to="/feed" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all">
                      {language === 'de' ? 'Feed' : 'Feed'}
                    </Link>
                    <Link to="/reels" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all">
                      {language === 'de' ? 'Reels' : 'Reels'}
                    </Link>
                    <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all">
                      {language === 'de' ? 'NFT-Markt' : 'NFT Market'}
                    </Link>
                    <Link to="/mining" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all">
                      {language === 'de' ? 'Mining' : 'Mining'}
                    </Link>
                    <Link to="/achievements" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all">
                      🏆 {language === 'de' ? 'Achievements' : 'Achievements'}
                    </Link>
                    <Link to="/wallet" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all">
                      {language === 'de' ? 'Wallet' : 'Wallet'}
                    </Link>
                    <div 
                      onClick={navigateToProfile} 
                      className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all cursor-pointer"
                    >
                      {language === 'de' ? 'Profil' : 'Profile'}
                    </div>
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all">
                      {language === 'de' ? 'Einstellungen' : 'Settings'}
                    </Link>
                  </nav>
                  
                  <div className="pt-6 border-t border-gray-800">
                    <button 
                      className="w-full p-3 text-left text-red-400 rounded-lg bg-dark-300/30 backdrop-blur-md border border-red-500/10 hover:bg-dark-200/50 hover:border-red-500/20 transition-all"
                      onClick={handleSignOut}
                    >
                      <div className="flex items-center">
                        <LogOut size={18} className="mr-3" />
                        {language === 'de' ? 'Abmelden' : 'Sign Out'}
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Language Selector in Mobile Menu */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 mb-4">
                    <div className="flex items-center">
                      <Globe size={18} className="mr-3 text-primary-400" />
                      <span className="text-white">
                        {language === 'de' ? 'Sprache' : 'Language'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className={`px-2 py-1 rounded ${language === 'de' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400'}`}
                        onClick={() => setLanguage('de')}
                      >
                        🇩🇪 DE
                      </button>
                      <button 
                        className={`px-2 py-1 rounded ${language === 'en' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400'}`}
                        onClick={() => setLanguage('en')}
                      >
                        🇬🇧 EN
                      </button>
                    </div>
                  </div>
                  
                  {isLandingPage && (
                    <nav className="space-y-2 mb-6">
                      {landingNavItems.map((item, index) => (
                        <a 
                          key={index} 
                          href={item.href}
                          className="block p-3 rounded-lg bg-dark-300/30 backdrop-blur-md border border-white/10 hover:bg-dark-200/50 hover:border-primary-500/20 transition-all"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </a>
                      ))}
                    </nav>
                  )}
                  
                  <Link 
                    to="/login"
                    className="block w-full p-4 text-center bg-dark-300/30 backdrop-blur-md border border-white/10 rounded-lg hover:bg-dark-200/50 hover:border-primary-500/20 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {language === 'de' ? 'Login' : 'Login'}
                  </Link>
                  
                  <Link 
                    to="/register"
                    className="block w-full p-4 text-center bg-gradient-to-r from-primary to-secondary rounded-lg text-white shadow-lg shadow-primary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {language === 'de' ? 'Registrieren' : 'Register'}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
