
import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';

interface MiningFooterLinkProps {
  onClose?: () => void;
}

const MiningFooterLink: React.FC<MiningFooterLinkProps> = ({ onClose }) => {
  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="p-3 border-t border-gray-800 text-center">
      <Link 
        to="/mining" 
        className="text-sm text-primary hover:text-primary-400 flex items-center justify-center"
        onClick={handleClick}
      >
        <Hammer className="h-4 w-4 mr-1" />
        Zum Mining Dashboard
      </Link>
    </div>
  );
};

export default MiningFooterLink;
