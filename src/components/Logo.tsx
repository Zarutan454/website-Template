import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
interface LogoProps {
  variant?: 'default' | 'small' | 'large';
  withText?: boolean;
  // For backward compatibility and new implementations
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Added xl size
  showText?: boolean; // Alternative to withText
  className?: string; // For custom styling classes
  animated?: boolean; // Enable/disable animation
}
const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  withText = true,
  size,
  // New size property
  showText,
  // Alternative to withText
  className = '',
  // For custom styling classes
  animated = true // Animation enabled by default
}) => {
  const {
    theme
  } = useTheme();

  // Ensure compatibility between old and new props
  const resolvedVariant = size ? size === 'sm' ? 'small' : size === 'lg' ? 'large' : size === 'xl' ? 'large' : 'default' : variant;
  const resolvedWithText = showText !== undefined ? showText : withText;
  const sizes = {
    small: {
      logoSize: 'h-8 w-8',
      textSize: 'text-lg'
    },
    default: {
      logoSize: 'h-10 w-10',
      textSize: 'text-xl'
    },
    large: {
      logoSize: 'h-12 w-12',
      textSize: 'text-2xl'
    }
  };
  const {
    logoSize,
    textSize
  } = sizes[resolvedVariant];

  // Logo gradient based on current theme
  const logoGradient = theme === 'dark' ? 'from-pink-500 to-pink-600' : 'from-pink-500/90 to-pink-600/90';

  // Container classes for the logo
  const logoContainerClasses = `relative ${logoSize} flex-shrink-0`;
  return <Link to="/" className={`flex items-center gap-0.5 ${className}`}>
      {animated ? <motion.div className={logoContainerClasses} whileHover={{
      rotate: 360
    }} transition={{
      duration: 0.8,
      ease: "easeInOut"
    }} style={{
      willChange: 'transform'
    }}>
          {/* Outer circle */}
          <motion.div className={`absolute inset-0 rounded-full bg-gradient-to-r ${logoGradient}`} animate={{
        boxShadow: ['0 0 0 rgba(227, 28, 121, 0.4)', '0 0 20px rgba(227, 28, 121, 0.6)', '0 0 0 rgba(227, 28, 121, 0.4)']
      }} transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }} style={{
        willChange: 'box-shadow'
      }} />
          
          {/* Inner circle with cutout */}
          <div className={`absolute inset-[2px] rounded-full ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
            {/* Network lines */}
            <div className="absolute inset-0">
              <motion.div className="absolute top-1/2 left-0 right-0 h-[1px] bg-pink-500/50" animate={{
            rotate: [0, 180]
          }} transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }} style={{
            willChange: 'transform'
          }} />
              <motion.div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-pink-600/50" animate={{
            rotate: [0, 180]
          }} transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }} style={{
            willChange: 'transform'
          }} />
              <motion.div className="absolute top-0 left-0 w-full h-full border-[1px] border-pink-500/30 rounded-full" animate={{
            scale: [0.5, 1.2, 0.5]
          }} transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }} style={{
            willChange: 'transform'
          }} />
            </div>
            
            {/* BSN Text */}
            <div className="relative z-10 text-white font-bold text-xs">BSN</div>
          </div>
        </motion.div> : <div className={logoContainerClasses}>
          {/* Static version of the logo */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${logoGradient}`}></div>
          <div className={`absolute inset-[2px] rounded-full ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-100'} flex items-center justify-center`}>
            <div className="text-white font-bold text-xs">BSN</div>
          </div>
        </div>}
      
      {resolvedWithText && <motion.div className={`ml-2 font-bold ${textSize} flex flex-col leading-tight`} animate={animated ? {
      opacity: 1,
      x: 0
    } : undefined} initial={animated ? {
      opacity: 0,
      x: -10
    } : undefined} transition={{
      delay: 0.2,
      duration: 0.3,
      type: 'spring',
      stiffness: 100
    }}>
          <span className="flex items-center">
            
            
          </span>
          
          
        </motion.div>}
    </Link>;
};
export default Logo;
