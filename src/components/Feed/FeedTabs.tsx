
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paintbrush, Zap, Users, Flame, TrendingUp, Coins } from 'lucide-react';

interface FeedTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

// Alle Tabs und UI entfernt
const FeedTabs: React.FC<any> = () => null;
export default FeedTabs;
