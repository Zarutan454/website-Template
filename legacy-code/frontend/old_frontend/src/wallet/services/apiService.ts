
import { supabase } from '@/lib/supabase';
import { AirdropCampaign, AirdropDetails, AirdropRecipient } from './types';
import { toast } from 'sonner';

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  total_supply: number;
  creator_id: string;
  network: string;
  contract_address?: string;
  features?: string[];
}

export interface TokenMetrics {
  price_usd?: number;
  market_cap?: number;
  volume_24h?: number;
  holder_count?: number;
  liquidity_usd?: number;
}

export type TokenLock = {
  id: string;
  token_id: string;
  amount: number;
  unlock_date: Date;
  lock_date: Date;
  lock_owner: string;
  transaction_hash?: string;
  network: string;
};

export type LiquidityLock = {
  id: string;
  token_id: string;
  pair_address: string;
  amount: number;
  unlock_date: Date;
  lock_date: Date;
  lock_owner: string;
  transaction_hash?: string;
  network: string;
};

export const fetchUserTokens = async (userId: string): Promise<TokenData[]> => {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('creator_id', userId);

    if (error) throw error;
    return data as TokenData[];
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return [];
  }
};

export const fetchTokenById = async (tokenId: string): Promise<TokenData | null> => {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .single();

    if (error) throw error;
    return data as TokenData;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
};

export const updateTokenMetrics = async (tokenId: string, metrics: Partial<TokenMetrics>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tokens')
      .update({ token_metrics: metrics })
      .eq('id', tokenId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating token metrics:', error);
    return false;
  }
};

export const fetchAirdropCampaigns = async (tokenId?: string): Promise<AirdropCampaign[]> => {
  try {
    let query = supabase
      .from('airdrop_campaigns')
      .select('*');
    
    if (tokenId) {
      query = query.eq('token_id', tokenId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as AirdropCampaign[];
  } catch (error) {
    console.error('Error fetching airdrop campaigns:', error);
    return [];
  }
};

export const createAirdropCampaign = async (campaign: Partial<AirdropCampaign>, recipients: Partial<AirdropRecipient>[]): Promise<AirdropCampaign | null> => {
  try {
    // Insert the campaign
    const { data: campaignData, error: campaignError } = await supabase
      .from('airdrop_campaigns')
      .insert(campaign)
      .select()
      .single();
    
    if (campaignError) throw campaignError;
    
    // Insert recipients for the campaign
    if (recipients.length > 0) {
      const recipientsWithCampaignId = recipients.map(recipient => ({
        ...recipient,
        campaign_id: campaignData.id
      }));
      
      const { error: recipientsError } = await supabase
        .from('airdrop_recipients')
        .insert(recipientsWithCampaignId);
      
      if (recipientsError) throw recipientsError;
    }
    
    return campaignData as AirdropCampaign;
  } catch (error) {
    console.error('Error creating airdrop campaign:', error);
    return null;
  }
};

export const fetchAirdropRecipients = async (campaignId: string): Promise<AirdropRecipient[]> => {
  try {
    const { data, error } = await supabase
      .from('airdrop_recipients')
      .select('*')
      .eq('campaign_id', campaignId);
    
    if (error) throw error;
    return data as AirdropRecipient[];
  } catch (error) {
    console.error('Error fetching airdrop recipients:', error);
    return [];
  }
};

export const updateAirdropCampaignStatus = async (campaignId: string, status: string, transactionHash?: string): Promise<boolean> => {
  try {
    const updates: { status: string; transaction_hash?: string; completion_date?: string } = { status };
    
    if (transactionHash) {
      updates.transaction_hash = transactionHash;
    }
    
    if (status === 'completed') {
      updates.completion_date = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('airdrop_campaigns')
      .update(updates)
      .eq('id', campaignId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating airdrop campaign status:', error);
    return false;
  }
};

export const updateAirdropRecipientStatus = async (recipientId: string, status: string, transactionHash?: string): Promise<boolean> => {
  try {
    const updates: { status: string; transaction_hash?: string; completion_date?: string } = { status };
    
    if (transactionHash) {
      updates.transaction_hash = transactionHash;
    }
    
    const { error } = await supabase
      .from('airdrop_recipients')
      .update(updates)
      .eq('id', recipientId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating airdrop recipient status:', error);
    return false;
  }
};

export const fetchAirdropDetails = async (campaignId: string): Promise<AirdropDetails | null> => {
  try {
    // Fetch campaign details
    const { data: campaignData, error: campaignError } = await supabase
      .from('airdrop_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError) throw campaignError;
    
    // Fetch associated token
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', campaignData.token_id)
      .single();
    
    if (tokenError) throw tokenError;
    
    // Fetch recipients
    const { data: recipientsData, error: recipientsError } = await supabase
      .from('airdrop_recipients')
      .select('*')
      .eq('campaign_id', campaignId);
    
    if (recipientsError) throw recipientsError;
    
    // Combine data into a single object that matches AirdropDetails type
    const airdropDetails: AirdropDetails = {
      ...campaignData,
      token: tokenData,
      recipients: recipientsData as AirdropRecipient[]
    };
    
    return airdropDetails;
  } catch (error) {
    console.error('Error fetching airdrop details:', error);
    return null;
  }
};

export const fetchTokenLocks = async (tokenId: string): Promise<TokenLock[]> => {
  try {
    const { data, error } = await supabase
      .from('token_locks')
      .select('*')
      .eq('token_id', tokenId);
    
    if (error) throw error;
    return data as TokenLock[];
  } catch (error) {
    console.error('Error fetching token locks:', error);
    return [];
  }
};

export const createTokenLock = async (lock: Partial<TokenLock>): Promise<TokenLock | null> => {
  try {
    // Validate required fields
    if (!lock.token_id || !lock.amount || !lock.unlock_date || !lock.lock_owner || !lock.network) {
      throw new Error('Missing required fields for token lock');
    }
    
    const { data, error } = await supabase
      .from('token_locks')
      .insert(lock)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Token lock created successfully!');
    return data as TokenLock;
  } catch (error) {
    console.error('Error creating token lock:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to create token lock');
    return null;
  }
};

export const fetchLiquidityLocks = async (tokenId: string): Promise<LiquidityLock[]> => {
  try {
    const { data, error } = await supabase
      .from('lp_token_locks')
      .select('*')
      .eq('token_id', tokenId);
    
    if (error) throw error;
    return data as LiquidityLock[];
  } catch (error) {
    console.error('Error fetching liquidity locks:', error);
    return [];
  }
};

export const createLiquidityLock = async (lock: Partial<LiquidityLock>): Promise<LiquidityLock | null> => {
  try {
    // Validate required fields
    if (!lock.token_id || !lock.pair_address || !lock.amount || !lock.unlock_date || !lock.lock_owner || !lock.network) {
      throw new Error('Missing required fields for liquidity lock');
    }
    
    const { data, error } = await supabase
      .from('lp_token_locks')
      .insert(lock)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Liquidity lock created successfully!');
    return data as LiquidityLock;
  } catch (error) {
    console.error('Error creating liquidity lock:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to create liquidity lock');
    return null;
  }
};
