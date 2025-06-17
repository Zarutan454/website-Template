
/**
 * Token Repository - Schnittstelle zu Token-Daten
 */

// Token-Typ
export interface Token {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  decimals: number;
  supply: string;
  creator: string;
  created_at: string;
  image_url?: string;
  verified: boolean;
  balance?: string;
}

// Token-Metadaten für das Frontend
export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contract: string;
  network: string;
}

class TokenRepository {
  // Benutzer-Tokens abrufen
  async getUserTokens(userId: string): Promise<Token[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*, tokens(*)')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user tokens:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(item => ({
        id: item.tokens.id,
        name: item.tokens.name,
        symbol: item.tokens.symbol,
        network: item.tokens.network,
        address: item.tokens.contract_address,
        decimals: item.tokens.decimals || 18,
        supply: item.tokens.total_supply,
        creator: item.tokens.creator_id,
        created_at: item.tokens.created_at,
        verified: item.tokens.verified || false,
        balance: item.balance || '0'
      }));
    } catch (error) {
      console.error('Error in getUserTokens:', error);
      return [];
    }
  }

  // Token-Details abrufen
  async getTokenDetails(tokenId: string): Promise<Token | null> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('id', tokenId)
        .single();
        
      if (error) {
        console.error('Error fetching token details:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        network: data.network,
        address: data.contract_address,
        decimals: data.decimals || 18,
        supply: data.total_supply,
        creator: data.creator_id,
        created_at: data.created_at,
        verified: data.verified || false
      };
    } catch (error) {
      console.error('Error in getTokenDetails:', error);
      return null;
    }
  }

  // Token-Metadaten über Blockchain-API abrufen
  async getTokenMetadata(networkId: string, address: string): Promise<TokenMetadata | null> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data: dbToken, error: dbError } = await supabase
        .from('tokens')
        .select('*')
        .eq('contract_address', address)
        .eq('network', networkId)
        .single();
        
      if (!dbError && dbToken) {
        return {
          name: dbToken.name,
          symbol: dbToken.symbol,
          decimals: dbToken.decimals || 18,
          totalSupply: dbToken.total_supply,
          contract: dbToken.contract_address,
          network: dbToken.network
        };
      }
      
      let apiUrl = '';
      let apiKey = '';
      
      switch (networkId.toLowerCase()) {
        case 'ethereum':
        case '1':
          apiUrl = 'https://api.etherscan.io/api';
          apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
          break;
        case 'sepolia':
        case '11155111':
          apiUrl = 'https://api-sepolia.etherscan.io/api';
          apiKey = import.meta.env.VITE_SEPOLIA_API_KEY || '';
          break;
        default:
          return null;
      }
      
      if (!apiKey) {
        console.warn('No API key found for token metadata');
        return null;
      }
      
      const tokenDataUrl = `${apiUrl}?module=token&action=tokeninfo&contractaddress=${address}&apikey=${apiKey}`;
      const tokenDataResponse = await fetch(tokenDataUrl);
      const tokenData = await tokenDataResponse.json();
      
      if (tokenData.status !== '1' || !tokenData.result || tokenData.result.length === 0) {
        console.warn('No token data found from blockchain API');
        return null;
      }
      
      const tokenInfo = tokenData.result[0];
      
      return {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: parseInt(tokenInfo.divisor || '18', 10),
        totalSupply: tokenInfo.totalSupply || '0',
        contract: address,
        network: networkId
      };
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  }

  // Erstelle einen neuen Token in der Datenbank
  async createToken(tokenData: Partial<Token>): Promise<Token | null> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const newToken = {
        name: tokenData.name || 'Unknown Token',
        symbol: tokenData.symbol || 'UNK',
        network: tokenData.network || 'Ethereum',
        contract_address: tokenData.address || '0x0',
        decimals: tokenData.decimals || 18,
        total_supply: tokenData.supply || '0',
        creator_id: tokenData.creator || '',
        created_at: new Date().toISOString(),
        verified: false,
        deployment_status: 'pending'
      };
      
      const { data, error } = await supabase
        .from('tokens')
        .insert(newToken)
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting token into database:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        network: data.network,
        address: data.contract_address,
        decimals: data.decimals,
        supply: data.total_supply,
        creator: data.creator_id,
        created_at: data.created_at,
        verified: data.verified
      };
    } catch (error) {
      console.error('Error creating token:', error);
      return null;
    }
  }
}

export const tokenRepository = new TokenRepository();
