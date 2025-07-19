import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { toast } from 'sonner';
import { parseEther, formatEther } from 'viem';

// Contract ABIs (simplified for demo)
const BSN_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function mint(address to, uint256 amount)',
  'function startMining()',
  'function claimMiningRewards()',
  'function stakeTokens(uint256 amount)',
  'function unstakeTokens(uint256 amount)',
  'function claimStakingRewards()',
  'function getUserMiningInfo(address user) view returns (uint256, uint256, uint256, uint256, uint256)',
  'function getUserStakingInfo(address user) view returns (uint256, uint256, uint256, uint256)'
];

const BSN_NFT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function mintNFT(uint256 collectionId, string tokenURI) payable',
  'function listNFT(uint256 tokenId, uint256 price)',
  'function delistNFT(uint256 tokenId)',
  'function buyNFT(uint256 tokenId) payable',
  'function getUserNFTs(address user) view returns (uint256[])',
  'function getNFTsForSale() view returns (uint256[])'
];

const BSN_DEFI_ABI = [
  'function deposit(uint256 amount)',
  'function withdraw(uint256 amount)',
  'function borrow(uint256 amount)',
  'function repay(uint256 amount)',
  'function startFarming(uint256 amount)',
  'function stopFarming(uint256 amount)',
  'function claimFarmingRewards()',
  'function liquidate(address user)',
  'function getUserPosition(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
  'function getPoolState() view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256)'
];

// Contract addresses (replace with actual deployed addresses)
const CONTRACT_ADDRESSES = {
  BSN_TOKEN: '0x...', // Replace with actual address
  BSN_NFT: '0x...',   // Replace with actual address
  BSN_DEFI: '0x...'   // Replace with actual address
};

interface BlockchainState {
  isLoading: boolean;
  error: string | null;
  userBalance: string;
  miningInfo: {
    isMining: boolean;
    miningBalance: string;
    dailyMiningAmount: string;
    timeUntilReset: number;
  };
  stakingInfo: {
    stakedAmount: string;
    pendingRewards: string;
    totalRewards: string;
  };
  nftInfo: {
    userNFTs: number[];
    nftsForSale: number[];
  };
  defiInfo: {
    depositedAmount: string;
    borrowedAmount: string;
    farmingAmount: string;
    collateralRatio: number;
  };
}

