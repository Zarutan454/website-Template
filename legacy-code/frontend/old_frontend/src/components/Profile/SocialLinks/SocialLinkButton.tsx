
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type SocialLinkButtonProps = {
  icon: LucideIcon;
  link: string;
  label: string;
  variant?: 'default' | 'outline' | 'glass';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
};

export const SocialLinkButton = ({
  icon: Icon,
  link,
  label,
  variant = 'default',
  size = 'default',
  className,
}: SocialLinkButtonProps) => {
  const handleClick = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return "bg-dark-200/50 border-gray-700/50 hover:bg-dark-300/70 hover:border-primary-500/30 text-gray-300 hover:text-white";
      case 'outline':
        return "bg-transparent border-gray-700 hover:bg-dark-300 hover:border-primary-500/30 text-gray-300 hover:text-white";
      default:
        return "bg-dark-200 hover:bg-dark-300 text-white";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return "py-1 px-2 text-sm";
      case 'lg':
        return "py-3 px-6 text-lg";
      default:
        return "py-2 px-4";
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full flex items-center justify-start gap-2 transition-all",
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      onClick={handleClick}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left truncate">{label}</span>
    </Button>
  );
};
