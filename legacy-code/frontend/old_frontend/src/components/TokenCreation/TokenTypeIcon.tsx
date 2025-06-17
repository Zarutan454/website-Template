
import React from 'react';
import { Coins, LucideIcon } from 'lucide-react';
import { TOKEN_TYPES } from './data/tokenData';
import { TokenTypeOption } from './types/unified';

interface TokenTypeIconProps {
  tokenType: string | TokenTypeOption;
  size?: number;
  className?: string;
}

const TokenTypeIcon: React.FC<TokenTypeIconProps> = ({ 
  tokenType, 
  size = 24, 
  className = ""
}) => {
  // Wenn tokenType ein Objekt ist, verwenden wir seine ID, ansonsten nehmen wir den String
  const tokenTypeId = typeof tokenType === 'object' ? tokenType.id : tokenType;
  
  // Find the token type option by ID
  const tokenTypeOption = TOKEN_TYPES.find(type => type.id === tokenTypeId);
  
  // If no token type found, show fallback icon
  if (!tokenTypeOption) {
    return <Coins size={size} className={className} />;
  }
  
  // Get the icon component from the option
  const Icon = tokenTypeOption.icon;
  
  return <Icon size={size} className={className} />;
};

export default TokenTypeIcon;
