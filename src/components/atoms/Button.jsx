import React from 'react';

/**
 * Button-Komponente für verschiedene Schaltflächen
 * 
 * @param {Object} props - Komponenten-Props
 * @param {string} props.variant - Button-Variante: 'primary', 'secondary', 'outlined', 'text', 'gradient'
 * @param {string} props.size - Button-Größe: 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {boolean} props.fullWidth - Volle Breite nutzen
 * @param {boolean} props.rounded - Vollständig abgerundeter Button
 * @param {boolean} props.disabled - Button deaktivieren
 * @param {React.ReactNode} props.leftIcon - Icon links vom Text
 * @param {React.ReactNode} props.rightIcon - Icon rechts vom Text
 * @param {string} props.type - Button-Typ: 'button', 'submit', 'reset'
 * @param {Function} props.onClick - Klick-Handler
 * @param {string} props.className - Zusätzliche CSS-Klassen
 * @param {React.ReactNode} props.children - Button-Inhalt
 * @returns {JSX.Element}
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  rounded = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  onClick,
  className = '',
  children,
  ...props
}) => {
  // Varianten-Klassen
  const variantClasses = {
    primary: 'bg-[#00a2ff] hover:bg-[#0091e6] text-white',
    secondary: 'bg-[#a0e4ff]/20 hover:bg-[#a0e4ff]/30 text-[#a0e4ff]',
    outlined: 'bg-transparent border border-[#00a2ff] hover:bg-[#00a2ff]/10 text-[#00a2ff]',
    text: 'bg-transparent hover:bg-[#00a2ff]/10 text-[#00a2ff]',
    gradient: 'bg-gradient-to-r from-[#00a2ff] to-[#0064ff] hover:from-[#0091e6] hover:to-[#0058e6] text-white'
  };
  
  // Größen-Klassen
  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
    xl: 'text-lg px-6 py-3'
  };
  
  // Breiten-Klassen
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Radius-Klassen
  const radiusClass = rounded ? 'rounded-full' : 'rounded-md';
  
  // Disabled-Klassen
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Icon-Klassen
  const iconSpacingLeft = leftIcon ? 'ml-2' : '';
  const iconSpacingRight = rightIcon ? 'mr-2' : '';
  
  // Zusammengesetzte Klassen
  const buttonClasses = `
    inline-flex items-center justify-center font-medium
    transition-colors duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a2ff]/50
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${widthClass}
    ${radiusClass}
    ${disabledClasses}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
