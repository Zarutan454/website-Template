import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "../TokenForm";
import * as z from "zod";

interface TokenAdvancedFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  isDeploying: boolean;
}

export function TokenAdvancedFields({ form, isDeploying }: TokenAdvancedFieldsProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-semibold">Advanced Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marketingWallet">Marketing Wallet</Label>
          <Input
            id="marketingWallet"
            {...form.register("marketingWallet")}
            placeholder="Enter marketing wallet address"
            disabled={isDeploying}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="charityWallet">Charity Wallet</Label>
          <Input
            id="charityWallet"
            {...form.register("charityWallet")}
            placeholder="Enter charity wallet address"
            disabled={isDeploying}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="devWallet">Dev Wallet</Label>
          <Input
            id="devWallet"
            {...form.register("devWallet")}
            placeholder="Enter dev wallet address"
            disabled={isDeploying}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxSupply">Max Supply</Label>
          <Input
            id="maxSupply"
            type="number"
            {...form.register("maxSupply")}
            placeholder="Enter max supply"
            disabled={isDeploying}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buyTax">Buy Tax (%)</Label>
          <Input
            id="buyTax"
            type="number"
            {...form.register("buyTax")}
            placeholder="Enter buy tax percentage"
            disabled={isDeploying}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sellTax">Sell Tax (%)</Label>
          <Input
            id="sellTax"
            type="number"
            {...form.register("sellTax")}
            placeholder="Enter sell tax percentage"
            disabled={isDeploying}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxTransactionLimit">Max Transaction Limit</Label>
          <Input
            id="maxTransactionLimit"
            type="number"
            {...form.register("maxTransactionLimit")}
            placeholder="Enter max transaction limit"
            disabled={isDeploying}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxWalletLimit">Max Wallet Limit</Label>
          <Input
            id="maxWalletLimit"
            type="number"
            {...form.register("maxWalletLimit")}
            placeholder="Enter max wallet limit"
            disabled={isDeploying}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lockupTime">Lockup Time (in seconds)</Label>
          <Input
            id="lockupTime"
            type="number"
            {...form.register("lockupTime")}
            placeholder="Enter lockup time in seconds"
            disabled={isDeploying}
          />
        </div>
      </div>
    </div>
  );
}