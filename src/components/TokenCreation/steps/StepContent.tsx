
import React from 'react';
import NetworkSelectionStep from './NetworkSelectionStep';
import TokenTypeSelectionStep from './TokenTypeSelectionStep';
import NameSymbolStep from './NameSymbolStep';
import SupplyDetailsStep from './SupplyDetailsStep';
import AdvancedOptionsStep from './AdvancedOptionsStep';
import ReviewStep from './ReviewStep';
import DeploymentStep from './DeploymentStep';
import SuccessStep from './SuccessStep';
import { useTokenCreation } from '../context/TokenCreationContext.utils';

interface StepContentProps {
  step: number;
}

const StepContent: React.FC<StepContentProps> = ({ step }) => {
  const { 
    deployTokenContract, 
    isDeploying, 
    deployedContract, 
    ownerAddress,
    form,
    resetForm 
  } = useTokenCreation();

  switch (step) {
    case 0:
      return <NetworkSelectionStep />;
    case 1:
      return <TokenTypeSelectionStep />;
    case 2:
      return <NameSymbolStep />;
    case 3:
      return <SupplyDetailsStep />;
    case 4:
      return <AdvancedOptionsStep />;
    case 5:
      return <ReviewStep />;
    case 6:
      return <DeploymentStep 
        isDeploying={isDeploying} 
        onDeploy={deployTokenContract} 
      />;
    case 7:
      return <SuccessStep 
        contractAddress={deployedContract || ''} 
        tokenName={form?.getValues()?.name || ''}
        tokenSymbol={form?.getValues()?.symbol || ''}
        network={form?.getValues()?.network || ''}
        ownerAddress={ownerAddress || ''}
        canMint={!!form?.getValues()?.features?.mintable}
        canBurn={!!form?.getValues()?.features?.burnable}
        onReset={resetForm}
      />;
    default:
      return null;
  }
};

export default StepContent;
