import * as React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';

export type PrivacyValue = 'public' | 'friends' | 'private';

interface PrivacyIconProps {
  value: PrivacyValue;
  showLabel?: boolean;
  className?: string;
}

const PRIVACY_META: Record<PrivacyValue, { icon: React.ReactNode; label: string; tooltip: string }> = {
  public: {
    icon: <span role="img" aria-label="Öffentlich">🌍</span>,
    label: 'Öffentlich',
    tooltip: 'Jeder kann diesen Beitrag sehen',
  },
  friends: {
    icon: <span role="img" aria-label="Freunde">👥</span>,
    label: 'Freunde',
    tooltip: 'Nur Freunde können diesen Beitrag sehen',
  },
  private: {
    icon: <span role="img" aria-label="Privat">🔒</span>,
    label: 'Privat',
    tooltip: 'Nur du kannst diesen Beitrag sehen',
  },
};

const PrivacyIcon: React.FC<PrivacyIconProps> = ({ value, showLabel = false, className = '' }) => {
  const meta = PRIVACY_META[value] || PRIVACY_META.public;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 text-xs text-gray-400 ${className}`}
            aria-label={meta.label}
            tabIndex={0}
          >
            {meta.icon}
            {showLabel && <span>{meta.label}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent>{meta.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PrivacyIcon; 