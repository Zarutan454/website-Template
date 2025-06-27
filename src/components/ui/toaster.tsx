
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

/**
 * Valid toast variants for the shadcn UI Toast component
 */
type ValidToastVariant = 'default' | 'destructive';

/**
 * Maps any toast variant to a valid Toast component variant.
 * Additional variants like 'success', 'warning', 'info' are mapped to 'default'.
 * 
 * @param variant - The variant to validate and map
 * @returns A valid toast variant ('default' or 'destructive')
 */
const mapToValidVariant = (variant: string | undefined): ValidToastVariant => {
  if (variant === 'destructive') return 'destructive';
  return 'default'; // All other variants map to default
};

/**
 * Toaster-Komponente zur Anzeige von Toast-Benachrichtigungen.
 * Verwendet den `useToast`-Hook, um die Liste der Toasts zu erhalten, und rendert sie mit `ToastProvider`.
 */
export const Toaster = React.memo(() => {
  const { toasts } = useToast();

  // Überprüfen, ob `toasts` gültig ist
  if (!toasts || !Array.isArray(toasts)) {
    return null;
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Extract the variant from props
        const { variant: originalVariant, ...restProps } = props;
        
        // Map to valid variant and create new props object
        const validVariant = mapToValidVariant(originalVariant as string | undefined);
        const toastProps = { ...restProps, variant: validVariant };
        
        return (
          <Toast key={id} {...toastProps}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
});

/**
 * Anzeigename für die Komponente (nützlich für Debugging und React DevTools).
 */
Toaster.displayName = 'Toaster';
