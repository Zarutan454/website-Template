
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTokenCreation } from '../context/TokenCreationContext';
import { TOKEN_TYPES } from '../data/tokenData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import TokenTypeSelection from '../TokenTypeSelection';

const TokenTypeSelectionStep: React.FC = () => {
  const { formData, updateFormField } = useTokenCreation();
  
  const handleTokenTypeSelect = (tokenType: string) => {
    updateFormField('tokenType', tokenType);
    
    // Aktualisiere Features basierend auf dem ausgewählten Token-Typ
    if (tokenType === 'standard') {
      updateFormField('features', {
        mintable: true,
        burnable: true,
        pausable: false,
        shareable: false
      });
    } else if (tokenType === 'marketing') {
      updateFormField('features', {
        mintable: true,
        burnable: true,
        pausable: true,
        shareable: false
      });
    } else if (tokenType === 'business') {
      updateFormField('features', {
        mintable: true,
        burnable: true,
        pausable: true,
        shareable: false
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wähle einen Token-Typ</CardTitle>
          <CardDescription>
            Verschiedene Token-Typen bieten unterschiedliche Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TokenTypeSelection
            tokenTypes={TOKEN_TYPES}
            selectedTokenType={formData.tokenType}
            onSelect={handleTokenTypeSelect}
          />
        </CardContent>
      </Card>
      
      <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription>
          Der Token-Typ kann nach dem Deployment nicht mehr geändert werden. Wähle daher sorgfältig aus.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TokenTypeSelectionStep;
