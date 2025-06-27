
export interface TokenSocialLinks {
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  discord: string | null;
  medium: string | null;
  github: string | null;
}

export interface TokenMetrics {
  price_usd: number | null;
  market_cap: number | null;
  volume_24h: number | null;
  holder_count: number | null;
  liquidity_usd: number | null;
  price_change_24h?: number | null;
  price_change_7d?: number | null;
}

export interface Token {
  id: string;
  creator_id: string;
  name: string;
  symbol: string;
  initial_supply?: number;
  total_supply: number;  // Ensure this is always a number, not string | number
  contract_address?: string;
  network: string;
  status?: 'draft' | 'deployed' | 'verified';
  created_at: string;
  updated_at: string;
  logo_url?: string | null;
  is_verified?: boolean;
  verification_date?: string | null;
  verification_details?: Record<string, unknown> | null;
  social_links?: TokenSocialLinks;
  token_type?: 'standard' | 'business' | 'marketing';
  can_mint?: boolean;
  can_burn?: boolean;
  decimals?: number;
  description?: string;
  features?: string[];
  token_metrics?: TokenMetrics;
  token_verification_status?: Array<{
    verification_status: 'verified' | 'unverified' | 'pending';
    verification_date?: string;
    explorer_url?: string;
  }>;
  website_url?: string;
  twitter_url?: string;
  telegram_url?: string;
  discord_url?: string;
  
  // Additional fields for business tokens
  max_transaction_limit?: string;
  max_wallet_limit?: string;
  max_supply?: string;
  
  // Additional fields for marketing tokens
  buy_tax?: number;
  sell_tax?: number;
  marketing_wallet?: string;
  charity_wallet?: string;
  dev_wallet?: string;
  
  // Layer 2 deployment properties
  layer_2_bridge_address?: string;
  layer_2_network_type?: string;
  layer_2_deployment_status?: string;
}

export interface TokenWithJSONB extends Omit<Token, 'token_metrics' | 'social_links'> {
  token_metrics: string;
  social_links: string;
}

// Add NFT related types that were missing
export interface NFTAttribute {
  trait_type: string;
  value: string;
  display_type?: string;
  rarity?: number;
}

export interface TokenTransfer {
  id: string;
  token_id: string;
  from_address: string;
  to_address: string;
  amount: number;
  transaction_hash: string;
  network: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Export AirdropCampaign, AirdropRecipient, AirdropDetails for apiService
export interface AirdropCampaign {
  id: string;
  creator_id: string;
  token_id: string;
  name: string;
  description?: string;
  total_amount: number;
  recipients_count: number;
  status: 'draft' | 'pending' | 'completed' | 'failed';
  completion_date?: string;
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface AirdropRecipient {
  id: string;
  campaign_id: string;
  wallet_address: string;
  amount: number;
  status: 'pending' | 'sent' | 'failed';
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface AirdropDetails {
  campaign: AirdropCampaign;
  recipients: AirdropRecipient[];
  token?: {
    name: string;
    symbol: string;
    contract_address?: string;
    network: string;
  };
}
