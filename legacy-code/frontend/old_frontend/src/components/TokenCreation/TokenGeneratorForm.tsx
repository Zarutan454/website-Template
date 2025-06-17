
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface TokenData {
  name: string;
  symbol: string;
  initialSupply: string;
  tokenType: 'standard' | 'marketing' | 'business';
  description?: string;
  canMint: boolean;
  canBurn: boolean;
  network: string;
  maxTransactionLimit?: string;
  maxWalletLimit?: string;
  maxSupply?: string;
  lockupTime?: number;
}

interface TokenGeneratorFormProps {
  tokenData: TokenData;
  handleInputChange: (field: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onPreview: () => void;
}

const TokenGeneratorForm: React.FC<TokenGeneratorFormProps> = ({ 
  tokenData, 
  handleInputChange, 
  handleSubmit,
  isSubmitting,
  onPreview
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token-Details eingeben</CardTitle>
        <CardDescription>Gib die Details für deinen neuen Token ein</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basis-Informationen */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basis-Informationen</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Token Name</Label>
                <Input
                  id="name"
                  placeholder="z.B. My Awesome Token"
                  value={tokenData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="z.B. MAT"
                  value={tokenData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialSupply">Anfangsbestand</Label>
              <Input
                id="initialSupply"
                type="text"
                placeholder="z.B. 1000000"
                value={tokenData.initialSupply}
                onChange={(e) => handleInputChange('initialSupply', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                placeholder="Beschreibe deinen Token"
                value={tokenData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Token-Typ */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Token-Typ</h3>
            
            <div className="space-y-2">
              <Label htmlFor="tokenType">Wähle den Token-Typ</Label>
              <Select 
                value={tokenData.tokenType} 
                onValueChange={(value) => handleInputChange('tokenType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Token-Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Token</SelectItem>
                  <SelectItem value="marketing">Marketing Token (mit Steuern)</SelectItem>
                  <SelectItem value="business">Business Token (mit Limits)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Netzwerk */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Blockchain-Netzwerk</h3>
            
            <div className="space-y-2">
              <Label htmlFor="network">Wähle das Netzwerk</Label>
              <Select 
                value={tokenData.network} 
                onValueChange={(value) => handleInputChange('network', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Netzwerk wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="avalanche">Avalanche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Funktionen */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Token-Funktionen</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="canMint">Prägbar (Mintable)</Label>
                <p className="text-sm text-muted-foreground">Ermöglicht das Erstellen neuer Tokens</p>
              </div>
              <Switch
                id="canMint"
                checked={tokenData.canMint}
                onCheckedChange={(checked) => handleInputChange('canMint', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="canBurn">Brennbar (Burnable)</Label>
                <p className="text-sm text-muted-foreground">Ermöglicht das Vernichten von Tokens</p>
              </div>
              <Switch
                id="canBurn"
                checked={tokenData.canBurn}
                onCheckedChange={(checked) => handleInputChange('canBurn', checked)}
              />
            </div>
          </div>

          {/* Business Token spezifische Felder */}
          {tokenData.tokenType === 'business' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Business Token Einstellungen</h3>
              
              <Alert className="bg-blue-50/50 dark:bg-blue-900/20">
                <InfoCircledIcon className="h-5 w-5 text-blue-600" />
                <AlertDescription>
                  Diese Einstellungen sind optional. Leere Felder bedeuten "keine Begrenzung".
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="maxTransactionLimit">Max. Transaktionsbetrag</Label>
                <Input
                  id="maxTransactionLimit"
                  placeholder="Optional"
                  value={tokenData.maxTransactionLimit || ''}
                  onChange={(e) => handleInputChange('maxTransactionLimit', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxWalletLimit">Max. Wallet-Betrag</Label>
                <Input
                  id="maxWalletLimit"
                  placeholder="Optional"
                  value={tokenData.maxWalletLimit || ''}
                  onChange={(e) => handleInputChange('maxWalletLimit', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxSupply">Max. Gesamtmenge</Label>
                <Input
                  id="maxSupply"
                  placeholder="Optional"
                  value={tokenData.maxSupply || ''}
                  onChange={(e) => handleInputChange('maxSupply', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lockupTime">Sperrzeit (in Sekunden)</Label>
                <Input
                  id="lockupTime"
                  type="number"
                  placeholder="Optional"
                  value={tokenData.lockupTime || ''}
                  onChange={(e) => handleInputChange('lockupTime', parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Aktionsbuttons */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onPreview}>
              Vorschau
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : 'Token erstellen'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TokenGeneratorForm;
