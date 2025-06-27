export interface VerificationRequest {
  contractAddress: string;
  network: string;
  constructorArgs: string;
  contractName: string;
  compilerVersion: string;
}

export interface VerificationResponse {
  success: boolean;
  guid?: string;
  error?: string;
}

export interface VerificationStatus {
  success: boolean;
  status?: string;
  explorerUrl?: string;
  error?: string;
}
