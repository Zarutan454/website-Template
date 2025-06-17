
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

export interface InfoBoxProps {
  title: string;
  value: string;
  description?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ 
  title, 
  value, 
  description, 
  status = 'neutral',
  icon,
  className
}) => {
  // Status color mapping
  const getStatusColorClasses = (): { bg: string, text: string, icon: React.ReactNode } => {
    switch (status) {
      case 'success':
        return { 
          bg: 'bg-green-500/10',
          text: 'text-green-500',
          icon: icon || <CheckCircle className="h-5 w-5" />
        };
      case 'warning':
        return { 
          bg: 'bg-amber-500/10', 
          text: 'text-amber-500',
          icon: icon || <AlertTriangle className="h-5 w-5" />
        };
      case 'error':
        return { 
          bg: 'bg-red-500/10', 
          text: 'text-red-500',
          icon: icon || <AlertCircle className="h-5 w-5" />
        };
      default:
        return { 
          bg: 'bg-blue-500/10', 
          text: 'text-blue-500',
          icon: icon || <Info className="h-5 w-5" />
        };
    }
  };

  const { bg, text, icon: statusIcon } = getStatusColorClasses();

  return (
    <Card className={`bg-dark-100 border-gray-800 ${className || ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start space-x-4">
          <div className={`${bg} p-3 rounded-full ${text}`}>
            {statusIcon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-xl font-semibold mt-1">{value}</p>
            {description && (
              status && status !== 'neutral' ? (
                <div className="mt-2">
                  <StatusBadge 
                    status={'default'} 
                    text={description} 
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoBox;
