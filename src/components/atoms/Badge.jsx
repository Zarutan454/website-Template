import React from 'react';

/**
 * Badge-Komponente für Status-Anzeigen und Labels
 * 
 * @param {Object} props - Komponenten-Props
 * @param {string} props.variant - Badge-Variante: 'primary', 'secondary', 'success', 'warning', 'error', 'info'
 * @param {string} props.size - Badge-Größe: 'sm', 'md', 'lg'
 * @param {boolean} props.rounded - Vollständig abgerundeter Badge
 * @param {boolean} props.outlined - Nur Umriss anzeigen
 * @param {string} props.className - Zusätzliche CSS-Klassen
 * @param {React.ReactNode} props.children - Badge-Inhalt
 * @returns {JSX.Element}
 */
const Badge = ({
  variant = 'primary',
  size = 'md',
  rounded = false,
  outlined = false,
  className = '',
  children,
  ...props
}) => {
  // Varianten-Klassen
  const variantClasses = {
    primary: outlined 
      ? 'bg-transparent border border-[#00a2ff] text-[#00a2ff]' 
      : 'bg-[#00a2ff] text-white',
    secondary: outlined 
      ? 'bg-transparent border border-[#a0e4ff] text-[#a0e4ff]' 
      : 'bg-[#a0e4ff]/20 text-[#a0e4ff]',
    success: outlined 
      ? 'bg-transparent border border-green-500 text-green-500' 
      : 'bg-green-500/20 text-green-400',
    warning: outlined 
      ? 'bg-transparent border border-yellow-500 text-yellow-500' 
      : 'bg-yellow-500/20 text-yellow-400',
    error: outlined 
      ? 'bg-transparent border border-red-500 text-red-500' 
      : 'bg-red-500/20 text-red-400',
    info: outlined 
      ? 'bg-transparent border border-blue-500 text-blue-500' 
      : 'bg-blue-500/20 text-blue-400'
  };
  
  // Größen-Klassen
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5'
  };
  
  // Radius-Klassen
  const radiusClass = rounded ? 'rounded-full' : 'rounded';
  
  // Zusammengesetzte Klassen
  const badgeClasses = `
    inline-flex items-center justify-center font-medium
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${radiusClass}
    ${className}
  `.trim();

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
