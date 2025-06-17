
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  TrendingUpIcon,
  UsersIcon, 
  CoinsIcon,
  ImageIcon,
  PlusCircleIcon,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useTheme } from '@/components/ThemeProvider';
import { FeedType } from '@/hooks/feed/useFeedData';

interface FeedHeaderWithActionsProps {
  onCreatePost?: () => void;
  onRefresh?: () => void;
  activeFeed?: string | FeedType;
  lastRefresh?: Date;
  hasNewContent?: boolean;
  onNewContentClick?: () => void;
}

const FeedHeaderWithActions: React.FC<FeedHeaderWithActionsProps> = ({
  onCreatePost,
  onRefresh,
  activeFeed = 'recent',
  lastRefresh,
  hasNewContent,
  onNewContentClick
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const feedCategories = [
    { 
      name: 'Home', 
      icon: <HomeIcon className="w-5 h-5" />, 
      path: '/feed/recent',
      tooltip: 'Neueste Beiträge',
      value: 'recent'
    },
    { 
      name: 'Popular', 
      icon: <TrendingUpIcon className="w-5 h-5" />, 
      path: '/feed/popular',
      tooltip: 'Beliebte Beiträge',
      value: 'popular'
    },
    { 
      name: 'Following', 
      icon: <UsersIcon className="w-5 h-5" />, 
      path: '/feed/following',
      tooltip: 'Beiträge von Personen, denen du folgst',
      value: 'following'
    },
    { 
      name: 'Tokens', 
      icon: <CoinsIcon className="w-5 h-5" />, 
      path: '/feed/tokens',
      tooltip: 'Token-bezogene Beiträge',
      value: 'tokens'
    },
    { 
      name: 'NFTs', 
      icon: <ImageIcon className="w-5 h-5" />, 
      path: '/feed/nfts',
      tooltip: 'NFT-bezogene Beiträge',
      value: 'nfts'
    }
  ];
  
  return (
    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-dark-100 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <TooltipProvider>
            {feedCategories.map((category, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeFeed === category.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(category.path)}
                    className="flex items-center gap-1"
                  >
                    {category.icon}
                    <span className="hidden md:inline">{category.name}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{category.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <div className="flex space-x-2">
          {hasNewContent && onNewContentClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNewContentClick}
              className="text-primary"
            >
              Neue Beiträge anzeigen
            </Button>
          )}
          
          {onRefresh && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onRefresh}
                  >
                    <RefreshCcw className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">Aktualisieren</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Feed aktualisieren</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onCreatePost && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={onCreatePost}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <PlusCircleIcon className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">Neuer Beitrag</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Erstelle einen neuen Beitrag</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedHeaderWithActions;
