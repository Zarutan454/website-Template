
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface GlowingButtonProps {
  children: React.ReactNode;
  className?: string;
  primary?: boolean;
  onClick?: () => void;
  color?: 'primary' | 'secondary' | 'accent';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  ariaLabel?: string;
}

const GlowingButton: React.FC<GlowingButtonProps> = ({ 
  children, 
  className = '', 
  primary = true,
  onClick,
  color = 'primary',
  type = 'button',
  disabled = false,
  ariaLabel
}) => {
  const prefersReducedMotion = useReducedMotion();
  const baseStyles = "rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const colorStyles = {
    primary: {
      base: "from-pink-500 to-pink-600",
      shadow: "rgba(227, 28, 121, 0.6)"
    },
    secondary: {
      base: "from-purple-500 to-pink-500",
      shadow: "rgba(168, 85, 247, 0.6)"
    },
    accent: {
      base: "from-pink-500 to-orange-500",
      shadow: "rgba(244, 63, 94, 0.6)"
    }
  };
  
  const selectedColor = colorStyles[color];
  
  const primaryStyles = `bg-gradient-to-r ${selectedColor.base} text-white`;
  const secondaryStyles = "bg-transparent border border-white/10 text-white hover:bg-white/5";

  // Animation conditionally applied based on reduced motion preference
  const hoverAnimation = prefersReducedMotion || disabled 
    ? {} 
    : { 
        scale: disabled ? 1 : 1.05, 
        boxShadow: disabled ? "none" : (primary ? `0 0 20px ${selectedColor.shadow}` : "0 0 15px rgba(255, 255, 255, 0.1)")
      };
  
  return (
    <motion.button
      className={`${baseStyles} ${primary ? primaryStyles : secondaryStyles} ${className}`}
      whileHover={hoverAnimation}
      whileTap={prefersReducedMotion || disabled ? {} : { scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
};

export default GlowingButton;
