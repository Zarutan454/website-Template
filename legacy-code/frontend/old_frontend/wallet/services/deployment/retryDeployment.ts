import { supabase } from '@/integrations/supabase/client';
import { ContractFactory, JsonRpcProvider } from 'ethers';
import { toast } from '@/components/ui/use-toast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const withRetry = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> => {
  let lastError: Error | null = null;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      // Get current user for audit logging
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      console.log(`Attempting ${operationName} (attempt ${attempt}/${maxRetries})`);
      const result = await operation();

      // Log successful attempt
      await supabase.rpc('create_audit_log', {
        p_user_id: user.id,
        p_action: `${operationName}_success`,
        p_details: {
          operation: operationName,
          attempt,
          status: 'success',
          timestamp: new Date().toISOString()
        },
        p_ip_address: ''
      });

      return result;
    } catch (error) {
      console.error(`${operationName} attempt ${attempt} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Get current user for audit logging
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Log failed attempt
        await supabase.rpc('create_audit_log', {
          p_user_id: user.id,
          p_action: `${operationName}_failed`,
          p_details: {
            operation: operationName,
            attempt,
            status: 'failed',
            error: lastError.message,
            timestamp: new Date().toISOString()
          },
          p_ip_address: ''
        });
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      attempt++;
    }
  }

  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
};

export const retryDeployment = async (
  factory: ContractFactory,
  provider: JsonRpcProvider,
  args: any[]
) => {
  return withRetry('contract_deployment', async () => {
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    return contract;
  });
};

export const handleDeploymentError = (error: any): string => {
  console.error('Detailed deployment error:', error);

  if (!error) return 'Unbekannter Fehler beim Deployment';

  // Network related errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT' || error.code === 'SERVER_ERROR') {
    return 'Netzwerkfehler - Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut';
  }

  // Gas related errors
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Nicht genügend ETH für Gas-Gebühren';
  }

  // Contract specific errors
  if (error.code === 'CONTRACT_VALIDATION_ERROR') {
    return 'Fehler bei der Contract-Validierung';
  }

  // User rejected
  if (error.code === 'ACTION_REJECTED' || error.code === 'USER_REJECTED') {
    return 'Transaktion wurde vom Benutzer abgelehnt';
  }

  // Nonce errors
  if (error.code === 'NONCE_EXPIRED' || error.code === 'REPLACEMENT_UNDERPRICED') {
    return 'Nonce-Fehler - Bitte versuchen Sie es erneut';
  }

  // Provider errors
  if (error.code === 'CALL_EXCEPTION') {
    return 'Smart Contract Ausführungsfehler - Bitte überprüfen Sie die Parameter';
  }

  // Transaction errors
  if (error.code === 'TRANSACTION_REPLACED') {
    return 'Transaktion wurde ersetzt - Bitte warten Sie auf die neue Transaktion';
  }

  // Generic error with message
  if (error.message) {
    return `Deployment-Fehler: ${error.message}`;
  }

  // Default error
  return 'Ein unerwarteter Fehler ist aufgetreten';
};