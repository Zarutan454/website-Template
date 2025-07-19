import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Settings, LogOut, Wallet, Crown, Shield } from 'lucide-react';
import { useLanguage } from './LanguageProvider.utils';
import { authAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';

interface UserMenuProps {
  user?: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    is_alpha_user?: boolean;
  };
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // NEU: Django API verwenden statt Supabase
      await authAPI.logout();
      
      // Tokens und User-Daten entfernen
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      toast.success('Erfolgreich abgemeldet');
      navigate('/');
    } catch (error: unknown) {
      console.error('Logout error:', error);
      
      // Auch bei Fehler lokale Daten entfernen
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      toast.error('Abmeldung fehlgeschlagen, aber lokale Daten wurden entfernt');
      navigate('/');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: t('userMenu.profile'),
      onClick: () => {
        navigate('/profile');
        setIsOpen(false);
      }
    },
    {
      icon: Wallet,
      label: t('userMenu.wallet'),
      onClick: () => {
        navigate('/wallet');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: t('userMenu.settings'),
      onClick: () => {
        navigate('/settings');
        setIsOpen(false);
      }
    },
    {
      icon: LogOut,
      label: t('userMenu.logout'),
      onClick: handleLogout,
      isLoading
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="hidden md:block text-left">
            <div className="flex items-center space-x-1">
              <span className="text-white font-medium text-sm">
                {user.username}
              </span>
              {user.is_alpha_user && (
                <Crown className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <div className="text-gray-300 text-xs">
              {user.email}
            </div>
          </div>
        </div>
        
        <ChevronDown
          className={`w-4 h-4 text-gray-300 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 z-50"
          >
            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={item.onClick}
                  disabled={item.isLoading}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                  {item.isLoading && (
                    <div className="ml-auto">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
