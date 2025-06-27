
import React from 'react';
import { ClipboardX } from 'lucide-react';

export interface FeedEmptyProps {
  darkMode?: boolean;
  message?: string;
  description?: string;
  onCreatePost?: () => void;
}

const FeedEmpty: React.FC<FeedEmptyProps> = ({
  darkMode = true,
  message = "Keine Beiträge gefunden",
  description = "Es wurden noch keine Beiträge erstellt oder die Filter ergeben keine Treffer.",
  onCreatePost
}) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg ${
      darkMode ? 'bg-dark-200 text-gray-300' : 'bg-gray-100 text-gray-600'
    }`}>
      <div className={`p-6 rounded-full mb-4 ${
        darkMode ? 'bg-dark-100' : 'bg-white'
      }`}>
        <ClipboardX className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className={`text-xl font-medium mb-2 ${
        darkMode ? 'text-white' : 'text-gray-800'
      }`}>
        {message}
      </h3>
      <p className="text-sm max-w-md mb-4">
        {description}
      </p>
      
      {onCreatePost && (
        <button 
          onClick={onCreatePost}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-primary hover:bg-primary/90 text-white' 
              : 'bg-primary hover:bg-primary/90 text-white'
          }`}
        >
          Beitrag erstellen
        </button>
      )}
    </div>
  );
};

export default FeedEmpty;
