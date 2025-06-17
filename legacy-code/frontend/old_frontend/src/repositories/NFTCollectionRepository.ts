
import { BaseRepository } from './BaseRepository';
import { NFTCollection } from '@/types/nft';

/**
 * Repository for managing NFT collections
 */
export class NFTCollectionRepository extends BaseRepository {
  /**
   * Create a new NFT collection
   */
  async createCollection(collectionData: Partial<NFTCollection>): Promise<NFTCollection | null> {
    try {
      const { data, error } = await this.supabase
        .from('nft_collections')
        .insert({
          name: collectionData.name,
          symbol: collectionData.symbol,
          description: collectionData.description || '',
          imageUrl: collectionData.imageUrl,
          bannerUrl: collectionData.bannerUrl,
          creatorId: collectionData.creatorId,
          creatorName: collectionData.creatorName,
          network: collectionData.network,
          royaltyFee: collectionData.royaltyFee || 0,
          categories: collectionData.categories,
          featured: false,
          verified: false
        })
        .select()
        .single();

      if (error) {
        this.logError('createCollection', error);
        return null;
      }

      return data as NFTCollection;
    } catch (error) {
      this.logError('createCollection', error);
      return null;
    }
  }

  /**
   * Get collections by creator ID
   */
  async getCollectionsByCreator(creatorId: string): Promise<NFTCollection[]> {
    try {
      const { data, error } = await this.supabase
        .from('nft_collections')
        .select('*')
        .eq('creatorId', creatorId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logError('getCollectionsByCreator', error);
        return [];
      }

      return data as NFTCollection[];
    } catch (error) {
      this.logError('getCollectionsByCreator', error);
      return [];
    }
  }
}

export const nftCollectionRepository = new NFTCollectionRepository();
