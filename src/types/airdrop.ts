
// Definition der Typen für Airdrop-Funktionalität
export interface AirdropRecipient {
  id: string;
  campaign_id: string;
  wallet_address: string;
  amount: number;
  status: string;
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface AirdropCampaign {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  token_id: string;
  status: string;
  total_amount: number;
  recipients_count: number;
  transaction_hash?: string;
  completion_date?: string;
  created_at: string;
  updated_at: string;
  tokens?: Record<string, unknown>;
}

export interface AirdropDetails extends AirdropCampaign {
  token: Record<string, unknown>;
  recipients: AirdropRecipient[];
}
