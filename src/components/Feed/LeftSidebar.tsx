import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Wallet,
  Zap,
  Users,
  Bell,
  Settings,
  User,
  TrendingUp,
  Hash,
  Gift,
  MessageSquare,
  Coins,
  Award,
  ChevronRight,
  BarChart,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';

const LeftSidebar: React.FC = () => {
  const { user: profile } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Hauptmenü
  const mainMenuLinks = [
    { to: '/feed/recent', icon: <Home size={16} />, label: 'Home' },
    { to: '/wallet', icon: <Wallet size={16} />, label: 'Wallet' },
    { to: '/mining', icon: <Zap size={16} />, label: 'Mining' },
    { to: '/groups', icon: <Users size={16} />, label: 'Gruppen' },
    { to: '/notifications', icon: <Bell size={16} />, label: 'Benachrichtigungen' },
    { to: '/messages', icon: <MessageSquare size={16} />, label: 'Nachrichten' },
    { to: '/notification-settings', icon: <Settings size={16} />, label: 'Einstellungen' },
    { to: profile ? `/profile/${profile.username}` : '/profile', icon: <User size={16} />, label: 'Profil' },
  ];

  // Erstellen Menü
  const createMenuLinks = [
    { to: '/create-token', icon: <Coins size={16} />, label: 'Token erstellen' },
    { to: '/create-nft', icon: <Award size={16} />, label: 'NFT erstellen' },
    { to: '/create-group', icon: <Users size={16} />, label: 'Gruppe erstellen' },
  ];

  // Entdecken Menü
  const discoverMenuLinks = [
    { to: '/feed/trending', icon: <TrendingUp size={16} />, label: 'Trending' },
    { to: '/feed/hashtags', icon: <Hash size={16} />, label: 'Hashtags' },
    { to: '/feed/category/communities', icon: <Users size={16} />, label: 'Communities' },
    { to: '/feed/category/airdrops', icon: <Gift size={16} />, label: 'Airdrops' },
    { to: '/feed/leaderboard', icon: <BarChart size={16} />, label: 'Leaderboard' },
    { to: '/marketplace', icon: <ShoppingBag size={16} />, label: 'NFT Marktplatz' },
  ];

  // Kategorien Menü
  const categoryLinks = [
    { to: '/feed/category/crypto', icon: <ChevronRight size={14} />, label: 'Crypto' },
    { to: '/feed/category/defi', icon: <ChevronRight size={14} />, label: 'DeFi' },
    { to: '/feed/category/nft', icon: <ChevronRight size={14} />, label: 'NFTs' },
    { to: '/feed/category/trading', icon: <ChevronRight size={14} />, label: 'Trading' },
  ];

  const handleLinkClick = (to: string, event: React.MouseEvent) => {
    event.preventDefault();
    navigate(to);
  };

  const renderLinks = (links, className = "") => (
    <div className={`space-y-1 ${className}`}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end // Nur exakter Pfad ist aktiv
          className={({ isActive }) =>
            `flex items-center py-2 px-4 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-white hover:bg-dark-300 hover:text-primary border border-transparent'
            }`
          }
          onClick={(e) => handleLinkClick(link.to, e)}
          data-theme={theme}
        >
          <span className="mr-3">{link.icon}</span>
          <span className="font-medium">{link.label}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="py-4 px-2 hide-scrollbar text-white" data-theme={theme}>
      <div className="mb-1 px-4 text-xs font-medium uppercase text-muted-foreground">Menü</div>
      {renderLinks(mainMenuLinks)}

      <div className="mt-6 mb-1 px-4 text-xs font-medium uppercase text-muted-foreground">Erstellen</div>
      {renderLinks(createMenuLinks)}

      <div className="mt-6 mb-1 px-4 text-xs font-medium uppercase text-muted-foreground">Entdecken</div>
      {renderLinks(discoverMenuLinks)}

      <div className="mt-6 mb-1 px-4 text-xs font-medium uppercase text-muted-foreground">Kategorien</div>
      {renderLinks(categoryLinks)}
    </div>
  );
};

export default LeftSidebar;
