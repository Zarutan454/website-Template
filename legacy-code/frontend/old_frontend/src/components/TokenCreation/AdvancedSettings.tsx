
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { HelpCircle, Flame, PauseCircle, Plus, Share2 } from 'lucide-react';

interface AdvancedSettingsProps {
  isBurnable: boolean;
  isPausable: boolean;
  isMintable: boolean;
  isShareable: boolean;
  onBurnableChange: (value: boolean) => void;
  onPausableChange: (value: boolean) => void;
  onMintableChange: (value: boolean) => void;
  onShareableChange: (value: boolean) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  isBurnable,
  isPausable,
  isMintable,
  isShareable,
  onBurnableChange,
  onPausableChange,
  onMintableChange,
  onShareableChange
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Erweiterte Einstellungen</h2>
      <p className="text-muted-foreground mb-6">
        Passe die erweiterten Funktionen deines Tokens an.
      </p>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full p-2">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <h4 className="font-medium mr-2">Burnable</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ermöglicht das Verbrennen (Burning) von Tokens, um die Gesamtmenge zu reduzieren.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">Tokens können permanent zerstört werden</p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="burnable"
                    checked={isBurnable}
                    onCheckedChange={onBurnableChange}
                  />
                  <Label htmlFor="burnable">
                    {isBurnable ? 'Aktiviert' : 'Deaktiviert'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full p-2">
                <PauseCircle className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <h4 className="font-medium mr-2">Pausable</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ermöglicht das temporäre Pausieren aller Transaktionen im Token-Contract.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">Transfers können pausiert werden</p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="pausable"
                    checked={isPausable}
                    onCheckedChange={onPausableChange}
                  />
                  <Label htmlFor="pausable">
                    {isPausable ? 'Aktiviert' : 'Deaktiviert'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full p-2">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <h4 className="font-medium mr-2">Mintable</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ermöglicht das Erstellen (Minting) weiterer Tokens durch den Owner.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">Neue Tokens können erstellt werden</p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="mintable"
                    checked={isMintable}
                    onCheckedChange={onMintableChange}
                  />
                  <Label htmlFor="mintable">
                    {isMintable ? 'Aktiviert' : 'Deaktiviert'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full p-2">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <h4 className="font-medium mr-2">Shareable</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ermöglicht das einfache Teilen des Tokens in sozialen Medien.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">Automatische Social-Media-Integration</p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="shareable"
                    checked={isShareable}
                    onCheckedChange={onShareableChange}
                  />
                  <Label htmlFor="shareable">
                    {isShareable ? 'Aktiviert' : 'Deaktiviert'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-md text-sm">
          <h4 className="font-medium mb-2">Sicherheitshinweis:</h4>
          <p className="text-muted-foreground">
            Die Funktionen "Mintable" und "Burnable" geben dem Token-Owner weitreichende Kontrolle über den Token.
            Dies kann für Anwendungen wie Governance oder dynamische Token-Versorgung sinnvoll sein,
            könnte aber auch das Vertrauen der Community beeinflussen.
          </p>
        </div>
      </div>
    </div>
  );
};
