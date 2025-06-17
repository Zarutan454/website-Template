
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, TrendingUp, Zap, UsersRound, Coins, Gift, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

interface NavbarLinksProps {
  className?: string;
  isMobile?: boolean;
}

const NavbarLinks: React.FC<NavbarLinksProps> = ({
  className,
  isMobile = false
}) => {
  const location = useLocation();
  const { profile } = useProfile();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Build links with dynamic profile URL
  const getLinks = () => {
    const profilePath = profile?.username ? `/profile/${profile.username}` : '/profile';
    
    return [
      { to: '/', icon: <HomeIcon size={18} />, label: 'Start', show: true },
      { to: '/feed/recent', icon: <TrendingUp size={18} />, label: 'Feed', show: true },
      { to: '/mining', icon: <Zap size={18} />, label: 'Mining', show: true },
      { to: '/following', icon: <UsersRound size={18} />, label: 'Following', show: true },
      { to: '/tokens', icon: <Coins size={18} />, label: 'Tokens', show: true },
      { to: '/marketplace', icon: <ShoppingBag size={18} />, label: 'Marktplatz', show: true },
      { to: '/rewards', icon: <Gift size={18} />, label: 'Rewards', show: true }
    ];
  };
  
  const variants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0 }
  };
  
  const links = getLinks();
  
  return (
    <nav className={cn("flex items-center gap-1", isMobile ? "flex-col w-full" : "flex-row", className)}>
      {links.filter(link => link.show).map((link, index) => (
        <motion.div
          key={link.to}
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          className={cn(
            isMobile ? "w-full" : "w-auto"
          )}
        >
          <Link
            to={link.to}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(link.to)
                ? "bg-primary/10 text-primary"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/60",
              isMobile ? "w-full justify-start" : "w-auto justify-center"
            )}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        </motion.div>
      ))}
    </nav>
  );
};

export default NavbarLinks;
