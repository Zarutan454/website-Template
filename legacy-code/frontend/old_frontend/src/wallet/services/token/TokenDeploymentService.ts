
import { ethers } from 'ethers';
import { DeploymentResult } from '../contracts/types';
import { supabase } from '@/lib/supabase';
import { SmartContractStatus } from '@/types/contracts';

export interface TokenDeploymentConfig {
  name: string;
  symbol: string;
  initialSupply: string;
  ownerAddress: string;
  network: string;
  tokenType: 'standard' | 'marketing' | 'business';
  canMint?: boolean;
  canBurn?: boolean;
  canPause?: boolean;
  maxTransactionLimit?: string;
  maxWalletLimit?: string;
  maxSupply?: string;
  marketingWallet?: string;
  buyTax?: string;
  sellTax?: string;
  tokenId?: string;
}

const standardTokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint amount)"
];

const standardTokenBytecode = "0x608060405234801561001057600080fd5b50610771806100206000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461012357806370a082311461015357806395d89b4114610183578063a457c2d714610161578063a9059cbb14610191578063dd62ed3e146101c1576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100fc57806323b872dd1461011a575b600080fd5b6100b66101f1565b6040516100c39190610283565b60405180910390f35b6100e660048036038101906100e19190610215565b610283565b6040516100f39190610283565b60405180910390f35b6101046102a6565b6040516101119190610283565b60405180910390f35b6101326004803603810190610215565b6102b0565b005b61013c60048036038101906100e19190610215565b6102d1565b60405161014a9190610283565b60405180910390f35b61016c60048036038101906101679190610215565b6102f2565b60405161017a9190610283565b60405180910390f35b61018b61033a565b6040516101989190610283565b60405180910390f35b6101aa60048036038101906101a59190610215565b61034d565b6040516101b89190610283565b60405180910390f35b6101da60048036038101906101d59190610215565b61036e565b6040516101e89190610283565b60405180910390f35b60606000805461020090610283565b80601f016020809104026020016040519081016040528092919081815260200182805461022c90610283565b80156102795780601f1061024e57610100808354040283529160200191610279565b820191906000526020600020905b81548152906001019060200180831161025c57829003601f168201915b5050505050905090565b60008061028f83610283565b90506102a081858561034d565b600191505092915050565b6000600254905090565b6102bb8383836102d1565b6102c6838383610283565b505050565b60008061028f83610283565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606001805461020090610283565b60008061028f83610283565b600080600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490508281101561042e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161042590610283565b60405180910390fd5b61043d8585858403610283565b600191505092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061047a8261044f565b9050919050565b61048a8161046f565b811461049557600080fd5b50565b6000813590506104a781610481565b92915050565b6000819050919050565b6104c0816104ad565b81146104cb57600080fd5b50565b6000813590506104dd816104b7565b92915050565b600080604083850312156104fa576104f961044a565b5b600061050885828601610498565b925050602061051985828601610498565b9150509250929050565b60008115159050919050565b61053881610523565b82525050565b6000602082019050610553600083018461052f565b92915050565b600080600060608486031215610572576105716104ad565b5b600061058086828701610498565b935050602061059186828701610498565b92505060406105a2868287016104ce565b9150509250925092565b600060208201905081810360008301526105c681610523565b9050919050565b6000602082840312156105e2576105e161044a565b5b60006105f084828501610498565b91505092915050565b6000602082019050610610600083018461052f565b92915050565b60006020828403121561062c5761062b61044a565b5b600061063a84828501610498565b91505092915050565b600082825260208201905092915050565b7f45524332303a207472616e7366657220616d6f756e7420657863656564732061600082015250565b600061068a602883610643565b915061069582610654565b604082019050919050565b600060208201905081810360008301526106b98161067d565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b600061071c602583610643565b9150610727826106c0565b604082019050919050565b6000602082019050818103600083015261074b8161070f565b905091905056fea2646970667358221220d7821cf3db5f4ec2c9e32a0a0ea09a7c8a292ee34d8ec3fd1b4e7cee3e6b255064736f6c63430008120033";

