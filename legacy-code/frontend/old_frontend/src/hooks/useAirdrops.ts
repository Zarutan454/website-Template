import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Airdrop {
  id: string;
  title: string;
  token: string;
  amount: string;
  participants: number;
  endDate: string;
  requirements: string[];
  status: 'active' | 'upcoming' | 'ended';
}

export const useAirdrops = (searchQuery: string = '', filters: Record<string, boolean> = {}) => {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAirdrops = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('airdrops')
        .select('*');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,token.ilike.%${searchQuery}%`);
      }

      if (filters.active === true && filters.upcoming !== true && filters.ended !== true) {
        query = query.eq('status', 'active');
      } else if (filters.active !== true && filters.upcoming === true && filters.ended !== true) {
        query = query.eq('status', 'upcoming');
      } else if (filters.active !== true && filters.upcoming !== true && filters.ended === true) {
        query = query.eq('status', 'ended');
      } else if (filters.active === true && filters.upcoming === true && filters.ended !== true) {
        query = query.in('status', ['active', 'upcoming']);
      } else if (filters.active === true && filters.upcoming !== true && filters.ended === true) {
        query = query.in('status', ['active', 'ended']);
      } else if (filters.active !== true && filters.upcoming === true && filters.ended === true) {
        query = query.in('status', ['upcoming', 'ended']);
      }

      if (filters.bsn === true || filters.eth === true || filters.other === true) {
        const tokenFilters = [];
        if (filters.bsn === true) tokenFilters.push('BSN');
        if (filters.eth === true) tokenFilters.push('ETH');
        
        if (filters.other === true && tokenFilters.length > 0) {
          query = query.or(`token.in.(${tokenFilters.join(',')}),token.not.in.(BSN,ETH)`);
        } else if (filters.other === true) {
          query = query.not('token', 'in', '(BSN,ETH)');
        } else if (tokenFilters.length > 0) {
          query = query.in('token', tokenFilters);
        }
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setAirdrops([]);
        setIsLoading(false);
        return;
      }

      const formattedAirdrops: Airdrop[] = data.map(airdrop => ({
        id: airdrop.id,
        title: airdrop.title,
        token: airdrop.token,
        amount: airdrop.amount,
        participants: airdrop.participants || 0,
        endDate: airdrop.end_date,
        requirements: airdrop.requirements || [],
        status: airdrop.status || 'active'
      }));

      setAirdrops(formattedAirdrops);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load airdrops';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createAirdrop = async (airdropData: Omit<Airdrop, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('airdrops')
        .insert({
          title: airdropData.title,
          token: airdropData.token,
          amount: airdropData.amount,
          participants: airdropData.participants || 0,
          end_date: airdropData.endDate,
          requirements: airdropData.requirements || [],
          status: airdropData.status || 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setAirdrops(prev => [
        {
          id: data.id,
          title: data.title,
          token: data.token,
          amount: data.amount,
          participants: data.participants || 0,
          endDate: data.end_date,
          requirements: data.requirements || [],
          status: data.status || 'active'
        },
        ...prev
      ]);

      return data.id;
    } catch (err: any) {
      console.error('Error creating airdrop:', err);
      return null;
    }
  };

  const participateInAirdrop = async (airdropId: string, userId: string) => {
    try {
      const { data: existingParticipation, error: checkError } = await supabase
        .from('airdrop_participants')
        .select('id')
        .eq('airdrop_id', airdropId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingParticipation) {
        return { success: false, message: 'You have already participated in this airdrop' };
      }

      const { error: participateError } = await supabase
        .from('airdrop_participants')
        .insert({
          airdrop_id: airdropId,
          user_id: userId,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (participateError) throw participateError;

      const { error: updateError } = await supabase.rpc('increment_airdrop_participants', {
        airdrop_id: airdropId
      });

      if (updateError) throw updateError;

      fetchAirdrops();

      return { success: true, message: 'Successfully joined the airdrop' };
    } catch (err: any) {
      console.error('Error participating in airdrop:', err);
      return { success: false, message: err.message || 'Failed to join the airdrop' };
    }
  };

  useEffect(() => {
    fetchAirdrops();
  }, [searchQuery, JSON.stringify(filters)]);

  return {
    airdrops,
    isLoading,
    error,
    createAirdrop,
    participateInAirdrop,
    refreshAirdrops: fetchAirdrops
  };
};
