
/**
 * NFT Repository - Schnittstelle zu NFT-Daten
 */

// NFT-Typ
export interface NFT {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  collection_name?: string;
  network: string;
  token_id: string;
  contract_address: string;
  creator: string;
  owner: string;
  created_at: string;
  verified: boolean;
  metadata?: Record<string, unknown>;
}

// NFT-Metadaten für das Frontend
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

class NFTRepository {
  // Benutzer-NFTs abrufen
  async getUserNFTs(userId: string): Promise<NFT[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('owner', userId);
        
      if (error) {
        return [];
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // NFT-Details abrufen
  async getNFTDetails(nftId: string): Promise<NFT | null> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('id', nftId)
        .single();
        
      if (error) {
        return null;
      }
      
      return data || null;
    } catch (error) {
      return null;
    }
  }

  // NFT-Metadaten über Blockchain-API abrufen
  async getNFTMetadata(networkId: string, contractAddress: string, tokenId: string): Promise<NFTMetadata | null> {
    try {
      let apiUrl = '';
      let apiKey = '';
      
      switch (networkId.toLowerCase()) {
        case 'ethereum':
        case '1':
          apiUrl = 'https://eth-mainnet.g.alchemy.com/v2/';
          apiKey = import.meta.env.VITE_ALCHEMY_ETH_KEY || '';
          break;
        case 'polygon':
        case '137':
          apiUrl = 'https://polygon-mainnet.g.alchemy.com/v2/';
          apiKey = import.meta.env.VITE_ALCHEMY_POLYGON_KEY || '';
          break;
        case 'sepolia':
        case '11155111':
          apiUrl = 'https://eth-sepolia.g.alchemy.com/v2/';
          apiKey = import.meta.env.VITE_ALCHEMY_SEPOLIA_KEY || '';
          break;
        default:
          return null;
      }
      
      if (!apiKey) {
        return null;
      }
      
      const response = await fetch(`${apiUrl}${apiKey}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`);
      const data = await response.json();
      
      if (!data || !data.metadata) {
        return null;
      }
      
      return {
        name: data.metadata.name || 'Unnamed NFT',
        description: data.metadata.description || '',
        image: data.metadata.image || '',
        attributes: data.metadata.attributes || []
      };
    } catch (error) {
      return null;
    }
  }

  // Erstelle einen neuen NFT in der Datenbank
  async createNFT(nftData: Partial<NFT>): Promise<NFT | null> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const newNFT = {
        name: nftData.name || 'Unnamed NFT',
        description: nftData.description || '',
        image_url: nftData.image_url || 'https://via.placeholder.com/300',
        collection_name: nftData.collection_name || '',
        network: nftData.network || 'Ethereum',
        token_id: nftData.token_id || '0',
        contract_address: nftData.contract_address || '0x0',
        creator: nftData.creator || '',
        owner: nftData.owner || nftData.creator || '',
        created_at: new Date().toISOString(),
        verified: false,
        metadata: nftData.metadata || {}
      };
      
      const { data, error } = await supabase
        .from('nfts')
        .insert(newNFT)
        .select()
        .single();
        
      if (error) {
        return null;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }
}

export const nftRepository = new NFTRepository();
