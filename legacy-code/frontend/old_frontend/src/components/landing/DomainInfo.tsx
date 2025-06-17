
import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Check, ExternalLink } from 'lucide-react';

const DomainInfo: React.FC = () => {
  return (
    <motion.div 
      className="fixed bottom-4 left-4 z-50 bg-dark-100/90 backdrop-blur-md p-4 rounded-lg border border-primary-500/30 shadow-lg max-w-xs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="flex items-start">
        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <Globe size={20} className="text-primary-500" />
        </div>
        <div>
          <h4 className="text-white font-medium flex items-center">
            Domain verbunden <Check size={16} className="ml-1 text-green-500" />
          </h4>
          <p className="text-gray-400 text-sm mt-1">
            Deine Domain <span className="text-primary-400">blockchain-social.network</span> wurde erfolgreich mit dem Projekt verbunden.
          </p>
          <a 
            href="https://blockchain-social.network" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-400 text-sm mt-2 flex items-center hover:text-primary-300 transition-colors"
          >
            Website besuchen <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default DomainInfo;
