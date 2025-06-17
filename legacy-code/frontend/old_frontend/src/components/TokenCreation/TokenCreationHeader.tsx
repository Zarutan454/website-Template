
import React from 'react';
import { Check } from 'lucide-react';

interface TokenCreationHeaderProps {
  step: number;
}

const TokenCreationHeader: React.FC<TokenCreationHeaderProps> = ({ step }) => {
  const steps = [
    'Netzwerk',
    'Token-Typ',
    'Basic',
    'Erweitert',
    'Review',
    'Erfolg'
  ];

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-white text-center mb-6">Token erstellen</h1>
      
      <div className="relative">
        <div className="flex justify-between mb-2">
          {steps.map((stepName, index) => (
            <div 
              key={index}
              className="flex flex-col items-center w-1/6"
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  index < step 
                    ? 'bg-primary text-white' 
                    : index === step 
                      ? 'bg-primary/80 text-white' 
                      : 'bg-dark-300 text-gray-400'
                }`}
              >
                {index < step ? (
                  <Check size={16} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-1 ${
                index <= step ? 'text-gray-200' : 'text-gray-500'
              }`}>
                {stepName}
              </span>
            </div>
          ))}
        </div>
        
        <div className="h-1 bg-dark-300 absolute top-4 left-0 right-0 z-0" style={{ transform: 'translateY(-50%)' }}>
          <div 
            className="h-1 bg-primary transition-all" 
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TokenCreationHeader;
