import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext.utils';
import { djangoApi } from '@/lib/django-api-new';

interface SmartContract {
  id: number;
  name: string;
  contract_type: string;
  address: string;
  network: string;
  abi: any;
  bytecode: string;
  source_code: string;
  creator: any;
  transaction_hash: string;
  deployed_at: string;
}

export default function SmartContractManagement() {
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployForm, setDeployForm] = useState({
    contract_type: 'token',
    name: '',
    symbol: '',
    total_supply: ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await djangoApi.get('/contracts/');
      setContracts(response.data.contracts || response.data);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load smart contracts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeployContract = async () => {
    if (!deployForm.name || !deployForm.contract_type) {
      toast({
        title: 'Invalid Input',
        description: 'Please provide contract name and type',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDeploying(true);
      await djangoApi.post('/contracts/deploy/', deployForm);
      
      toast({
        title: 'Success',
        description: 'Smart contract deployed successfully',
      });
      
      setDeployForm({
        contract_type: 'token',
        name: '',
        symbol: '',
        total_supply: ''
      });
      
      loadContracts();
      
    } catch (error) {
      console.error('Error deploying contract:', error);
      toast({
        title: 'Error',
        description: 'Failed to deploy smart contract',
        variant: 'destructive',
      });
    } finally {
      setDeploying(false);
    }
  };

  const getContractTypeIcon = (type: string) => {
    switch (type) {
      case 'token': return '🪙';
      case 'nft': return '🖼️';
      case 'marketplace': return '🏪';
      case 'governance': return '🗳️';
      default: return '📄';
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return 'bg-blue-500';
      case 'polygon': return 'bg-purple-500';
      case 'bsc': return 'bg-yellow-500';
      case 'solana': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard',
    });
  };

  if (loading && contracts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deploy Contract Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Deploy Smart Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract-name">Contract Name</Label>
              <Input
                id="contract-name"
                value={deployForm.name}
                onChange={(e) => setDeployForm({...deployForm, name: e.target.value})}
                placeholder="Enter contract name"
              />
            </div>
            <div>
              <Label htmlFor="contract-type">Contract Type</Label>
              <Select
                value={deployForm.contract_type}
                onValueChange={(value) => setDeployForm({...deployForm, contract_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Token (ERC-20)</SelectItem>
                  <SelectItem value="nft">NFT (ERC-721)</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {deployForm.contract_type === 'token' && (
              <>
                <div>
                  <Label htmlFor="token-symbol">Token Symbol</Label>
                  <Input
                    id="token-symbol"
                    value={deployForm.symbol}
                    onChange={(e) => setDeployForm({...deployForm, symbol: e.target.value})}
                    placeholder="e.g., BSN"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="total-supply">Total Supply</Label>
                  <Input
                    id="total-supply"
                    type="number"
                    value={deployForm.total_supply}
                    onChange={(e) => setDeployForm({...deployForm, total_supply: e.target.value})}
                    placeholder="e.g., 1000000"
                  />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <Button 
                onClick={handleDeployContract}
                disabled={deploying || !deployForm.name}
                className="w-full"
              >
                {deploying ? 'Deploying...' : 'Deploy Contract'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployed Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Deployed Contracts ({contracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No contracts deployed yet. Deploy your first smart contract!
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <Card key={contract.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getContractTypeIcon(contract.contract_type)}
                      </span>
                      <div>
                        <h3 className="font-semibold">{contract.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{contract.contract_type}</Badge>
                          <Badge className={getNetworkColor(contract.network)}>
                            {contract.network}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(contract.address)}
                      >
                        Copy Address
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(contract.transaction_hash)}
                      >
                        Copy Hash
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <div>Address: {contract.address}</div>
                    <div>Deployed: {new Date(contract.deployed_at).toLocaleDateString()}</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.filter(c => c.contract_type === 'token').length}
            </div>
            <div className="text-sm text-muted-foreground">Token Contracts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {contracts.filter(c => c.contract_type === 'nft').length}
            </div>
            <div className="text-sm text-muted-foreground">NFT Contracts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.network === 'ethereum').length}
            </div>
            <div className="text-sm text-muted-foreground">Ethereum Contracts</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
