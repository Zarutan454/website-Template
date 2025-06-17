
import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingCreateButtonProps {
  onClick: () => void;
}

const FloatingCreateButton: React.FC<FloatingCreateButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors"
      aria-label="Create new post"
    >
      <Plus size={24} />
    </button>
  );
};

export default FloatingCreateButton;
