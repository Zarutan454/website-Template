
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gem, Shield, Zap } from "lucide-react";

interface TokenTypeSelectionProps {
  selectedTokenType: string;
  onSelect: (tokenType: string) => void;
  onBack: () => void;
}

export const TokenTypeSelection: React.FC<TokenTypeSelectionProps> = ({
  selectedTokenType,
  onSelect,
  onBack
}) => {
  const tokenTypes = [
    {
      id: 'standard',
      name: 'Standard Token',
      description: 'Basic ERC-20 token with transfer, approval, and balance tracking functionality',
      features: ['Transfer', 'Approve', 'Balance tracking'],
      icon: <Gem className="h-6 w-6 text-blue-500" />,
      recommendedFor: 'Basic token needs'
    },
    {
      id: 'business',
      name: 'Business Token',
      description: 'Advanced token with transaction limits, max wallet holding, and other business features',
      features: ['Max transaction limit', 'Max wallet holdings', 'Max supply cap'],
      icon: <Shield className="h-6 w-6 text-green-500" />,
      recommendedFor: 'Business applications'
    },
    {
      id: 'marketing',
      name: 'Marketing Token',
      description: 'Token with built-in buy/sell tax mechanisms and marketing/development wallet funding',
      features: ['Buy/Sell tax', 'Auto marketing fund', 'Auto dev fund'],
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      recommendedFor: 'Projects with marketing needs'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Select Token Type</h2>
        <p className="text-muted-foreground">
          Choose the type of token you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tokenTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all ${
              selectedTokenType === type.id 
                ? 'border-primary ring-2 ring-primary ring-opacity-50'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(type.id)}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="flex items-center">
                  {type.icon}
                  <span className="ml-2">{type.name}</span>
                </CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </div>
              <Badge variant={selectedTokenType === type.id ? "default" : "outline"}>
                {selectedTokenType === type.id ? 'Selected' : 'Select'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {type.features.map((feature, index) => (
                  <Badge key={index} variant="secondary">{feature}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Recommended for:</span> {type.recommendedFor}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Network Selection
        </Button>
      </div>
    </div>
  );
};

export default TokenTypeSelection;
