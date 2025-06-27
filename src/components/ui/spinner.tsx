import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  variant?: 'default' | 'primary' | 'muted';
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10'
};

const variantClasses = {
  default: 'text-primary',
  primary: 'text-primary',
  muted: 'text-muted-foreground'
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  className, 
  size = 'md',
  text,
  variant = 'default'
}) => {
  const spinnerElement = (
    <Loader2 
      className={cn(
        'animate-spin',
        variantClasses[variant],
        sizeClasses[size],
        className
      )} 
    />
  );

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center">
        {spinnerElement}
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      </div>
    );
  }

  return spinnerElement;
};
