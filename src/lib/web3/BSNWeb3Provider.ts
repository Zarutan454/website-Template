import { ethers } from 'ethers';
import { toast } from 'sonner';

// Contract ABIs
import BSNTokenABI from '@/contracts/abi/BSNToken.json';
import BSNNFTABI from '@/contracts/abi/BSNNFT.json';

// Network Configuration
export const NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    explorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  localhost: {
    chainId: 1337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    explorer: 'http://localhost:8545',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Contract Addresses (Update with deployed addresses)
export const CONTRACT_ADDRESSES = {
  BSNToken: {
    1: '0x...', // Ethereum Mainnet
    11155111: '0x...', // Sepolia Testnet
    1337: '0x...' // Localhost
  },
  BSNNFT: {
    1: '0x...', // Ethereum Mainnet
    11155111: '0x...', // Sepolia Testnet
    1337: '0x...' // Localhost
  }
};

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contracts: {
    BSNToken: ethers.Contract | null;
    BSNNFT: ethers.Contract | null;
  };
}

export interface MiningSession {
  sessionId: number;
  startTime: number;
  endTime: number;
  tokensEarned: string;
  isActive: boolean;
}

export interface StakingPosition {
  stakedBalance: string;
  pendingRewards: string;
  lastRewardTime: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: string;
  rarity: number;
  level: number;
  experience: number;
  isStaked: boolean;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  image: string;
  creator: string;
  totalNFTs: number;
  floorPrice: string;
  totalVolume: string;
  isActive: boolean;
}

