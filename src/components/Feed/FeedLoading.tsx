
import React from 'react';
import { Loader2 } from 'lucide-react';

const FeedLoading: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Lade Beiträge...</p>
    </div>
  );
};

export default FeedLoading;
