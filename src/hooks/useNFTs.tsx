import { useState, useCallback } from 'react';
import { NFT, NFTTransaction, NFTCollection } from '@/types/nft';
// import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
// import { nftAPI } from '@/lib/django-api-new'; // TODO: Implement Django API calls

export const useNFTs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const { user: profile } = useAuth();

  // Fetch all NFT collections
  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use any type to bypass TypeScript checking
      const { data, error } = await (supabase as any)
        .from('nft_collections')
        .select('*');

      if (error) throw error;

      const typedCollections = data as unknown as NFTCollection[];
      setCollections(typedCollections);
      return typedCollections;
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a specific NFT collection by ID
  const fetchCollectionById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use any type to bypass TypeScript checking
      const { data, error } = await (supabase as any)
        .from('nft_collections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as unknown as NFTCollection;
    } catch (err) {
      console.error('Error fetching collection by ID:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all NFTs
  const fetchNFTs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use any type to bypass TypeScript checking
      const { data, error } = await (supabase as any)
        .from('nfts')
        .select('*');

      if (error) throw error;

      const typedNFTs = data as unknown as NFT[];
      setNfts(typedNFTs);
      return typedNFTs;
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFeaturedNFTs = useCallback(async (limit = 8) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch NFTs from Supabase
      const { data, error } = await (supabase as any)
        .from('nfts')
        .select('*')
        .limit(limit);

      if (error) throw error;

      return data as unknown as NFT[];
    } catch (err) {
      console.error('Error fetching featured NFTs:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPopularNFTs = useCallback(async (limit = 8) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch NFTs from Supabase sorted by viewCount or favoriteCount
      const { data, error } = await (supabase as any)
        .from('nfts')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as unknown as NFT[];
    } catch (err) {
      console.error('Error fetching popular NFTs:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNFTById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch a specific NFT by ID
      const { data, error } = await (supabase as any)
        .from('nfts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Increment view count
      if (profile) {
        await (supabase as any)
          .from('nfts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);
      }

      return data as unknown as NFT;
    } catch (err) {
      console.error('Error fetching NFT by ID:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const fetchTransactions = useCallback(async (nftId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch transactions for a specific NFT
      const { data, error } = await (supabase as any)
        .from('nft_transactions')
        .select('*')
        .eq('nft_id', nftId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as unknown as NFTTransaction[];
    } catch (err) {
      console.error('Error fetching NFT transactions:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buyNFT = useCallback(async (nftId: string) => {
    if (!profile) {
      toast.error('Du musst angemeldet sein, um ein NFT zu kaufen');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get NFT details
      const { data: nft, error: nftError } = await (supabase as any)
        .from('nfts')
        .select('*')
        .eq('id', nftId)
        .single();

      if (nftError) throw nftError;

      if (!nft.listed) {
        toast.error('Dieses NFT steht nicht zum Verkauf');
        return false;
      }

      if (nft.owner_id === profile.id) {
        toast.error('Du besitzt dieses NFT bereits');
        return false;
      }

      // Create transaction
      const { error: txError } = await (supabase as any)
        .from('nft_transactions')
        .insert({
          nft_id: nftId,
          from_address: nft.owner_id,
          from_name: nft.owner_name,
          to_address: profile.id,
          to_name: profile.display_name || profile.username,
          transaction_hash: 'tx_' + Math.random().toString(36).substring(2, 15),
          transaction_type: 'sale',
          price: nft.price,
          currency: nft.currency,
          network: nft.network,
          status: 'completed'
        });

      if (txError) throw txError;

      // Update NFT ownership
      const { error: updateError } = await (supabase as any)
        .from('nfts')
        .update({
          owner_id: profile.id,
          owner_name: profile.display_name || profile.username,
          listed: false,
          last_sale_price: nft.price,
          last_sale_currency: nft.currency
        })
        .eq('id', nftId);

      if (updateError) throw updateError;

      toast.success('NFT erfolgreich gekauft!');
      return true;
    } catch (err) {
      console.error('Error buying NFT:', err);
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const likeNFT = useCallback(async (nftId: string) => {
    if (!profile) {
      toast.error('Du musst angemeldet sein, um ein NFT zu liken');
      return false;
    }

    try {
      // Check if user already liked this NFT
      const { data: existingLike, error: likeError } = await (supabase as any)
        .from('nft_likes')
        .select('*')
        .eq('nft_id', nftId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (likeError && likeError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        console.error('Error checking like status:', likeError);
        return false;
      }

      if (existingLike) {
        // User already liked, so unlike
        const { error: unlikeError } = await (supabase as any)
          .from('nft_likes')
          .delete()
          .eq('nft_id', nftId)
          .eq('user_id', profile.id);

        if (unlikeError) {
          console.error('Error unliking NFT:', unlikeError);
          return false;
        }

        // Update favorite count by calling our custom function
        const { error: rpcError } = await (supabase as any).rpc('decrement_nft_favorites', { nft_id: nftId });
        
        if (rpcError) {
          console.error('Error updating favorite count:', rpcError);
        }

        return true;
      } else {
        // Add new like
        const { error: addLikeError } = await (supabase as any)
          .from('nft_likes')
          .insert({
            nft_id: nftId,
            user_id: profile.id
          });

        if (addLikeError) {
          console.error('Error liking NFT:', addLikeError);
          return false;
        }

        // Update favorite count by calling our custom function
        const { error: rpcError } = await (supabase as any).rpc('increment_nft_favorites', { nft_id: nftId });
        
        if (rpcError) {
          console.error('Error updating favorite count:', rpcError);
        }

        return true;
      }
    } catch (err) {
      console.error('Error toggling NFT like:', err);
      return false;
    }
  }, [profile]);

  const isNFTLiked = useCallback(async (nftId: string) => {
    if (!profile) return false;

    try {
      const { data, error } = await (supabase as any)
        .from('nft_likes')
        .select('*')
        .eq('nft_id', nftId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
      }

      return !!data;
    } catch (err) {
      console.error('Error checking if NFT is liked:', err);
      return false;
    }
  }, [profile]);

  // Create a new NFT
  const createNFT = useCallback(async (nftData: Partial<NFT>) => {
    if (!profile) {
      toast.error('Du musst angemeldet sein, um ein NFT zu erstellen');
      throw new Error('Authentication required');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get collection details
      const { data: collection, error: collectionError } = await (supabase as any)
        .from('nft_collections')
        .select('name')
        .eq('id', nftData.collectionId)
        .single();

      if (collectionError) throw collectionError;

      const tokenId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Insert the new NFT
      const { data, error } = await (supabase as any)
        .from('nfts')
        .insert({
          name: nftData.name,
          description: nftData.description || '',
          image_url: nftData.imageUrl,
          collection_id: nftData.collectionId,
          collection_name: collection.name,
          creator_id: profile.id,
          creator_name: profile.display_name || profile.username,
          owner_id: profile.id,
          owner_name: profile.display_name || profile.username,
          token_id: tokenId,
          network: nftData.network,
          listed: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Insert attributes if provided
      if (nftData.attributes && nftData.attributes.length > 0) {
        const attributesData = nftData.attributes.map(attr => ({
          nft_id: data.id,
          trait_type: attr.trait_type,
          value: attr.value.toString(),
          display_type: attr.display_type || null
        }));

        const { error: attrError } = await (supabase as any)
          .from('nft_attributes')
          .insert(attributesData);

        if (attrError) {
          console.error('Error adding NFT attributes:', attrError);
        }
      }

      // Create a mint transaction
      const { error: txError } = await (supabase as any)
        .from('nft_transactions')
        .insert({
          nft_id: data.id,
          nft_name: data.name,
          nft_image: data.image_url,
          from_address: '0x0000000000000000000000000000000000000000', // Minting address
          from_name: 'Mint',
          to_address: profile.id,
          to_name: profile.display_name || profile.username,
          transaction_hash: 'tx_mint_' + Math.random().toString(36).substring(2, 15),
          transaction_type: 'mint',
          network: data.network
        });

      if (txError) {
        console.error('Error creating mint transaction:', txError);
      }

      return data as unknown as NFT;
    } catch (err) {
      console.error('Error creating NFT:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const fetchUserNFTs = async (userId: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with Django API call
      // const data = await nftAPI.getUserNFTs(userId);
      // setNfts(data);
      setNfts([]); // Temporary placeholder
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      setError('Failed to fetch NFTs');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    collections,
    nfts,
    fetchCollections,
    fetchCollectionById,
    fetchNFTs,
    fetchFeaturedNFTs,
    fetchPopularNFTs,
    fetchNFTById,
    fetchTransactions,
    buyNFT,
    likeNFT,
    isNFTLiked,
    createNFT,
    fetchUserNFTs
  };
};