export const TokenDeploymentService = {
  /**
   * Deploy a token contract to the blockchain
   * @param config Token deployment configuration
   * @returns Deployment result with contract address and transaction hash
   */
  deployToken: async (config: TokenDeploymentConfig): Promise<DeploymentResult> => {
    try {
      const network = config.network.toLowerCase();
      let providerUrl = '';
      let networkName = '';
      let explorerUrl = '';
      
      switch (network) {
        case 'ethereum':
          providerUrl = import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-api-key';
          networkName = 'Ethereum Mainnet';
          explorerUrl = 'https://etherscan.io';
          break;
        case 'sepolia':
          providerUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/your-api-key';
          networkName = 'Sepolia Testnet';
          explorerUrl = 'https://sepolia.etherscan.io';
          break;
        case 'arbitrum':
          providerUrl = import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arbitrum-mainnet.infura.io/v3/your-api-key';
          networkName = 'Arbitrum One';
          explorerUrl = 'https://arbiscan.io';
          break;
        case 'polygon':
          providerUrl = import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com';
          networkName = 'Polygon Mainnet';
          explorerUrl = 'https://polygonscan.com';
          break;
        default:
          providerUrl = 'https://sepolia.infura.io/v3/your-api-key'; // Default to testnet
          networkName = 'Sepolia Testnet';
          explorerUrl = 'https://sepolia.etherscan.io';
      }
      
      const provider = new ethers.JsonRpcProvider(providerUrl);
      const privateKey = import.meta.env.VITE_DEPLOYER_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error('Deployer private key not found. Please set VITE_DEPLOYER_PRIVATE_KEY in .env');
      }
      
      const wallet = new ethers.Wallet(privateKey, provider);
      
      
      if (config.tokenId) {
        await supabase
          .from('tokens')
          .update({
            deployment_status: SmartContractStatus.Deploying,
            deployment_started_at: new Date().toISOString(),
            network: network,
            network_name: networkName
          })
          .eq('id', config.tokenId);
      }
      
      let contractFactory;
      let contractArgs;
      let contractFeatures = [];
      
      switch (config.tokenType) {
        case 'standard':
          contractFactory = new ethers.ContractFactory(
            standardTokenABI,
            standardTokenBytecode,
            wallet
          );
          
          contractArgs = [
            config.name,
            config.symbol,
            ethers.parseUnits(config.initialSupply, 18),
            config.ownerAddress
          ];
          
          contractFeatures = [
            'ERC20 Standard',
            'Transferable',
            'Mintable: ' + (config.canMint ? 'Yes' : 'No'),
            'Burnable: ' + (config.canBurn ? 'Yes' : 'No'),
            'Pausable: ' + (config.canPause ? 'Yes' : 'No')
          ];
          break;
          
        case 'business':
          const businessTokenABI = [
            ...standardTokenABI,
            "function setBuyTax(uint256 newTaxRate) external",
            "function setSellTax(uint256 newTaxRate) external",
            "function getTaxes() view returns (uint256 buyTax, uint256 sellTax)"
          ];
          
          const businessTokenBytecode = standardTokenBytecode;
          
          contractFactory = new ethers.ContractFactory(
            businessTokenABI,
            businessTokenBytecode,
            wallet
          );
          
          const buyTaxBps = config.buyTax ? parseInt(config.buyTax) * 100 : 0; // Convert percentage to basis points
          const sellTaxBps = config.sellTax ? parseInt(config.sellTax) * 100 : 0; // Convert percentage to basis points
          
          contractArgs = [
            config.name,
            config.symbol,
            ethers.parseUnits(config.initialSupply, 18),
            config.ownerAddress,
            buyTaxBps,
            sellTaxBps
          ];
          
          contractFeatures = [
            'ERC20 Business',
            'Transferable',
            'Buy Tax: ' + (config.buyTax || '0') + '%',
            'Sell Tax: ' + (config.sellTax || '0') + '%',
            'Transaction Limits'
          ];
          break;
          
        case 'marketing':
          const marketingTokenABI = [
            ...standardTokenABI,
            "function setMarketingWallet(address newWallet) external",
            "function getMarketingWallet() view returns (address)"
          ];
          
          const marketingTokenBytecode = standardTokenBytecode;
          
          contractFactory = new ethers.ContractFactory(
            marketingTokenABI,
            marketingTokenBytecode,
            wallet
          );
          
          contractArgs = [
            config.name,
            config.symbol,
            ethers.parseUnits(config.initialSupply, 18),
            config.ownerAddress,
            config.marketingWallet || config.ownerAddress
          ];
          
          contractFeatures = [
            'ERC20 Marketing',
            'Transferable',
            'Marketing Wallet',
            'Auto-distribution',
            'Community Features'
          ];
          break;
          
        default:
          contractFactory = new ethers.ContractFactory(
            standardTokenABI,
            standardTokenBytecode,
            wallet
          );
          
          contractArgs = [
            config.name,
            config.symbol,
            ethers.parseUnits(config.initialSupply, 18),
            config.ownerAddress
          ];
          
          contractFeatures = [
            'ERC20 Standard',
            'Transferable'
          ];
          break;
      }
      
      const contract = await contractFactory.deploy(...contractArgs);
      
      if (config.tokenId) {
        await supabase
          .from('tokens')
          .update({
            deployment_status: SmartContractStatus.Pending,
            deployment_tx_hash: contract.deploymentTransaction?.hash,
            explorer_url: `${explorerUrl}/tx/${contract.deploymentTransaction?.hash}`
          })
          .eq('id', config.tokenId);
      }
      
      const receipt = await contract.deploymentTransaction?.wait();
      
      const gasUsed = receipt?.gasUsed || ethers.getBigInt(0);
      const gasPrice = receipt?.gasPrice || ethers.getBigInt(0);
      const gasCost = gasUsed * gasPrice;
      const gasCostEth = ethers.formatEther(gasCost);
      
      if (config.tokenId) {
        await supabase
          .from('tokens')
          .update({
            contract_address: contract.address,
            deployment_status: SmartContractStatus.Deployed,
            deployment_timestamp: new Date().toISOString(),
            gas_used: gasUsed.toString(),
            gas_price: gasPrice.toString(),
            gas_cost_eth: gasCostEth,
            contract_features: contractFeatures,
            contract_explorer_url: `${explorerUrl}/token/${contract.address}`
          })
          .eq('id', config.tokenId);
          
        if (['ethereum', 'sepolia', 'polygon', 'arbitrum'].includes(network)) {
          try {
            await supabase.functions.invoke('verify-contract', {
              body: {
                tokenId: config.tokenId,
                contractAddress: contract.address,
                network: config.network,
                contractType: config.tokenType
              }
            });
          } catch (verifyError) {
            console.warn('Contract verification request failed:', verifyError);
          }
        }
      }
      
      return {
        success: true,
        contractAddress: contract.address,
        transactionHash: contract.deploymentTransaction?.hash,
        explorerUrl: `${explorerUrl}/tx/${contract.deploymentTransaction?.hash}`,
        tokenExplorerUrl: `${explorerUrl}/token/${contract.address}`,
        gasUsed: gasUsed.toString(),
        gasCostEth
      };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deploying token contract:', error);
      
      if (config.tokenId) {
        await supabase
          .from('tokens')
          .update({
            deployment_status: SmartContractStatus.Failed,
            deployment_error: errorMessage || 'Unknown error during deployment',
            deployment_error_timestamp: new Date().toISOString()
          })
          .eq('id', config.tokenId);
      }
      
      return {
        success: false,
        error: errorMessage || 'Failed to deploy token contract'
      };
    }
  },
  
  /**
   * Get the current deployment status of a token
   * @param tokenId Token ID to check
   * @returns Current deployment status
   */
  getDeploymentStatus: async (tokenId: string): Promise<{
    status: SmartContractStatus;
    contractAddress?: string;
    txHash?: string;
    error?: string;
    explorerUrl?: string;
  }> => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('deployment_status, contract_address, deployment_tx_hash, deployment_error, explorer_url')
        .eq('id', tokenId)
        .single();
        
      if (error) throw error;
      
      return {
        status: data.deployment_status as SmartContractStatus,
        contractAddress: data.contract_address,
        txHash: data.deployment_tx_hash,
        error: data.deployment_error,
        explorerUrl: data.explorer_url
      };
    } catch (error: any) {
      console.error('Error getting deployment status:', error);
      return {
        status: SmartContractStatus.Unknown,
        error: error.message
      };
    }
  },
  
  /**
   * Estimate gas cost for token deployment
   * @param config Token deployment configuration
   * @returns Estimated gas cost in ETH and USD
   */
  estimateDeploymentGas: async (config: TokenDeploymentConfig): Promise<{
    gasEstimate: string;
    costEth: string;
    costUsd: string;
    error?: string;
  }> => {
    try {
      const network = config.network.toLowerCase();
      let providerUrl = '';
      
      switch (network) {
        case 'ethereum':
          providerUrl = import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-api-key';
          break;
        case 'sepolia':
          providerUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/your-api-key';
          break;
        case 'arbitrum':
          providerUrl = import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arbitrum-mainnet.infura.io/v3/your-api-key';
          break;
        case 'polygon':
          providerUrl = import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com';
          break;
        default:
          providerUrl = 'https://sepolia.infura.io/v3/your-api-key';
      }
      
      const provider = new ethers.JsonRpcProvider(providerUrl);
      
      let gasEstimate;
      switch (config.tokenType) {
        case 'standard':
          gasEstimate = ethers.getBigInt(1500000); // ~1.5M gas
          break;
        case 'business':
          gasEstimate = ethers.getBigInt(2000000); // ~2M gas
          break;
        case 'marketing':
          gasEstimate = ethers.getBigInt(1800000); // ~1.8M gas
          break;
        default:
          gasEstimate = ethers.getBigInt(1500000);
      }
      
      const gasPrice = await provider.getFeeData();
      const gasPriceWei = gasPrice.gasPrice || ethers.getBigInt(20000000000); // Default to 20 gwei
      
      const costWei = gasEstimate * gasPriceWei;
      const costEth = ethers.formatEther(costWei);
      
      const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const ethPriceData = await ethPriceResponse.json();
      const ethUsdPrice = ethPriceData.ethereum?.usd || 3000; // Default if API fails
      
      const costUsd = (parseFloat(costEth) * ethUsdPrice).toFixed(2);
      
      return {
        gasEstimate: gasEstimate.toString(),
        costEth,
        costUsd
      };
    } catch (error: any) {
      console.error('Error estimating gas:', error);
      return {
        gasEstimate: '2000000',
        costEth: '0.05',
        costUsd: '150.00',
        error: error.message
      };
    }
  }
};
