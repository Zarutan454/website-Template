
/**
 * Utilities for handling network requests with retry capabilities
 */
import { toast } from 'sonner';

/**
 * Executes a network request with automatic retry capability
 * @param fetchFn The function to execute that returns a Promise
 * @param retryCount Maximum number of retry attempts
 * @param initialDelay Initial delay before retrying in milliseconds
 * @returns Promise with the result of the fetch function
 */
export const fetchWithRetry = async <T,>(
  fetchFn: () => Promise<T>,
  retryCount: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let currentRetry = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fetchFn();
    } catch (error) {
      currentRetry++;
      console.error(`Fehler bei Netzwerkanfrage (Versuch ${currentRetry}/${retryCount}):`, error);
      
      if (currentRetry >= retryCount) {
        throw error;
      }
      
      // Exponentielles Backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

/**
 * Handles common error processing for network requests
 * @param error The error that occurred
 * @param context Context information about where the error occurred
 * @param showToast Whether to show a toast notification
 * @returns Formatted error message
 */
export const processNetworkError = (
  error: unknown, 
  context: string, 
  showToast: boolean = true
): string => {
  const errorMessage = error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten';
  console.error(`Fehler in ${context}:`, error);
  
  if (showToast) {
    toast.error(errorMessage);
  }
  
  return errorMessage;
};
