
import React from 'react';

interface NetworkIconProps {
  network: string;
  size?: number;
  className?: string;
}

const NetworkIcon: React.FC<NetworkIconProps> = ({ 
  network, 
  size = 24,
  className = ""
}) => {
  // Map network IDs to their icon paths
  const getNetworkIconPath = (networkId: string): string => {
    const networkMap: Record<string, string> = {
      'ethereum': '/images/networks/ethereum.svg',
      'sepolia': '/images/networks/ethereum.svg',
      'holesky': '/images/networks/ethereum.svg',
      'goerli': '/images/networks/ethereum.svg',
      'mainnet': '/images/networks/ethereum.svg',
      'polygon': '/images/networks/polygon.svg',
      'mumbai': '/images/networks/polygon.svg',
      'matic': '/images/networks/polygon.svg',
      'bsc': '/images/networks/bnb.svg',
      'binance': '/images/networks/bnb.svg',
      'arbitrum': '/images/networks/arbitrum.svg',
      'optimism': '/images/networks/optimism.svg',
      'avalanche': '/images/networks/avalanche.svg',
      'zksync': '/images/networks/zksync.svg',
      'base': '/images/networks/base.svg',
    };
    
    return networkMap[networkId.toLowerCase()] || '/images/networks/default-chain.svg';
  };
  
  // Use regular img tag for simplicity since it's just referencing static assets
  return (
    <img 
      src={getNetworkIconPath(network)} 
      alt={`${network} icon`}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default NetworkIcon;
