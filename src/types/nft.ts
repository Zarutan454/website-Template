
import { NFTAttribute } from './token'; // Import from token.ts to ensure consistency

export interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  bannerUrl?: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  totalSupply?: number;
  floorPrice?: number;
  network: string;
  contractAddress?: string;
  verified: boolean;
  featured: boolean;
  createdAt: Date;
  royaltyFee?: number; // Percentage of sales that goes to the creator
  categories?: string[]; // Categories the collection belongs to
  volume?: number; // Total trading volume of the collection
  socialLinks?: {
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    instagram?: string;
  };
}

export interface NFT {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  animationUrl?: string;
  collectionId: string;
  collectionName?: string;
  creatorId: string;
  creatorName?: string;
  ownerId: string;
  ownerName?: string;
  tokenId: string;
  network: string;
  contractAddress?: string;
  attributes?: NFTAttribute[];
  price?: number;
  currency?: string;
  listed: boolean;
  createdAt: Date;
  lastSalePrice?: number;
  lastSaleCurrency?: string;
  rarity?: number; // Rarity score from 0-100
  rarityRank?: number; // Rank in the collection
  favoriteCount?: number; // Number of users who favorited this NFT
  viewCount?: number; // Number of times this NFT was viewed
}

// Use the NFTAttribute from token.ts, removing this to avoid duplication
// export interface NFTAttribute {
//   trait_type: string;
//   value: string | number;
//   display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
//   rarity?: number; // Percentage of NFTs in the collection with this trait
// }

export interface NFTTransaction {
  id: string;
  nftId: string;
  nftName?: string;
  nftImage?: string;
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  toName?: string;
  transactionHash: string;
  transactionType: 'mint' | 'transfer' | 'sale' | 'auction' | 'offer';
  price?: number;
  currency?: string;
  network: string;
  createdAt: Date;
  status?: 'pending' | 'completed' | 'failed';
  blockNumber?: number;
  gasUsed?: number;
  gasFee?: number;
}

export interface NFTOffer {
  id: string;
  nftId: string;
  buyerId: string;
  buyerName?: string;
  price: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface NFTCategory {
  id: string;
  name: string;
  icon?: string;
  featured: boolean;
  itemCount?: number;
}

export interface NFTFilter {
  collections?: string[];
  priceRange?: { min?: number; max?: number };
  attributes?: { [key: string]: string[] };
  listed?: boolean;
  network?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'recent' | 'oldest' | 'viewed' | 'favorited';
}
