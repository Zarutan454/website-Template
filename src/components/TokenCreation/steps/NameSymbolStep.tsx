
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTokenCreation } from '../context/TokenCreationContext';
import { InfoIcon } from 'lucide-react';

const NameSymbolStep: React.FC = () => {
  const { formData, updateFormField, errors } = useTokenCreation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Token Name und Symbol</CardTitle>
          <CardDescription>
            Diese Informationen werden auf der Blockchain gespeichert und können später nicht mehr geändert werden.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token-name">Token Name</Label>
            <Input
              id="token-name"
              placeholder="z.B. My Amazing Token"
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              className={errors?.name ? 'border-red-500' : ''}
            />
            {errors?.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Der vollständige Name deines Tokens, z.B. "Bitcoin"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-symbol">Token Symbol</Label>
            <Input
              id="token-symbol"
              placeholder="z.B. MAT"
              value={formData.symbol}
              onChange={(e) => updateFormField('symbol', e.target.value.toUpperCase())}
              className={errors?.symbol ? 'border-red-500' : ''}
              maxLength={6}
            />
            {errors?.symbol && (
              <p className="text-sm text-red-500">{errors.symbol}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Das Kurzsymbol deines Tokens, z.B. "BTC" (max. 6 Zeichen)
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription>
          Wähle einen einzigartigen und merkfähigen Namen und ein Symbol für deinen Token.
          Diese Informationen werden dauerhaft in der Blockchain gespeichert.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NameSymbolStep;
