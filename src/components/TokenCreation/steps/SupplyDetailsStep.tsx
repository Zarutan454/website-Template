import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useTokenCreation } from '../context/TokenCreationContext.utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const SupplyDetailsStep: React.FC = () => {
  const { formData, updateFormField, handleFeaturesChange, errors } = useTokenCreation();

  const formatSupply = (value: string) => {
    // Nur Zahlen erlauben
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supply & Einstellungen</CardTitle>
          <CardDescription>
            Lege den anfänglichen und maximalen Token-Bestand sowie weitere Einstellungen fest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="initial-supply">Anfangsbestand</Label>
            <Input
              id="initial-supply"
              placeholder="1000000"
              value={formData.supply}
              onChange={(e) => updateFormField('supply', formatSupply(e.target.value))}
              className={errors?.supply ? 'border-red-500' : ''}
            />
            {errors?.supply && (
              <p className="text-sm text-red-500">{errors.supply}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Die anfängliche Menge an Tokens, die erstellt werden soll
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decimals">Dezimalstellen</Label>
            <div className="flex items-center space-x-3">
              <Slider
                id="decimals"
                min={0}
                max={18}
                step={1}
                value={[parseInt(formData.decimals || '18')]}
                onValueChange={(values) => updateFormField('decimals', values[0].toString())}
              />
              <div className="w-12 text-center font-medium">
                {formData.decimals}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Anzahl der Dezimalstellen für deinen Token (Standard: 18)
            </p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Token Features</h3>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="feature-mintable"
                checked={formData.features.mintable}
                onCheckedChange={(checked) => handleFeaturesChange('mintable', checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="feature-mintable"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Mintable (Nachprägen möglich)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Erlaubt das spätere Erstellen weiterer Tokens
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="feature-burnable"
                checked={formData.features.burnable}
                onCheckedChange={(checked) => handleFeaturesChange('burnable', checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="feature-burnable"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Burnable (Verbrennen möglich)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Erlaubt das dauerhafte Entfernen von Tokens aus dem Umlauf
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="feature-pausable"
                checked={formData.features.pausable}
                onCheckedChange={(checked) => handleFeaturesChange('pausable', checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="feature-pausable"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Pausable
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ermöglicht das temporäre Einfrieren aller Token-Transfers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription>
          Wähle einen angemessenen Anfangsbestand für dein Projekt. Die Features bestimmen, 
          welche Funktionen dein Token später unterstützt.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SupplyDetailsStep;
