import React, { forwardRef } from 'react';

/**
 * Input-Komponente für Formulareingaben
 * 
 * @param {Object} props - Komponenten-Props
 * @param {string} props.type - Typ des Inputs: 'text', 'email', 'password', usw.
 * @param {string} props.id - ID des Inputs
 * @param {string} props.name - Name des Inputs
 * @param {string} props.placeholder - Platzhalter-Text
 * @param {boolean} props.disabled - Gibt an, ob der Input deaktiviert ist
 * @param {boolean} props.error - Gibt an, ob ein Fehler vorliegt
 * @param {string} props.errorText - Fehlertext
 * @param {React.ReactNode} props.leftIcon - Icon links vom Input
 * @param {React.ReactNode} props.rightIcon - Icon rechts vom Input
 * @param {string} props.className - Zusätzliche CSS-Klassen
 * @returns {JSX.Element}
 */
const Input = forwardRef(({
  type = 'text',
  id,
  name,
  placeholder = '',
  disabled = false,
  error = false,
  errorText = '',
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  // Basis-Klassen
  const baseClasses = `
    w-full rounded-md bg-[#06071F] border border-[#00a2ff]/20
    focus:outline-none focus:ring-2 focus:ring-[#00a2ff]/30 focus:border-[#00a2ff]
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `;
  
  // Padding-Klassen basierend auf Icons
  const paddingClasses = `
    ${leftIcon ? 'pl-10' : 'pl-4'}
    ${rightIcon ? 'pr-10' : 'pr-4'}
    py-2
  `;
  
  // Fehler-Klassen
  const errorClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
    : '';
  
  // Zusammengesetzte Klassen
  const inputClasses = `
    ${baseClasses}
    ${paddingClasses}
    ${errorClasses}
    ${className}
  `.trim();

  return (
    <div className="relative">
      {/* Left Icon */}
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#a0e4ff]/70">
          {leftIcon}
        </div>
      )}
      
      {/* Input */}
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      
      {/* Right Icon */}
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#a0e4ff]/70">
          {rightIcon}
        </div>
      )}
      
      {/* Error Message */}
      {error && errorText && (
        <p className="mt-1 text-xs text-red-500">{errorText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
