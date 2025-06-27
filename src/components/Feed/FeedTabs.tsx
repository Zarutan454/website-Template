
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paintbrush, Zap, Users, Flame, TrendingUp, Coins } from 'lucide-react';

interface FeedTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <TabsList className="w-full flex justify-between bg-dark-200/60 rounded-lg p-1 border border-dark-50">
      <TabsTrigger 
        value="recent" 
        onClick={() => onTabChange('recent')}
        className={`flex items-center w-full font-medium ${activeTab === 'recent' ? 'bg-dark-100' : ''}`}
      >
        <Zap size={16} className="mr-1" />
        <span className="hidden sm:inline">Neueste</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="popular" 
        onClick={() => onTabChange('popular')}
        className={`flex items-center w-full font-medium ${activeTab === 'popular' ? 'bg-dark-100' : ''}`}
      >
        <Flame size={16} className="mr-1" />
        <span className="hidden sm:inline">Beliebt</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="following" 
        onClick={() => onTabChange('following')}
        className={`flex items-center w-full font-medium ${activeTab === 'following' ? 'bg-dark-100' : ''}`}
      >
        <Users size={16} className="mr-1" />
        <span className="hidden sm:inline">Follows</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="tokens" 
        onClick={() => onTabChange('tokens')}
        className={`flex items-center w-full font-medium ${activeTab === 'tokens' ? 'bg-dark-100' : ''}`}
      >
        <Coins size={16} className="mr-1" />
        <span className="hidden sm:inline">Tokens</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="nfts" 
        onClick={() => onTabChange('nfts')}
        className={`flex items-center w-full font-medium ${activeTab === 'nfts' ? 'bg-dark-100' : ''}`}
      >
        <Paintbrush size={16} className="mr-1" />
        <span className="hidden sm:inline">NFTs</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="leaderboard" 
        onClick={() => onTabChange('leaderboard')}
        className={`flex items-center w-full font-medium ${activeTab === 'leaderboard' ? 'bg-dark-100' : ''}`}
      >
        <TrendingUp size={16} className="mr-1" />
        <span className="hidden sm:inline">Ranking</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default FeedTabs;
