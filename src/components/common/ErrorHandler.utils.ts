import { toast } from 'sonner';

export const handleError = (error: unknown, context: string = 'unknown') => {
  console.error(`Error in ${context}:`, error);
  
  let message = 'Ein unerwarteter Fehler ist aufgetreten';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  toast.error(message);
}; 