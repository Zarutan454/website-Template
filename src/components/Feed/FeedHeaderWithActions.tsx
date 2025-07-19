
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
import { useTheme } from '@/components/ThemeProvider.utils';
import { FeedType } from '@/hooks/feed/useFeedData';

interface FeedHeaderWithActionsProps {
  onCreatePost?: () => void;
  onRefresh?: () => void;
  activeFeed?: string | FeedType;
  lastRefresh?: Date;
  hasNewContent?: boolean;
  onNewContentClick?: () => void;
}

// Alle Kategorie-Buttons und Tabs entfernt
const FeedHeaderWithActions: React.FC<FeedHeaderWithActionsProps> = () => null;
export default FeedHeaderWithActions;

