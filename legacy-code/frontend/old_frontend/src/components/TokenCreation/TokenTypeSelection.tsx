
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TokenTypeOption } from './types/unified';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface TokenTypeSelectionProps {
  tokenTypes: TokenTypeOption[];
  selectedTokenType: string;
  onSelect: (tokenTypeId: string) => void;
}

const TokenTypeSelection: React.FC<TokenTypeSelectionProps> = ({ 
  tokenTypes, 
  selectedTokenType, 
  onSelect 
}) => {
  return (
    <div className="space-y-4">
      <RadioGroup 
        value={selectedTokenType} 
        onValueChange={onSelect}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {tokenTypes.map((tokenType) => {
          const IconComponent = tokenType.icon;
          
          return (
            <div key={tokenType.id} className="relative">
              <RadioGroupItem 
                value={tokenType.id} 
                id={`token-type-${tokenType.id}`} 
                className="peer sr-only" 
              />
              <Label 
                htmlFor={`token-type-${tokenType.id}`}
                className="block cursor-pointer"
              >
                <Card className="border-2 peer-data-[state=checked]:border-primary transition-all peer-data-[state=checked]:shadow-md hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full space-y-4">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">{tokenType.title}</h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground flex-grow">
                        {tokenType.description}
                      </p>
                      
                      <div className="pt-4 border-t">
                        <h4 className="text-xs font-medium mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {tokenType.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Badge className="self-start" variant="secondary">
                        {typeof tokenType.complexity === 'string' && 
                          (tokenType.complexity === 'beginner' ? 'Einfach' : 
                           tokenType.complexity === 'intermediate' ? 'Mittel' : 
                           tokenType.complexity === 'advanced' ? 'Komplex' : 
                           tokenType.complexity)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default TokenTypeSelection;
