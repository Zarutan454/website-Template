import React from 'react';

/**
 * Icon-Komponente für verschiedene Icons
 * 
 * @param {Object} props - Komponenten-Props
 * @param {string} props.name - Name des Icons
 * @param {string} props.size - Größe des Icons: 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {string} props.color - Farbe des Icons: 'primary', 'secondary', 'white', 'muted', 'custom'
 * @param {string} props.customColor - Benutzerdefinierte Farbe (wenn color='custom')
 * @param {string} props.className - Zusätzliche CSS-Klassen
 * @returns {JSX.Element}
 */
const Icon = ({
  name,
  size = 'md',
  color = 'primary',
  customColor = '',
  className = '',
  ...props
}) => {
  // Größen-Klassen
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  // Farb-Klassen
  const colorClasses = {
    primary: 'text-[#00a2ff]',
    secondary: 'text-[#a0e4ff]',
    white: 'text-white',
    muted: 'text-white/70'
  };
  
  // Zusammengesetzte Klassen
  const iconClasses = `
    ${sizeClasses[size] || sizeClasses.md}
    ${color === 'custom' ? '' : (colorClasses[color] || colorClasses.primary)}
    ${className}
  `.trim();

  // Custom Color Stil
  const customColorStyle = color === 'custom' ? { color: customColor } : {};
  
  // Icons-Map
  const icons = {
    // Blockchain Icons
    'blockchain': (
      <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M15.5 9L8.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 9H15.5V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3L21 7.5V16.5L12 21L3 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'wallet': (
      <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M19 7V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 9H16C14.8954 9 14 9.89543 14 11V13C14 14.1046 14.8954 15 16 15H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'token': (
      <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 9.5C15 8.12 13.88 7 12.5 7H11.5C10.12 7 9 8.12 9 9.5C9 10.88 10.12 12 11.5 12H12.5C13.88 12 15 13.12 15 14.5C15 15.88 13.88 17 12.5 17H11.5C10.12 17 9 15.88 9 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 19V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    
    // UI Icons
    'arrow-right': (
      <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'arrow-left': (
      <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M19 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'check': (
      <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'close': (
      <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'menu': (
      <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  // Fallback-Icon
  const fallbackIcon = (
    <svg className={iconClasses} style={customColorStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return icons[name] || fallbackIcon;
};

export default Icon;
