
export interface VerificationStatus {
  success: boolean;
  status?: 'unverified' | 'pending' | 'verified';
  explorerUrl?: string;
  error?: string;
}

export interface VerificationRequest {
  contractAddress: string;
  network: string;
  constructorArgs: unknown[];
  contractName?: string;
  compilerVersion?: string;
}

export interface TokenVerificationData {
  id: string;
  token_id: string;
  verification_status: string;
  verification_date?: string;
  explorer_url?: string;
  compiler_version?: string;
  constructor_args?: string;
  contract_name?: string;
  verification_attempts?: number;
  last_error?: string;
  verification_type?: string;
  created_at: string;
  updated_at: string;
}
