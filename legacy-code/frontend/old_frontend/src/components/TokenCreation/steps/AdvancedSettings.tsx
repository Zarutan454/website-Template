
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdvancedSettingsProps {
  features: {
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
    shareable: boolean;
  };
  onChange: (features: any) => void;
  onBurnableChange: (burnable: boolean) => void;
  onPausableChange: (pausable: boolean) => void;
  onMintableChange: (mintable: boolean) => void;
  onShareableChange: (shareable: boolean) => void;
  onBack: () => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  features,
  onChange,
  onBurnableChange,
  onPausableChange,
  onMintableChange,
  onShareableChange,
  onBack
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(features);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Advanced Token Features</h2>
        <p className="text-muted-foreground">
          Configure additional functionality for your token
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Features</CardTitle>
          <CardDescription>
            Enable or disable additional token capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mintable">Mintable</Label>
                  <p className="text-sm text-muted-foreground">
                    Allows creating new tokens after deployment
                  </p>
                </div>
                <Switch
                  id="mintable"
                  checked={features.mintable}
                  onCheckedChange={onMintableChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="burnable">Burnable</Label>
                  <p className="text-sm text-muted-foreground">
                    Allows destroying tokens to reduce supply
                  </p>
                </div>
                <Switch
                  id="burnable"
                  checked={features.burnable}
                  onCheckedChange={onBurnableChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pausable">Pausable</Label>
                  <p className="text-sm text-muted-foreground">
                    Allows pausing all token transfers
                  </p>
                </div>
                <Switch
                  id="pausable"
                  checked={features.pausable}
                  onCheckedChange={onPausableChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="shareable">Permit</Label>
                  <p className="text-sm text-muted-foreground">
                    Enables gasless approvals (EIP-2612)
                  </p>
                </div>
                <Switch
                  id="shareable"
                  checked={features.shareable}
                  onCheckedChange={onShareableChange}
                />
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

export default AdvancedSettings;
