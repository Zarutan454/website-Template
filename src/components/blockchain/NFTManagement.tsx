import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext.utils';
import { djangoApi } from '@/lib/django-api-new';

interface NFT {
  id: number;
  token_id: string;
  name: string;
  description: string;
  owner: any;
  creator: any;
  nft_type: string;
  media_url: string;
  metadata: any;
  rarity: string;
  is_locked: boolean;
  transaction_hash: string;
  created_at: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: any;
  rarity: string;
  level: number;
  experience: number;
  is_staked: boolean;
}

export default function NFTManagement() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintForm, setMintForm] = useState({
    name: '',
    description: '',
    media_url: '',
    nft_type: 'image',
    rarity: 'common',
    attributes: {}
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    try {
      setLoading(true);
      const response = await djangoApi.get('/nfts/');
      setNfts(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load NFTs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFT = async () => {
    if (!mintForm.name || !mintForm.media_url) {
      toast({
        title: 'Invalid Input',
        description: 'Please provide name and media URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      setMinting(true);
      await djangoApi.post('/nfts/mint/', {
        name: mintForm.name,
        description: mintForm.description,
        media_url: mintForm.media_url,
        nft_type: mintForm.nft_type,
        rarity: mintForm.rarity,
        attributes: mintForm.attributes
      });
      
      toast({
        title: 'Success',
        description: 'NFT minted successfully',
      });
      
      setMintForm({
        name: '',
        description: '',
        media_url: '',
        nft_type: 'image',
        rarity: 'common',
        attributes: {}
      });
      
      loadNFTs();
      
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast({
        title: 'Error',
        description: 'Failed to mint NFT',
        variant: 'destructive',
      });
    } finally {
      setMinting(false);
    }
  };

  const handleStakeNFT = async (nftId: string) => {
    try {
      setLoading(true);
      await djangoApi.post(`/nfts/${nftId}/stake/`);
      
      toast({
        title: 'Success',
        description: 'NFT staked successfully',
      });
      
      loadNFTs();
      
    } catch (error) {
      console.error('Error staking NFT:', error);
      toast({
        title: 'Error',
        description: 'Failed to stake NFT',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnstakeNFT = async (nftId: string) => {
    try {
      setLoading(true);
      await djangoApi.post(`/nfts/${nftId}/unstake/`);
      
      toast({
        title: 'Success',
        description: 'NFT unstaked successfully',
      });
      
      loadNFTs();
      
    } catch (error) {
      console.error('Error unstaking NFT:', error);
      toast({
        title: 'Error',
        description: 'Failed to unstake NFT',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      case 'mythic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNFTTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '🎨';
    }
  };

  if (loading && nfts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mint NFT Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            Mint New NFT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nft-name">NFT Name</Label>
              <Input
                id="nft-name"
                value={mintForm.name}
                onChange={(e) => setMintForm({...mintForm, name: e.target.value})}
                placeholder="Enter NFT name"
              />
            </div>
            <div>
              <Label htmlFor="nft-type">NFT Type</Label>
              <Select
                value={mintForm.nft_type}
                onValueChange={(value) => setMintForm({...mintForm, nft_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nft-rarity">Rarity</Label>
              <Select
                value={mintForm.rarity}
                onValueChange={(value) => setMintForm({...mintForm, rarity: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                  <SelectItem value="mythic">Mythic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nft-media">Media URL</Label>
              <Input
                id="nft-media"
                value={mintForm.media_url}
                onChange={(e) => setMintForm({...mintForm, media_url: e.target.value})}
                placeholder="Enter media URL"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="nft-description">Description</Label>
              <Textarea
                id="nft-description"
                value={mintForm.description}
                onChange={(e) => setMintForm({...mintForm, description: e.target.value})}
                placeholder="Enter NFT description"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={handleMintNFT}
                disabled={minting || !mintForm.name || !mintForm.media_url}
                className="w-full"
              >
                {minting ? 'Minting...' : 'Mint NFT'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🖼️</span>
            My NFT Collection ({nfts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nfts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No NFTs found. Mint your first NFT!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nfts.map((nft) => (
                <Card key={nft.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={nft.media_url}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getRarityColor(nft.rarity)}>
                        {nft.rarity}
                      </Badge>
                    </div>
                    {nft.is_locked && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">🔒 Staked</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span>{getNFTTypeIcon(nft.nft_type)}</span>
                        <h3 className="font-semibold">{nft.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {nft.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          ID: {nft.token_id.slice(0, 8)}...
                        </div>
                        <div className="flex gap-2">
                          {!nft.is_locked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStakeNFT(nft.token_id)}
                              disabled={loading}
                            >
                              Stake
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnstakeNFT(nft.token_id)}
                              disabled={loading}
                            >
                              Unstake
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
