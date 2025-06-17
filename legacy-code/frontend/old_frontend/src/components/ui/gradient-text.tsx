import React from 'react';
import { cn } from "../../lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'custom';
  customGradient?: string;
  animate?: boolean;
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  variant = 'primary',
  customGradient,
  animate = false,
}) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-500',
    secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
    custom: customGradient,
  };

  return (
    <span
      className={cn(
        'bg-clip-text text-transparent',
        gradientClasses[variant],
        animate && 'animate-gradient-x',
        className
      )}
    >
      {children}
    </span>
  );
};

export { GradientText };
