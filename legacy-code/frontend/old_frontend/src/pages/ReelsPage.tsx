import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import ReelFeed from '../components/Reels/ReelFeed';
import ReelCreator from '../components/Reels/ReelCreator';
import { useProfile } from '../hooks/useProfile';

const ReelsPage: React.FC = () => {
  const [isReelCreatorOpen, setIsReelCreatorOpen] = useState(false);
  const { profile } = useProfile();
  
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Reels</h1>
        
        {profile && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setIsReelCreatorOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Reel erstellen
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ReelFeed className="h-full" />
      </div>
      
      <ReelCreator 
        isOpen={isReelCreatorOpen} 
        onClose={() => setIsReelCreatorOpen(false)} 
      />
    </div>
  );
};

export default ReelsPage;
