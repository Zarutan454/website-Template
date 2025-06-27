import { TOKEN_SOURCE_CODE } from './contractSource';

export interface VerificationRequest {
  contractAddress: string;
  network: string;
  constructorArgs: string;
  contractName: string;
  compilerVersion: string;
}

export const verifyContract = async (
  request: VerificationRequest,
  apiKey: string
): Promise<{ success: boolean; guid?: string; error?: string }> => {
  const apiUrl = request.network === 'ethereum' 
    ? 'https://api.etherscan.io/api'
    : 'https://api-holesky.etherscan.io/api';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apikey: apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: request.contractAddress,
        sourceCode: TOKEN_SOURCE_CODE,
        codeformat: 'solidity-single-file',
        contractname: request.contractName,
        compilerversion: 'v0.8.24+commit.e11b9ed9',
        optimizationUsed: '1',
        runs: '200',
        constructorArguements: request.constructorArgs
      })
    });

    const data = await response.json();
    
    if (data.status === '1' && data.message === 'OK') {
      return { success: true, guid: data.result };
    } else {
      throw new Error(data.result || 'Contract verification failed');
    }
  } catch (error) {
    console.error('Error verifying contract:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
