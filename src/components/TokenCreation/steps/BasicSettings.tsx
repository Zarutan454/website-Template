
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BasicSettingsProps {
  name: string;
  symbol: string;
  decimals: string;
  supply: string;
  onChange: (name: string, symbol: string, decimals: string, supply: string) => void;
  onNameChange: (name: string) => void;
  onSymbolChange: (symbol: string) => void;
  onDecimalsChange: (decimals: string) => void;
  onSupplyChange: (supply: string) => void;
  onBack: () => void;
}

export const BasicSettings: React.FC<BasicSettingsProps> = ({
  name,
  symbol,
  decimals,
  supply,
  onChange,
  onNameChange,
  onSymbolChange,
  onDecimalsChange,
  onSupplyChange,
  onBack
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(name, symbol, decimals, supply);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Basic Token Settings</h2>
        <p className="text-muted-foreground">
          Configure the essential properties of your token
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Information</CardTitle>
          <CardDescription>
            These details will be permanently stored on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Token Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. My Awesome Token"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    The full name of your token (e.g. "Ethereum")
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Token Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g. MAT"
                    value={symbol}
                    onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
                    required
                    maxLength={8}
                  />
                  <p className="text-sm text-muted-foreground">
                    The ticker symbol for your token (e.g. "ETH")
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimals">Decimals</Label>
                  <Input
                    id="decimals"
                    type="number"
                    placeholder="18"
                    min="0"
                    max="18"
                    value={decimals}
                    onChange={(e) => onDecimalsChange(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of decimal places (standard is 18)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supply">Initial Supply</Label>
                  <Input
                    id="supply"
                    type="text"
                    placeholder="1000000"
                    value={supply}
                    onChange={(e) => onSupplyChange(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    The initial amount of tokens to create
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" onClick={handleSubmit}>Continue</Button>
      </div>
    </div>
  );
};

export default BasicSettings;
