import React from 'react';
import { cn } from "../../lib/utils";
import { Badge } from './badge';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: StatusType;
  text: string;
  className?: string;
  icon?: React.ReactNode;
}

export function StatusBadge({
  status = 'default',
  text,
  className,
  icon
}: StatusBadgeProps) {
  const statusStyles: Record<StatusType, string> = {
    success: 'bg-green-500/15 text-green-500 hover:bg-green-500/20',
    warning: 'bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/20',
    error: 'bg-red-500/15 text-red-500 hover:bg-red-500/20',
    info: 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/20',
    default: 'bg-gray-500/15 text-gray-500 hover:bg-gray-500/20'
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        'flex items-center gap-1 font-normal',
        statusStyles[status],
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </Badge>
  );
}