export const useBlockchain = () => {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<BlockchainState>({
    isLoading: false,
    error: null,
    userBalance: '0',
    miningInfo: {
      isMining: false,
      miningBalance: '0',
      dailyMiningAmount: '0',
      timeUntilReset: 0
    },
    stakingInfo: {
      stakedAmount: '0',
      pendingRewards: '0',
      totalRewards: '0'
    },
    nftInfo: {
      userNFTs: [],
      nftsForSale: []
    },
    defiInfo: {
      depositedAmount: '0',
      borrowedAmount: '0',
      farmingAmount: '0',
      collateralRatio: 0
    }
  });

  // Read user balance
  const { data: balanceData, refetch: refetchBalance } = useContractRead({
    address: CONTRACT_ADDRESSES.BSN_TOKEN as `0x${string}`,
    abi: BSN_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    enabled: isConnected && !!address
  });

  // Read mining info
  const { data: miningData, refetch: refetchMining } = useContractRead({
    address: CONTRACT_ADDRESSES.BSN_TOKEN as `0x${string}`,
    abi: BSN_TOKEN_ABI,
    functionName: 'getUserMiningInfo',
    args: [address as `0x${string}`],
    enabled: isConnected && !!address
  });

  // Read staking info
  const { data: stakingData, refetch: refetchStaking } = useContractRead({
    address: CONTRACT_ADDRESSES.BSN_TOKEN as `0x${string}`,
    abi: BSN_TOKEN_ABI,
    functionName: 'getUserStakingInfo',
    args: [address as `0x${string}`],
    enabled: isConnected && !!address
  });

  // Read DeFi position
  const { data: defiData, refetch: refetchDefi } = useContractRead({
    address: CONTRACT_ADDRESSES.BSN_DEFI as `0x${string}`,
    abi: BSN_DEFI_ABI,
    functionName: 'getUserPosition',
    args: [address as `0x${string}`],
    enabled: isConnected && !!address
  });

  // Read user NFTs
  const { data: userNFTsData, refetch: refetchUserNFTs } = useContractRead({
    address: CONTRACT_ADDRESSES.BSN_NFT as `0x${string}`,
    abi: BSN_NFT_ABI,
    functionName: 'getUserNFTs',
    args: [address as `0x${string}`],
    enabled: isConnected && !!address
  });

  // Read NFTs for sale
  const { data: nftsForSaleData, refetch: refetchNFTsForSale } = useContractRead({
    address: CONTRACT_ADDRESSES.BSN_NFT as `0x${string}`,
    abi: BSN_NFT_ABI,
    functionName: 'getNFTsForSale',
    enabled: isConnected
  });

  // Contract write functions
  const { write: startMining, isLoading: isStartMiningLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_TOKEN as `0x${string}`,
    abi: BSN_TOKEN_ABI,
    functionName: 'startMining'
  });

  const { write: claimMiningRewards, isLoading: isClaimMiningLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_TOKEN as `0x${string}`,
    abi: BSN_TOKEN_ABI,
    functionName: 'claimMiningRewards'
  });

  const { write: stakeTokens, isLoading: isStakingLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_TOKEN as `0x${string}`,
    abi: BSN_TOKEN_ABI,
    functionName: 'stakeTokens'
  });

  const { write: unstakeTokens, isLoading: isUnstakingLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_TOKEN as `0x${string}`,
    abi: BSN_TOKEN_ABI,
    functionName: 'unstakeTokens'
  });

  const { write: claimStakingRewards, isLoading: isClaimStakingLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_TOKEN as `0x${string}`,
    abi: BSN_TOKEN_ABI,
    functionName: 'claimStakingRewards'
  });

  const { write: deposit, isLoading: isDepositing } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_DEFI as `0x${string}`,
    abi: BSN_DEFI_ABI,
    functionName: 'deposit'
  });

  const { write: withdraw, isLoading: isWithdrawing } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_DEFI as `0x${string}`,
    abi: BSN_DEFI_ABI,
    functionName: 'withdraw'
  });

  const { write: borrow, isLoading: isBorrowing } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_DEFI as `0x${string}`,
    abi: BSN_DEFI_ABI,
    functionName: 'borrow'
  });

  const { write: repay, isLoading: isRepaying } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_DEFI as `0x${string}`,
    abi: BSN_DEFI_ABI,
    functionName: 'repay'
  });

  const { write: startFarming, isLoading: isStartFarmingLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_DEFI as `0x${string}`,
    abi: BSN_DEFI_ABI,
    functionName: 'startFarming'
  });

  const { write: stopFarming, isLoading: isStopFarmingLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_DEFI as `0x${string}`,
    abi: BSN_DEFI_ABI,
    functionName: 'stopFarming'
  });

  const { write: claimFarmingRewards, isLoading: isClaimFarmingLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.BSN_DEFI as `0x${string}`,
    abi: BSN_DEFI_ABI,
    functionName: 'claimFarmingRewards'
  });

  // Update state when data changes
  useEffect(() => {
    if (balanceData) {
      setState(prev => ({
        ...prev,
        userBalance: formatEther(balanceData as bigint)
      }));
    }
  }, [balanceData]);

  useEffect(() => {
    if (miningData) {
      const [miningBalance, lastMiningTime, dailyMiningAmount, lastMiningReset, timeUntilReset] = miningData as [bigint, bigint, bigint, bigint, bigint];
      setState(prev => ({
        ...prev,
        miningInfo: {
          isMining: lastMiningTime > 0n,
          miningBalance: formatEther(miningBalance),
          dailyMiningAmount: formatEther(dailyMiningAmount),
          timeUntilReset: Number(timeUntilReset)
        }
      }));
    }
  }, [miningData]);

  useEffect(() => {
    if (stakingData) {
      const [stakedAmount, stakingStartTime, pendingRewards, totalRewards] = stakingData as [bigint, bigint, bigint, bigint];
      setState(prev => ({
        ...prev,
        stakingInfo: {
          stakedAmount: formatEther(stakedAmount),
          pendingRewards: formatEther(pendingRewards),
          totalRewards: formatEther(totalRewards)
        }
      }));
    }
  }, [stakingData]);

  useEffect(() => {
    if (defiData) {
      const [depositedAmount, borrowedAmount, farmingAmount, accumulatedInterest, farmingRewards, collateralRatio] = defiData as [bigint, bigint, bigint, bigint, bigint, bigint];
      setState(prev => ({
        ...prev,
        defiInfo: {
          depositedAmount: formatEther(depositedAmount),
          borrowedAmount: formatEther(borrowedAmount),
          farmingAmount: formatEther(farmingAmount),
          collateralRatio: Number(collateralRatio)
        }
      }));
    }
  }, [defiData]);

  useEffect(() => {
    if (userNFTsData) {
      setState(prev => ({
        ...prev,
        nftInfo: {
          ...prev.nftInfo,
          userNFTs: (userNFTsData as bigint[]).map(nft => Number(nft))
        }
      }));
    }
  }, [userNFTsData]);

  useEffect(() => {
    if (nftsForSaleData) {
      setState(prev => ({
        ...prev,
        nftInfo: {
          ...prev.nftInfo,
          nftsForSale: (nftsForSaleData as bigint[]).map(nft => Number(nft))
        }
      }));
    }
  }, [nftsForSaleData]);

  // Action functions
  const handleStartMining = useCallback(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    startMining?.({
      onSuccess: () => {
        toast.success('Mining started successfully');
        refetchMining();
      },
      onError: (error) => {
        toast.error(`Failed to start mining: ${error.message}`);
      }
    });
  }, [isConnected, startMining, refetchMining]);

  const handleClaimMiningRewards = useCallback(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    claimMiningRewards?.({
      onSuccess: () => {
        toast.success('Mining rewards claimed successfully');
        refetchMining();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to claim mining rewards: ${error.message}`);
      }
    });
  }, [isConnected, claimMiningRewards, refetchMining, refetchBalance]);

  const handleStakeTokens = useCallback((amount: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    stakeTokens?.({
      args: [parseEther(amount)],
      onSuccess: () => {
        toast.success('Tokens staked successfully');
        refetchStaking();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to stake tokens: ${error.message}`);
      }
    });
  }, [isConnected, stakeTokens, refetchStaking, refetchBalance]);

  const handleUnstakeTokens = useCallback((amount: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    unstakeTokens?.({
      args: [parseEther(amount)],
      onSuccess: () => {
        toast.success('Tokens unstaked successfully');
        refetchStaking();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to unstake tokens: ${error.message}`);
      }
    });
  }, [isConnected, unstakeTokens, refetchStaking, refetchBalance]);

  const handleClaimStakingRewards = useCallback(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    claimStakingRewards?.({
      onSuccess: () => {
        toast.success('Staking rewards claimed successfully');
        refetchStaking();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to claim staking rewards: ${error.message}`);
      }
    });
  }, [isConnected, claimStakingRewards, refetchStaking, refetchBalance]);

  const handleDeposit = useCallback((amount: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    deposit?.({
      args: [parseEther(amount)],
      onSuccess: () => {
        toast.success('Tokens deposited successfully');
        refetchDefi();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to deposit tokens: ${error.message}`);
      }
    });
  }, [isConnected, deposit, refetchDefi, refetchBalance]);

  const handleWithdraw = useCallback((amount: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    withdraw?.({
      args: [parseEther(amount)],
      onSuccess: () => {
        toast.success('Tokens withdrawn successfully');
        refetchDefi();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to withdraw tokens: ${error.message}`);
      }
    });
  }, [isConnected, withdraw, refetchDefi, refetchBalance]);

  const handleBorrow = useCallback((amount: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    borrow?.({
      args: [parseEther(amount)],
      onSuccess: () => {
        toast.success('Tokens borrowed successfully');
        refetchDefi();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to borrow tokens: ${error.message}`);
      }
    });
  }, [isConnected, borrow, refetchDefi, refetchBalance]);

  const handleRepay = useCallback((amount: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    repay?.({
      args: [parseEther(amount)],
      onSuccess: () => {
        toast.success('Tokens repaid successfully');
        refetchDefi();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to repay tokens: ${error.message}`);
      }
    });
  }, [isConnected, repay, refetchDefi, refetchBalance]);

  const handleStartFarming = useCallback((amount: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    startFarming?.({
      args: [parseEther(amount)],
      onSuccess: () => {
        toast.success('Farming started successfully');
        refetchDefi();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to start farming: ${error.message}`);
      }
    });
  }, [isConnected, startFarming, refetchDefi, refetchBalance]);

  const handleStopFarming = useCallback((amount: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    stopFarming?.({
      args: [parseEther(amount)],
      onSuccess: () => {
        toast.success('Farming stopped successfully');
        refetchDefi();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to stop farming: ${error.message}`);
      }
    });
  }, [isConnected, stopFarming, refetchDefi, refetchBalance]);

  const handleClaimFarmingRewards = useCallback(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    claimFarmingRewards?.({
      onSuccess: () => {
        toast.success('Farming rewards claimed successfully');
        refetchDefi();
        refetchBalance();
      },
      onError: (error) => {
        toast.error(`Failed to claim farming rewards: ${error.message}`);
      }
    });
  }, [isConnected, claimFarmingRewards, refetchDefi, refetchBalance]);

  const refetchAll = useCallback(() => {
    refetchBalance();
    refetchMining();
    refetchStaking();
    refetchDefi();
    refetchUserNFTs();
    refetchNFTsForSale();
  }, [refetchBalance, refetchMining, refetchStaking, refetchDefi, refetchUserNFTs, refetchNFTsForSale]);

  return {
    ...state,
    isLoading: isStartMiningLoading || isClaimMiningLoading || isStakingLoading || 
               isUnstakingLoading || isClaimStakingLoading || isDepositing || 
               isWithdrawing || isBorrowing || isRepaying || isStartFarmingLoading || 
               isStopFarmingLoading || isClaimFarmingLoading,
    isConnected,
    address,
    // Actions
    handleStartMining,
    handleClaimMiningRewards,
    handleStakeTokens,
    handleUnstakeTokens,
    handleClaimStakingRewards,
    handleDeposit,
    handleWithdraw,
    handleBorrow,
    handleRepay,
    handleStartFarming,
    handleStopFarming,
    handleClaimFarmingRewards,
    refetchAll
  };
}; 