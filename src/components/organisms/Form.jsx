import React from 'react';
import Button from '../atoms/Button';
import Spinner from '../atoms/Spinner';

/**
 * Form-Komponente für Formulare
 * 
 * @param {Object} props - Komponenten-Props
 * @param {React.ReactNode} props.children - Formular-Inhalt
 * @param {Function} props.onSubmit - Submit-Handler
 * @param {string} props.submitText - Text für den Submit-Button
 * @param {boolean} props.loading - Gibt an, ob das Formular gerade lädt
 * @param {string} props.loadingText - Text für den Submit-Button während des Ladens
 * @param {boolean} props.disabled - Gibt an, ob das Formular deaktiviert ist
 * @param {string} props.className - Zusätzliche CSS-Klassen
 * @returns {JSX.Element}
 */
const Form = ({
  children,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  loadingText = 'Loading...',
  disabled = false,
  className = '',
  ...props
}) => {
  // Submit-Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && !disabled && onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-6 ${className}`}
      {...props}
    >
      {children}
      
      {submitText && (
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || disabled}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <Spinner size="sm" color="white" />
                <span>{loadingText}</span>
              </span>
            ) : submitText}
          </Button>
        </div>
      )}
    </form>
  );
};

export default Form;
