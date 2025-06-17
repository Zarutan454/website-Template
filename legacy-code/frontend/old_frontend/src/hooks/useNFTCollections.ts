
import { useState, useCallback } from 'react';
import { NFTCollection } from '@/types/nft';
import { nftCollectionRepository } from '@/repositories/NFTCollectionRepository';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export const useNFTCollections = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const { profile } = useProfile();

  const fetchUserCollections = useCallback(async () => {
    if (!profile) return [];
    
    setIsLoading(true);
    setError(null);

    try {
      const userCollections = await nftCollectionRepository.getCollectionsByCreator(profile.id);
      setCollections(userCollections);
      return userCollections;
    } catch (err) {
      console.error('Error fetching user collections:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const createCollection = useCallback(async (collectionData: Partial<NFTCollection>) => {
    if (!profile) {
      toast.error('Du musst angemeldet sein, um eine Sammlung zu erstellen');
      throw new Error('Authentication required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const newCollectionData = {
        ...collectionData,
        creatorId: profile.id,
        creatorName: profile.display_name || profile.username
      };

      const newCollection = await nftCollectionRepository.createCollection(newCollectionData);
      
      if (!newCollection) {
        throw new Error('Failed to create collection');
      }

      // Update local state to include the new collection
      setCollections(prev => [newCollection, ...prev]);
      
      toast.success('Sammlung erfolgreich erstellt!');
      return newCollection;
    } catch (err) {
      console.error('Error creating collection:', err);
      setError(err as Error);
      toast.error('Fehler beim Erstellen der Sammlung');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  return {
    collections,
    isLoading,
    error,
    fetchUserCollections,
    createCollection
  };
};
