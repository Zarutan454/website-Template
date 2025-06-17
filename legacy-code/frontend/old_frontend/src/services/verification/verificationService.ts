import { supabase } from '@/lib/supabase';
import { getExplorerUrl, getFullExplorerUrl } from '../explorer/explorerUrlService';

/**
 * Prüft den Verifikationsstatus eines Contracts
 */
export const checkVerificationStatus = async (contractAddress: string): Promise<{
  success: boolean;
  status?: 'unverified' | 'pending' | 'verified';
  explorerUrl?: string;
  error?: string;
}> => {
  try {
    // Check for the contract in our database first
    const { data, error } = await supabase
      .from('token_verification_status')
      .select('*')
      .eq('contract_address', contractAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // If we have a record, return its status
    if (data) {
      const explorerUrl = data.explorer_url || null;
      
      return {
        success: true,
        status: data.verification_status as 'unverified' | 'pending' | 'verified',
        explorerUrl: explorerUrl
      };
    }
    
    try {
      const { data: tokenData } = await supabase
        .from('tokens')
        .select('network')
        .eq('contract_address', contractAddress)
        .single();
        
      const network = tokenData?.network || 'ethereum';
      const explorerUrl = getFullExplorerUrl(network, 'code', contractAddress);
      
      if (network.toLowerCase() === 'ethereum' || network.toLowerCase() === 'sepolia') {
        const apiKey = network.toLowerCase() === 'ethereum' 
          ? import.meta.env.VITE_ETHERSCAN_API_KEY 
          : import.meta.env.VITE_SEPOLIA_API_KEY;
          
        if (!apiKey) {
          console.warn(`No API key found for ${network}`);
          return { success: true, status: 'unverified', explorerUrl };
        }
        
        const baseUrl = network.toLowerCase() === 'ethereum'
          ? 'https://api.etherscan.io/api'
          : 'https://api-sepolia.etherscan.io/api';
          
        const url = `${baseUrl}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === '1' && data.result && data.result.length > 0) {
          const isVerified = data.result[0].SourceCode && data.result[0].SourceCode.length > 0;
          
          await supabase
            .from('token_verification_status')
            .upsert({
              contract_address: contractAddress,
              network,
              verification_status: isVerified ? 'verified' : 'unverified',
              explorer_url: explorerUrl,
              last_checked: new Date().toISOString()
            }, {
              onConflict: 'contract_address'
            });
            
          return {
            success: true,
            status: isVerified ? 'verified' : 'unverified',
            explorerUrl
          };
        }
      }
      
      return {
        success: true,
        status: 'unverified',
        explorerUrl
      };
    } catch (error) {
      console.error('Error checking blockchain explorer:', error);
      return {
        success: true,
        status: 'unverified'
      };
    }
  } catch (error) {
    console.error('Error checking verification status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking verification status'
    };
  }
};

/**
 * Sendet eine Anfrage zur Verifikation eines Smart Contracts
 */
export const verifyContract = async (
  contractAddress: string,
  network: string,
  constructorArgs: (string | number | boolean | object)[]
): Promise<{
  success: boolean;
  guid?: string;
  error?: string;
}> => {
  try {
    console.log(`Verifying contract ${contractAddress} on ${network} with args:`, constructorArgs);
    
    // First, let's record this verification attempt in our database
    const { data: recordData, error: recordError } = await supabase
      .from('token_verification_status')
      .upsert({
        contract_address: contractAddress,
        network,
        verification_status: 'pending',
        constructor_args: constructorArgs,
        last_attempt: new Date().toISOString(),
        explorer_url: getFullExplorerUrl(network, 'code', contractAddress)
      }, {
        onConflict: 'contract_address'
      })
      .select();
    
    if (recordError) {
      console.error('Error recording verification attempt:', recordError);
      throw recordError;
    }
    
    let apiUrl = '';
    let apiKey = '';
    let guid = '';
    
    switch (network.toLowerCase()) {
      case 'ethereum':
        apiUrl = 'https://api.etherscan.io/api';
        apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
        break;
      case 'sepolia':
        apiUrl = 'https://api-sepolia.etherscan.io/api';
        apiKey = import.meta.env.VITE_SEPOLIA_API_KEY || '';
        break;
      case 'polygon':
        apiUrl = 'https://api.polygonscan.com/api';
        apiKey = import.meta.env.VITE_POLYGONSCAN_API_KEY || '';
        break;
      case 'arbitrum':
        apiUrl = 'https://api.arbiscan.io/api';
        apiKey = import.meta.env.VITE_ARBISCAN_API_KEY || '';
        break;
      default:
        console.warn(`Unsupported network for verification: ${network}`);
        throw new Error(`Unsupported network for verification: ${network}`);
    }
    
    if (!apiKey) {
      throw new Error(`No API key found for network: ${network}`);
    }
    
    const constructorArgsString = formatConstructorArgs(constructorArgs);
    
    const { data: contractData, error: contractError } = await supabase
      .from('tokens')
      .select('source_code, abi')
      .eq('contract_address', contractAddress)
      .single();
      
    if (contractError || !contractData || !contractData.source_code) {
      throw new Error('Contract source code not found in database');
    }
    
    const params = new URLSearchParams({
      apikey: apiKey,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: contractAddress,
      sourceCode: contractData.source_code,
      codeformat: 'solidity-single-file',
      contractname: 'Token', // This should be the actual contract name from the source
      compilerversion: 'v0.8.17+commit.8df45f5f', // This should match the compiler used
      optimizationUsed: '1',
      runs: '200',
      constructorArguements: constructorArgsString.startsWith('0x') ? constructorArgsString : '0x' + constructorArgsString
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    const data = await response.json();
    
    if (data.status !== '1' || !data.result) {
      throw new Error(`Verification request failed: ${data.message || 'Unknown error'}`);
    }
    
    guid = data.result;
    
    setTimeout(async () => {
      try {
        const statusUrl = `${apiUrl}?apikey=${apiKey}&module=contract&action=checkverifystatus&guid=${guid}`;
        const statusResponse = await fetch(statusUrl);
        const statusData = await statusResponse.json();
        
        const success = statusData.status === '1' && statusData.result === 'Pass - Verified';
        
        // Update the verification status in the database
        await supabase
          .from('token_verification_status')
          .update({
            verification_status: success ? 'verified' : 'unverified',
            verified_at: success ? new Date().toISOString() : null,
            last_error: success ? null : statusData.result || 'Verification failed'
          })
          .eq('contract_address', contractAddress);
        
        console.log(`Contract verification ${success ? 'succeeded' : 'failed'} for ${contractAddress}`);
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }, 30000); // Check after 30 seconds
    
    return {
      success: true,
      guid
    };
  } catch (error) {
    console.error('Error verifying contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during verification'
    };
  }
};

/**
 * Bereitet die Constructor-Argumente für die Verifikation vor
 */
export const formatConstructorArgs = (args: (string | number | boolean | object)[]): string => {
  try {
    // Handle different arg types
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'boolean') {
        return arg.toString();
      } else if (typeof arg === 'string') {
        // If it looks like an address, don't add extra quotes
        if (arg.startsWith('0x') && arg.length === 42) {
          return arg;
        }
        return `"${arg}"`;
      } else if (typeof arg === 'number' || typeof arg === 'bigint') {
        return arg.toString();
      } else if (arg && typeof arg === 'object' && 'toString' in arg) {
        return arg.toString();
      }
      return String(arg);
    });
    
    return formattedArgs.join(',');
  } catch (error) {
    console.error('Error formatting constructor args:', error);
    return '';
  }
};

// Neue Funktionen für Kompatibilität mit der Token-Verifikation
export const submitVerificationRequest = async (params: {
  contractAddress: string;
  network: string;
  constructorArgs: (string | number | boolean | object)[];
}): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verwende die bestehende verifyContract-Funktion
    const result = await verifyContract(
      params.contractAddress,
      params.network,
      params.constructorArgs
    );
    
    return { 
      success: result.success,
      error: result.error
    };
  } catch (error) {
    console.error('Contract verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler bei der Verifikation'
    };
  }
};
