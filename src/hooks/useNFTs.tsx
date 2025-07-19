import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { apiClient } from '../lib/django-api-new';

export interface NFT {
  id: string;
  name: string;
  description: string;
  image_url: string;
  token_id: string;
  owner_id: string;
  owner_name: string;
  creator_id: string;
  creator_name: string;
  price?: number;
  currency?: string;
  listed: boolean;
  view_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  rarity?: string;
  collection?: string;
  network?: string;
  contract_address?: string;
  last_sale_price?: number;
  last_sale_currency?: string;
}

export interface NFTTransaction {
  id: string;
  nft_id: string;
  from_address: string;
  from_name: string;
  to_address: string;
  to_name: string;
  transaction_hash: string;
  transaction_type: 'mint' | 'sale' | 'transfer' | 'list' | 'unlist';
  price?: number;
  currency?: string;
  network: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export const useNFTs = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch all NFTs
  const fetchNFTs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/nfts/') as { data: NFT[] };
      const typedNFTs = response.data;
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

  // Initialize NFTs on mount
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const fetchFeaturedNFTs = useCallback(async (limit = 8) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/nfts/?featured=true&limit=${limit}`) as { data: NFT[] };
      return response.data;
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
      const response = await apiClient.get(`/nfts/?popular=true&limit=${limit}`) as { data: NFT[] };
      return response.data;
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
      const response = await apiClient.get(`/nfts/${id}/`) as { data: NFT };
      
      // Increment view count if user is logged in
      if (user) {
        try {
          await apiClient.post(`/nfts/${id}/view/`);
        } catch (viewError) {
          console.warn('Failed to increment view count:', viewError);
        }
      }

      return response.data;
    } catch (err) {
      console.error('Error fetching NFT by ID:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchTransactions = useCallback(async (nftId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/nfts/${nftId}/transactions/`) as { data: NFTTransaction[] };
      return response.data;
    } catch (err) {
      console.error('Error fetching NFT transactions:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buyNFT = useCallback(async (nftId: string) => {
    if (!user) {
      toast.error('Du musst angemeldet sein, um ein NFT zu kaufen');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get NFT details first
      const nft = await fetchNFTById(nftId);

      if (!nft.listed) {
        toast.error('Dieses NFT steht nicht zum Verkauf');
        return false;
      }

      if (nft.owner_id === String(user.id)) {
        toast.error('Du besitzt dieses NFT bereits');
        return false;
      }

      // Create purchase transaction
      const response = await apiClient.post(`/nfts/${nftId}/buy/`, {
        buyer_id: user.id,
        price: nft.price,
        currency: nft.currency
      }) as { data: { success: boolean; error?: string } };

      if (response.data.success) {
        toast.success('NFT erfolgreich gekauft!');
        // Refresh NFTs list
        await fetchNFTs();
        return true;
      } else {
        toast.error(response.data.error || 'Fehler beim Kauf des NFTs');
        return false;
      }
    } catch (err) {
      console.error('Error buying NFT:', err);
      setError(err as Error);
      toast.error('Fehler beim Kauf des NFTs');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchNFTById, fetchNFTs]);

  const listNFT = useCallback(async (nftId: string, price: number, currency: string = 'ETH') => {
    if (!user) {
      toast.error('Du musst angemeldet sein, um ein NFT zu listen');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/nfts/${nftId}/list/`, {
        price,
        currency
      }) as { data: { success: boolean; error?: string } };

      if (response.data.success) {
        toast.success('NFT erfolgreich zum Verkauf angeboten!');
        await fetchNFTs();
        return true;
      } else {
        toast.error(response.data.error || 'Fehler beim Listen des NFTs');
        return false;
      }
    } catch (err) {
      console.error('Error listing NFT:', err);
      setError(err as Error);
      toast.error('Fehler beim Listen des NFTs');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchNFTs]);

  const unlistNFT = useCallback(async (nftId: string) => {
    if (!user) {
      toast.error('Du musst angemeldet sein, um ein NFT zu unlisten');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/nfts/${nftId}/unlist/`) as { data: { success: boolean; error?: string } };

      if (response.data.success) {
        toast.success('NFT erfolgreich vom Verkauf entfernt!');
        await fetchNFTs();
        return true;
      } else {
        toast.error(response.data.error || 'Fehler beim Unlisten des NFTs');
        return false;
      }
    } catch (err) {
      console.error('Error unlisting NFT:', err);
      setError(err as Error);
      toast.error('Fehler beim Unlisten des NFTs');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchNFTs]);

  const favoriteNFT = useCallback(async (nftId: string) => {
    if (!user) {
      toast.error('Du musst angemeldet sein, um ein NFT zu favorisieren');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/nfts/${nftId}/favorite/`) as { data: { success: boolean; error?: string } };

      if (response.data.success) {
        toast.success('NFT erfolgreich favorisiert!');
        await fetchNFTs();
        return true;
      } else {
        toast.error(response.data.error || 'Fehler beim Favorisieren des NFTs');
        return false;
      }
    } catch (err) {
      console.error('Error favoriting NFT:', err);
      setError(err as Error);
      toast.error('Fehler beim Favorisieren des NFTs');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchNFTs]);

  const unfavoriteNFT = useCallback(async (nftId: string) => {
    if (!user) {
      toast.error('Du musst angemeldet sein, um ein NFT zu unfavorisieren');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/nfts/${nftId}/unfavorite/`) as { data: { success: boolean; error?: string } };

      if (response.data.success) {
        toast.success('NFT erfolgreich unfavorisiert!');
        await fetchNFTs();
        return true;
      } else {
        toast.error(response.data.error || 'Fehler beim Unfavorisieren des NFTs');
        return false;
      }
    } catch (err) {
      console.error('Error unfavoriting NFT:', err);
      setError(err as Error);
      toast.error('Fehler beim Unfavorisieren des NFTs');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchNFTs]);

  const createNFT = useCallback(async (nftData: {
    name: string;
    description: string;
    image_url: string;
    price?: number;
    currency?: string;
    metadata?: Record<string, unknown>;
  }) => {
    if (!user) {
      toast.error('Du musst angemeldet sein, um ein NFT zu erstellen');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/nfts/create/', {
        ...nftData,
        creator_id: user.id
      }) as { data: { success: boolean; error?: string; nft_id?: string } };

      if (response.data.success) {
        toast.success('NFT erfolgreich erstellt!');
        await fetchNFTs();
        return response.data.nft_id;
      } else {
        toast.error(response.data.error || 'Fehler beim Erstellen des NFTs');
        return null;
      }
    } catch (err) {
      console.error('Error creating NFT:', err);
      setError(err as Error);
      toast.error('Fehler beim Erstellen des NFTs');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchNFTs]);

  const fetchUserNFTs = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/nfts/?owner_id=${userId}`) as { data: NFT[] };
      return response.data;
    } catch (err) {
      console.error('Error fetching user NFTs:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const searchNFTs = useCallback(async (query: string, filters?: {
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    rarity?: string;
    collection?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (filters?.minPrice) params.append('min_price', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('max_price', filters.maxPrice.toString());
      if (filters?.currency) params.append('currency', filters.currency);
      if (filters?.rarity) params.append('rarity', filters.rarity);
      if (filters?.collection) params.append('collection', filters.collection);

      const response = await apiClient.get(`/nfts/search/?${params.toString()}`) as { data: NFT[] };
      return response.data;
    } catch (err) {
      console.error('Error searching NFTs:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    nfts,
    isLoading,
    error,
    fetchNFTs,
    fetchFeaturedNFTs,
    fetchPopularNFTs,
    fetchNFTById,
    fetchTransactions,
    buyNFT,
    listNFT,
    unlistNFT,
    favoriteNFT,
    unfavoriteNFT,
    createNFT,
    fetchUserNFTs,
    searchNFTs,
  };
};

