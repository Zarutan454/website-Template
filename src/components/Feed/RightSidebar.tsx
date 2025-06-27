
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MiningWidget from './Mining/MiningWidget';
import { Wallet, Globe, Droplet } from 'lucide-react';
import { NetworkSelector } from '@/wallet/auth/NetworkSelector';
import { ConnectWalletButton } from '@/wallet/auth/ConnectWalletButton';
import { useAccount } from 'wagmi';

const RightSidebar = () => {
  const { isConnected } = useAccount();

  return (
    <div className="bg-dark-100 border-l border-gray-800 p-4 space-y-6 overflow-y-auto hide-scrollbar">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">BSN Tools</h3>
        
        <div className="space-y-2">
          <Link to="/wallet">
            <Button variant="outline" className="w-full justify-start">
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </Button>
          </Link>
          
          <Link to="/create-token">
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">🪙</span>
              Token erstellen
            </Button>
          </Link>
          
          <Link to="/airdrops">
            <Button variant="outline" className="w-full justify-start">
              <Droplet className="mr-2 h-4 w-4" />
              Airdrops
            </Button>
          </Link>
        </div>

        {isConnected && (
          <div className="pt-2">
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-gray-400 mb-1">Netzwerk</div>
              <NetworkSelector />
            </div>
          </div>
        )}
        
        {!isConnected && (
          <div className="pt-2">
            <div className="text-sm text-gray-400 mb-1">Wallet</div>
            <ConnectWalletButton size="sm" />
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 pt-4">
        <MiningWidget />
      </div>
    </div>
  );
};

export default RightSidebar;
