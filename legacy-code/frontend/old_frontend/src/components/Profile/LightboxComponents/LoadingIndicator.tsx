
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const loadingIndicatorVariants = cva(
  'absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-sm',
  {
    variants: {
      variant: {
        default: 'bg-black/70',
        light: 'bg-white/50',
        dark: 'bg-black/90'
      },
      size: {
        default: '',
        sm: 'p-4',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface LoadingIndicatorProps extends VariantProps<typeof loadingIndicatorVariants> {
  message?: string;
  className?: string;
  spinnerClassName?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Wird geladen...",
  variant,
  size,
  className,
  spinnerClassName
}) => {
  return (
    <div className={loadingIndicatorVariants({ variant, size, className })}>
      <Loader2 className={cn("h-12 w-12 text-primary animate-spin", spinnerClassName)} />
      <p className="text-white mt-4 text-sm">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
