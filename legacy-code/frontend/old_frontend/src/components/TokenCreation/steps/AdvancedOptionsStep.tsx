import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useTokenCreation } from '../context/TokenCreationContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, addMonths } from 'date-fns';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const AdvancedOptionsStep: React.FC = () => {
  const { formData, updateFormField } = useTokenCreation();
  const tokenType = formData.tokenType;

  // Marketing Token Optionen
  const renderMarketingOptions = () => {
    if (tokenType !== 'marketing') return null;

    return (
      <div className="space-y-6">
        <Separator className="my-6" />
        <h3 className="text-lg font-medium">Marketing Features</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="marketing-wallet">Marketing Wallet</Label>
            <Input
              id="marketing-wallet"
              placeholder="0x..."
              value={formData.marketingWallet || ''}
              onChange={(e) => updateFormField('marketingWallet', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Wallet-Adresse, an die Marketing-Gebühren gesendet werden
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buy-tax">Buy Tax (%)</Label>
              <div className="flex items-center space-x-3">
                <Slider
                  id="buy-tax"
                  min={0}
                  max={10}
                  step={0.1}
                  value={[parseFloat(formData.buyTax || '0')]}
                  onValueChange={(values) => updateFormField('buyTax', values[0].toString())}
                />
                <div className="w-12 text-center font-medium">
                  {parseFloat(formData.buyTax || '0').toFixed(1)}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Steuer auf Käufe (0-10%)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sell-tax">Sell Tax (%)</Label>
              <div className="flex items-center space-x-3">
                <Slider
                  id="sell-tax"
                  min={0}
                  max={10}
                  step={0.1}
                  value={[parseFloat(formData.sellTax || '0')]}
                  onValueChange={(values) => updateFormField('sellTax', values[0].toString())}
                />
                <div className="w-12 text-center font-medium">
                  {parseFloat(formData.sellTax || '0').toFixed(1)}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Steuer auf Verkäufe (0-10%)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Business Token Optionen
  const renderBusinessOptions = () => {
    if (tokenType !== 'business') return null;

    return (
      <div className="space-y-6">
        <Separator className="my-6" />
        <h3 className="text-lg font-medium">Business Features</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-supply">Maximaler Supply</Label>
            <Input
              id="max-supply"
              placeholder="Unbegrenzt"
              value={formData.maxSupply || ''}
              onChange={(e) => updateFormField('maxSupply', e.target.value.replace(/[^0-9]/g, ''))}
            />
            <p className="text-sm text-muted-foreground">
              Die maximale Anzahl von Tokens, die jemals existieren können (leer lassen für unbegrenzt)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-tx">Maximale Transaktion</Label>
              <Input
                id="max-tx"
                placeholder="Unbegrenzt"
                value={formData.maxTransactionLimit || ''}
                onChange={(e) => updateFormField('maxTransactionLimit', e.target.value.replace(/[^0-9]/g, ''))}
              />
              <p className="text-sm text-muted-foreground">
                Maximale Anzahl von Tokens pro Transaktion
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-wallet">Maximale Wallet-Größe</Label>
              <Input
                id="max-wallet"
                placeholder="Unbegrenzt"
                value={formData.maxWalletLimit || ''}
                onChange={(e) => updateFormField('maxWalletLimit', e.target.value.replace(/[^0-9]/g, ''))}
              />
              <p className="text-sm text-muted-foreground">
                Maximale Anzahl von Tokens pro Wallet
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Token Lockup</Label>
            <RadioGroup 
              value={formData.lockupTime ? formData.lockupTime : '0'} 
              onValueChange={(value) => updateFormField('lockupTime', value)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="0" id="no-lockup" className="sr-only" />
                <Label
                  htmlFor="no-lockup"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${formData.lockupTime === '0' || !formData.lockupTime ? 'border-primary bg-primary/5' : ''}`}
                >
                  <span className="font-medium">Kein Lockup</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="2592000" id="lockup-30" className="sr-only" />
                <Label
                  htmlFor="lockup-30"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${formData.lockupTime === '2592000' ? 'border-primary bg-primary/5' : ''}`}
                >
                  <span className="font-medium">30 Tage Lockup</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="7776000" id="lockup-90" className="sr-only" />
                <Label
                  htmlFor="lockup-90"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${formData.lockupTime === '7776000' ? 'border-primary bg-primary/5' : ''}`}
                >
                  <span className="font-medium">90 Tage Lockup</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="15552000" id="lockup-180" className="sr-only" />
                <Label
                  htmlFor="lockup-180"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${formData.lockupTime === '15552000' ? 'border-primary bg-primary/5' : ''}`}
                >
                  <span className="font-medium">180 Tage Lockup</span>
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Zeitraum, in dem Tokens nach dem Deployment gesperrt sind
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Erweiterte Optionen</CardTitle>
          <CardDescription>
            Zusätzliche Einstellungen für deinen Token (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token-description">Beschreibung</Label>
              <Input
                id="token-description"
                placeholder="Beschreibe deinen Token und sein Ziel"
                value={formData.description || ''}
                onChange={(e) => updateFormField('description', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Eine kurze Beschreibung deines Tokens (wird nicht in der Blockchain gespeichert)
              </p>
            </div>
            
            {/* Typ-spezifische Optionen */}
            {renderMarketingOptions()}
            {renderBusinessOptions()}
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription>
          Die erweiterten Optionen bieten zusätzliche Funktionen je nach gewähltem Token-Typ.
          Nicht alle Optionen sind für jeden Token-Typ verfügbar.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AdvancedOptionsStep;