class BSNWeb3Provider {
  private state: WalletState = {
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    provider: null,
    signer: null,
    contracts: {
      BSNToken: null,
      BSNNFT: null
    }
  };

  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    this.initializeProvider();
  }

  /**
   * Initialize Web3 provider
   */
  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        this.state.provider = provider;
        this.state.signer = signer;
        
        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await this.connectWallet();
        }
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            this.disconnectWallet();
          } else {
            this.updateAddress(accounts[0]);
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId: string) => {
          this.updateChainId(parseInt(chainId, 16));
        });

      } catch (error) {
        console.error('Failed to initialize Web3 provider:', error);
      }
    }
  }

  /**
   * Connect wallet
   */
  async connectWallet(): Promise<boolean> {
    if (!this.state.provider) {
      toast.error('No Web3 provider found. Please install MetaMask.');
      return false;
    }

    try {
      this.state.isConnecting = true;
      this.notifyListeners();

      // Request account access
      const accounts = await this.state.provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      
      // Get network
      const network = await this.state.provider.getNetwork();
      const chainId = network.chainId;

      // Update state
      this.state.address = address;
      this.state.chainId = chainId;
      this.state.isConnected = true;
      this.state.isConnecting = false;

      // Initialize contracts
      await this.initializeContracts();

      this.notifyListeners();
      toast.success('Wallet connected successfully!');
      return true;

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.state.isConnecting = false;
      this.notifyListeners();
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet() {
    this.state.address = null;
    this.state.chainId = null;
    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.state.contracts.BSNToken = null;
    this.state.contracts.BSNNFT = null;
    
    this.notifyListeners();
    toast.info('Wallet disconnected');
  }

  /**
   * Switch network
   */
  async switchNetwork(chainId: number): Promise<boolean> {
    if (!this.state.provider) return false;

    try {
      await this.state.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${chainId.toString(16)}` }
      ]);
      
      this.updateChainId(chainId);
      await this.initializeContracts();
      
      toast.success(`Switched to ${NETWORKS[chainId as keyof typeof NETWORKS]?.name || 'Unknown Network'}`);
      return true;

    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, try to add it
        return await this.addNetwork(chainId);
      }
      
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network');
      return false;
    }
  }

  /**
   * Add network to wallet
   */
  async addNetwork(chainId: number): Promise<boolean> {
    if (!this.state.provider) return false;

    const network = NETWORKS[chainId as keyof typeof NETWORKS];
    if (!network) {
      toast.error('Unsupported network');
      return false;
    }

    try {
      await this.state.provider.send('wallet_addEthereumChain', [{
        chainId: `0x${chainId.toString(16)}`,
        chainName: network.name,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.explorer]
      }]);
      
      return true;

    } catch (error) {
      console.error('Failed to add network:', error);
      toast.error('Failed to add network');
      return false;
    }
  }

  /**
   * Initialize smart contracts
   */
  private async initializeContracts() {
    if (!this.state.signer || !this.state.chainId) return;

    const tokenAddress = CONTRACT_ADDRESSES.BSNToken[this.state.chainId as keyof typeof CONTRACT_ADDRESSES.BSNToken];
    const nftAddress = CONTRACT_ADDRESSES.BSNNFT[this.state.chainId as keyof typeof CONTRACT_ADDRESSES.BSNNFT];

    if (tokenAddress) {
      this.state.contracts.BSNToken = new ethers.Contract(
        tokenAddress,
        BSNTokenABI,
        this.state.signer
      );
    }

    if (nftAddress) {
      this.state.contracts.BSNNFT = new ethers.Contract(
        nftAddress,
        BSNNFTABI,
        this.state.signer
      );
    }
  }

  /**
   * Update address
   */
  private updateAddress(address: string) {
    this.state.address = address;
    this.notifyListeners();
  }

  /**
   * Update chain ID
   */
  private updateChainId(chainId: number) {
    this.state.chainId = chainId;
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // ===== TOKEN CONTRACT INTERACTIONS =====

  /**
   * Get token balance
   */
  async getTokenBalance(): Promise<string> {
    if (!this.state.contracts.BSNToken || !this.state.address) return '0';

    try {
      const balance = await this.state.contracts.BSNToken.balanceOf(this.state.address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  }

  /**
   * Start mining session
   */
  async startMining(duration: number): Promise<boolean> {
    if (!this.state.contracts.BSNToken) {
      toast.error('Token contract not available');
      return false;
    }

    try {
      const tx = await this.state.contracts.BSNToken.startMining(duration);
      await tx.wait();
      
      toast.success('Mining session started!');
      return true;

    } catch (error) {
      console.error('Failed to start mining:', error);
      toast.error('Failed to start mining session');
      return false;
    }
  }

  /**
   * Stop mining session
   */
  async stopMining(): Promise<boolean> {
    if (!this.state.contracts.BSNToken) {
      toast.error('Token contract not available');
      return false;
    }

    try {
      const tx = await this.state.contracts.BSNToken.stopMining();
      const receipt = await tx.wait();
      
      // Find TokensMined event
      const event = receipt.events?.find(e => e.event === 'TokensMined');
      if (event && event.args) {
        const amount = ethers.utils.formatEther(event.args[1]);
        toast.success(`Mining stopped! Earned ${amount} BSN tokens`);
      } else {
        toast.success('Mining session stopped');
      }
      
      return true;

    } catch (error) {
      console.error('Failed to stop mining:', error);
      toast.error('Failed to stop mining session');
      return false;
    }
  }

  /**
   * Stake tokens
   */
  async stakeTokens(amount: string): Promise<boolean> {
    if (!this.state.contracts.BSNToken) {
      toast.error('Token contract not available');
      return false;
    }

    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await this.state.contracts.BSNToken.stake(amountWei);
      await tx.wait();
      
      toast.success(`Staked ${amount} BSN tokens`);
      return true;

    } catch (error) {
      console.error('Failed to stake tokens:', error);
      toast.error('Failed to stake tokens');
      return false;
    }
  }

  /**
   * Unstake tokens
   */
  async unstakeTokens(amount: string): Promise<boolean> {
    if (!this.state.contracts.BSNToken) {
      toast.error('Token contract not available');
      return false;
    }

    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await this.state.contracts.BSNToken.unstake(amountWei);
      await tx.wait();
      
      toast.success(`Unstaked ${amount} BSN tokens`);
      return true;

    } catch (error) {
      console.error('Failed to unstake tokens:', error);
      toast.error('Failed to unstake tokens');
      return false;
    }
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(): Promise<boolean> {
    if (!this.state.contracts.BSNToken) {
      toast.error('Token contract not available');
      return false;
    }

    try {
      const tx = await this.state.contracts.BSNToken.claimRewards();
      const receipt = await tx.wait();
      
      // Find RewardsClaimed event
      const event = receipt.events?.find(e => e.event === 'RewardsClaimed');
      if (event && event.args) {
        const amount = ethers.utils.formatEther(event.args[1]);
        toast.success(`Claimed ${amount} BSN rewards!`);
      } else {
        toast.success('Rewards claimed successfully');
      }
      
      return true;

    } catch (error) {
      console.error('Failed to claim rewards:', error);
      toast.error('Failed to claim rewards');
      return false;
    }
  }

  /**
   * Get user mining info
   */
  async getUserMiningInfo(): Promise<{
    sessionId: number;
    lastMiningTime: number;
    dailyMined: string;
    dailyReset: number;
  } | null> {
    if (!this.state.contracts.BSNToken || !this.state.address) return null;

    try {
      const info = await this.state.contracts.BSNToken.getUserMiningInfo(this.state.address);
      return {
        sessionId: info.sessionId.toNumber(),
        lastMiningTime: info.lastMiningTime.toNumber(),
        dailyMined: ethers.utils.formatEther(info.dailyMined),
        dailyReset: info.dailyReset.toNumber()
      };
    } catch (error) {
      console.error('Failed to get mining info:', error);
      return null;
    }
  }

  /**
   * Get user staking info
   */
  async getUserStakingInfo(): Promise<{
    stakedBalance: string;
    pendingRewards: string;
    lastRewardTime: number;
  } | null> {
    if (!this.state.contracts.BSNToken || !this.state.address) return null;

    try {
      const info = await this.state.contracts.BSNToken.getUserStakingInfo(this.state.address);
      return {
        stakedBalance: ethers.utils.formatEther(info.stakedBalance),
        pendingRewards: ethers.utils.formatEther(info.pendingRewards),
        lastRewardTime: info.lastRewardTime.toNumber()
      };
    } catch (error) {
      console.error('Failed to get staking info:', error);
      return null;
    }
  }

  // ===== NFT CONTRACT INTERACTIONS =====

  /**
   * Mint NFT
   */
  async mintNFT(
    name: string,
    description: string,
    image: string,
    attributes: string,
    rarity: number
  ): Promise<boolean> {
    if (!this.state.contracts.BSNNFT) {
      toast.error('NFT contract not available');
      return false;
    }

    try {
      const mintPrice = await this.state.contracts.BSNNFT.MINT_PRICE();
      const tokenURI = `https://api.bsn.com/nft/${Date.now()}`;
      
      const tx = await this.state.contracts.BSNNFT.mintNFT(
        this.state.address,
        tokenURI,
        name,
        description,
        image,
        attributes,
        rarity,
        { value: mintPrice }
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'NFTMinted');
      
      if (event && event.args) {
        const tokenId = event.args[1].toNumber();
        toast.success(`NFT minted successfully! Token ID: ${tokenId}`);
      } else {
        toast.success('NFT minted successfully!');
      }
      
      return true;

    } catch (error) {
      console.error('Failed to mint NFT:', error);
      toast.error('Failed to mint NFT');
      return false;
    }
  }

  /**
   * Get user NFTs
   */
  async getUserNFTs(): Promise<NFTMetadata[]> {
    if (!this.state.contracts.BSNNFT || !this.state.address) return [];

    try {
      const tokenIds = await this.state.contracts.BSNNFT.getUserNFTs(this.state.address);
      const nfts: NFTMetadata[] = [];

      for (const tokenId of tokenIds) {
        const metadata = await this.state.contracts.BSNNFT.getNFTMetadata(tokenId);
        nfts.push({
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          attributes: metadata.attributes,
          rarity: metadata.rarity.toNumber(),
          level: metadata.level.toNumber(),
          experience: metadata.experience.toNumber(),
          isStaked: metadata.isStaked
        });
      }

      return nfts;

    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      return [];
    }
  }

  /**
   * Put NFT for sale
   */
  async putNFTForSale(tokenId: number, price: string): Promise<boolean> {
    if (!this.state.contracts.BSNNFT) {
      toast.error('NFT contract not available');
      return false;
    }

    try {
      const priceWei = ethers.utils.parseEther(price);
      const tx = await this.state.contracts.BSNNFT.putForSale(tokenId, priceWei);
      await tx.wait();
      
      toast.success('NFT listed for sale!');
      return true;

    } catch (error) {
      console.error('Failed to put NFT for sale:', error);
      toast.error('Failed to list NFT for sale');
      return false;
    }
  }

  /**
   * Buy NFT
   */
  async buyNFT(tokenId: number, price: string): Promise<boolean> {
    if (!this.state.contracts.BSNNFT) {
      toast.error('NFT contract not available');
      return false;
    }

    try {
      const priceWei = ethers.utils.parseEther(price);
      const tx = await this.state.contracts.BSNNFT.buyNFT(tokenId, { value: priceWei });
      await tx.wait();
      
      toast.success('NFT purchased successfully!');
      return true;

    } catch (error) {
      console.error('Failed to buy NFT:', error);
      toast.error('Failed to purchase NFT');
      return false;
    }
  }

  /**
   * Stake NFT
   */
  async stakeNFT(tokenId: number): Promise<boolean> {
    if (!this.state.contracts.BSNNFT) {
      toast.error('NFT contract not available');
      return false;
    }

    try {
      const tx = await this.state.contracts.BSNNFT.stakeNFT(tokenId);
      await tx.wait();
      
      toast.success('NFT staked successfully!');
      return true;

    } catch (error) {
      console.error('Failed to stake NFT:', error);
      toast.error('Failed to stake NFT');
      return false;
    }
  }

  /**
   * Unstake NFT
   */
  async unstakeNFT(tokenId: number): Promise<boolean> {
    if (!this.state.contracts.BSNNFT) {
      toast.error('NFT contract not available');
      return false;
    }

    try {
      const tx = await this.state.contracts.BSNNFT.unstakeNFT(tokenId);
      await tx.wait();
      
      toast.success('NFT unstaked successfully!');
      return true;

    } catch (error) {
      console.error('Failed to unstake NFT:', error);
      toast.error('Failed to unstake NFT');
      return false;
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Format ETH balance
   */
  formatETH(balance: string): string {
    return parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
  }

  /**
   * Format token balance
   */
  formatTokens(balance: string): string {
    return parseFloat(balance).toFixed(2);
  }

  /**
   * Get network name
   */
  getNetworkName(chainId: number): string {
    return NETWORKS[chainId as keyof typeof NETWORKS]?.name || 'Unknown Network';
  }

  /**
   * Check if network is supported
   */
  isNetworkSupported(chainId: number): boolean {
    return chainId in NETWORKS;
  }
}

// Create singleton instance
export const bsnWeb3 = new BSNWeb3Provider();

// Export types
export type { WalletState, MiningSession, StakingPosition, NFTMetadata, Collection }; 