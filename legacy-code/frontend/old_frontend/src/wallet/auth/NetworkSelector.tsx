
import React from 'react';
import { useNetwork, useSwitchNetwork, useChainId } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Network, Globe, ChevronDown, Check, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { sepolia, mainnet } from 'wagmi/chains';

type NetworkSelectorProps = {
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({ size = 'default' }) => {
  const chainId = useChainId();
  const { chains, switchNetwork, isLoading, error, pendingChainId } = useSwitchNetwork({
    onSuccess: (data) => {
      toast.success(`Netzwerk gewechselt zu ${getNetworkName(data.id)}`);
    },
    onError: (error) => {
      toast.error(`Fehler beim Netzwerkwechsel: ${error.message}`);
    }
  });

  const networks = [
    { id: mainnet.id, name: 'Ethereum Mainnet', testnet: false, icon: Globe },
    { id: sepolia.id, name: 'Sepolia Testnet', testnet: true, icon: Globe }
  ];

  const currentNetwork = networks.find(network => network.id === chainId) || networks[0];

  function getNetworkName(id: number): string {
    return networks.find(n => n.id === id)?.name || 'Unbekanntes Netzwerk';
  }

  // Wenn es Fehler beim Netzwerkwechsel gibt
  if (error) {
    return (
      <Button variant="outline" size={size} className="text-yellow-500 border-yellow-500">
        <AlertTriangle className="mr-2 h-4 w-4" />
        Netzwerkfehler
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} disabled={isLoading} className="transition-all duration-200 hover:bg-primary/10">
          {isLoading ? (
            <>
              <Network className="mr-2 h-4 w-4 animate-pulse" />
              Wechsle...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              {currentNetwork.name.includes('Mainnet') ? 'Mainnet' : currentNetwork.name}
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-dark-100 text-white border-gray-700">
        <div className="px-3 py-2 text-sm font-medium text-gray-400">
          Blockchain-Netzwerk auswählen
        </div>
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            className={`px-3 py-2 text-sm cursor-pointer hover:bg-dark-200 flex justify-between ${
              network.id === chainId ? 'text-primary' : ''
            }`}
            onClick={() => network.id !== chainId && switchNetwork?.(network.id)}
          >
            <div className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              <span>{network.name}</span>
            </div>
            {network.id === chainId && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
