import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  User, 
  Zap, 
  Coins, 
  Users, 
  Image, 
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileTab = 'posts' | 'about' | 'mining' | 'token' | 'friends' | 'media' | 'activity';

interface ProfileTabNavigationProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const ProfileTabNavigation: React.FC<ProfileTabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'posts' as ProfileTab, 
      label: 'Beiträge', 
      icon: Grid3X3, 
      ariaLabel: 'Zeige alle Beiträge des Benutzers',
      description: 'Posts und Aktivitäten'
    },
    { 
      id: 'about' as ProfileTab, 
      label: 'Über', 
      icon: User, 
      ariaLabel: 'Zeige Informationen über den Benutzer',
      description: 'Profil und Details'
    },
    { 
      id: 'mining' as ProfileTab, 
      label: 'Mining', 
      icon: Zap, 
      ariaLabel: 'Zeige Mining-Statistiken',
      description: 'Mining-Dashboard'
    },
    { 
      id: 'token' as ProfileTab, 
      label: 'Token', 
      icon: Coins, 
      ariaLabel: 'Zeige Token-Portfolio',
      description: 'Token-Balance'
    },
    { 
      id: 'friends' as ProfileTab, 
      label: 'Freunde', 
      icon: Users, 
      ariaLabel: 'Zeige Freunde und Follower',
      description: 'Kontakte'
    },
    { 
      id: 'media' as ProfileTab, 
      label: 'Medien', 
      icon: Image, 
      ariaLabel: 'Zeige hochgeladene Medien',
      description: 'Fotos & Videos'
    },
    { 
      id: 'activity' as ProfileTab, 
      label: 'Aktivität', 
      icon: Activity, 
      ariaLabel: 'Zeige Benutzer-Aktivitäten',
      description: 'Timeline'
    }
  ];

  const handleKeyDown = (event: React.KeyboardEvent, tabId: ProfileTab) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTabChange(tabId);
    }
  };

  return (
    <div className="relative">
      {/* Mobile Navigation with Scroll Indicators */}
      <div className="relative overflow-hidden">
        <div 
          className="flex overflow-x-auto scrollbar-hide scroll-smooth" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-1 sm:gap-2 min-w-full px-1">
            {tabs.map(({ id, label, icon: Icon, ariaLabel, description }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(id)}
                onKeyDown={(e) => handleKeyDown(e, id)}
                className={cn(
                  // Base styles
                  "flex flex-col sm:flex-row items-center gap-1 sm:gap-2",
                  "px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium",
                  "transition-all duration-200 whitespace-nowrap",
                  "min-h-[44px] sm:min-h-[40px]", // Touch target compliance
                  "rounded-lg sm:rounded-md",
                  "border border-transparent",
                  
                  // Active state
                  activeTab === id 
                    ? [
                        "bg-primary text-white shadow-lg",
                        "border-primary/20",
                        "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                      ]
                    : [
                        "text-gray-400 hover:text-white hover:bg-gray-700/50",
                        "hover:border-gray-600/50"
                      ],
                  
                  // Focus styles
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
                role="tab"
                aria-selected={activeTab === id}
                aria-label={ariaLabel}
                tabIndex={0}
              >
                <Icon className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                
                {/* Mobile: Show description on hover/focus */}
                <span className="sm:hidden text-[10px] opacity-75 mt-0.5">
                  {description}
                </span>
              </Button>
            ))}
                      </div>
          </div>
        
        {/* Scroll Indicators - Only show when needed */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
      
      {/* Active Tab Indicator */}
      <div className="mt-2 px-1">
        <div className="h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
      </div>
    </div>
  );
};

export default ProfileTabNavigation; 