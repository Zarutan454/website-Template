
import React from 'react';
import NetworkSelection from './NetworkSelection';
import { useTokenCreation } from '../context/TokenCreationContext.utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { NetworkOption } from '../types';

const NetworkSelectionStep: React.FC = () => {
  const { formData, updateFormField, errors } = useTokenCreation();
  
  // Demo networks - In einer realen Anwendung würden diese aus einem API-Aufruf kommen
  const networks: NetworkOption[] = [
    { 
      id: 'ethereum', 
      name: 'Ethereum', 
      currency: 'ETH', 
      icon: '/images/networks/ethereum.png', 
      isTestnet: false,
      tokenStandard: 'ERC-20',
      transactionTime: '~15 Minuten',
      securityLevel: 'high',
      gasRange: '~$15-50 USD',
      chainId: 1
    },
    { 
      id: 'polygon', 
      name: 'Polygon', 
      currency: 'MATIC', 
      icon: '/images/networks/polygon.png', 
      isTestnet: false,
      tokenStandard: 'ERC-20',
      transactionTime: '~2 Sekunden',
      securityLevel: 'medium',
      gasRange: '~$0.1-1 USD',
      chainId: 137
    },
    { 
      id: 'bnb', 
      name: 'BNB Chain', 
      currency: 'BNB', 
      icon: '/images/networks/bnb.png', 
      isTestnet: false,
      tokenStandard: 'BEP-20',
      transactionTime: '~5 Sekunden',
      securityLevel: 'medium',
      gasRange: '~$1-5 USD',
      chainId: 56
    },
    { 
      id: 'goerli', 
      name: 'Goerli Testnet', 
      currency: 'GoerliETH', 
      icon: '/images/networks/ethereum.png', 
      isTestnet: true,
      chainId: 5
    },
    { 
      id: 'mumbai', 
      name: 'Mumbai Testnet', 
      currency: 'MATIC', 
      icon: '/images/networks/polygon.png', 
      isTestnet: true,
      chainId: 80001
    },
    { 
      id: 'bnb-testnet', 
      name: 'BNB Testnet', 
      currency: 'tBNB', 
      icon: '/images/networks/bnb.png', 
      isTestnet: true,
      chainId: 97
    }
  ];
  
  const handleNetworkSelect = (networkId: string) => {
    updateFormField('network', networkId);
  };
  
  return (
    <div className="space-y-6">
      {errors?.network && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.network}</AlertDescription>
        </Alert>
      )}
      
      <NetworkSelection 
        networks={networks} 
        selectedNetwork={formData.network} 
        onSelect={handleNetworkSelect} 
      />
    </div>
  );
};

export default NetworkSelectionStep;
