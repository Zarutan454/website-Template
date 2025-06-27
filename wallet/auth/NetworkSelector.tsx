
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mainnet, sepolia, holesky } from 'viem/chains';
import { useChainId, useSwitchChain } from 'wagmi';

interface NetworkOption {
  id: number;
  name: string;
  color: string;
  testnet?: boolean;
}

const NETWORKS: NetworkOption[] = [
  { id: mainnet.id, name: 'Ethereum', color: '#627EEA' },
  { id: sepolia.id, name: 'Sepolia', color: '#1E4AE5', testnet: true },
  { id: holesky.id, name: 'Holesky', color: '#F3BA2F', testnet: true },
];

interface NetworkSelectorProps {
  size?: 'default' | 'sm' | 'lg';
  showTestnets?: boolean;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  size = 'default',
  showTestnets = true
}) => {
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();
  
  const visibleNetworks = showTestnets 
    ? NETWORKS 
    : NETWORKS.filter(network => !network.testnet);
  
  const currentNetwork = NETWORKS.find(network => network.id === chainId) || NETWORKS[0];
  const isError = !!error;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={size} 
          className="flex items-center gap-2 border-gray-600"
          disabled={isPending}
        >
          {isError ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Network Error</span>
            </>
          ) : (
            <>
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: currentNetwork.color }}
              />
              <span>{currentNetwork.name}</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {visibleNetworks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => switchChain?.(({ chainId: network.id }))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: network.color }}
            />
            {network.name}
            {network.id === chainId && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
