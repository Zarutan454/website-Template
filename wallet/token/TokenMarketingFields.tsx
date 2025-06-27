import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "../TokenForm";
import * as z from "zod";

interface TokenMarketingFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  isDeploying: boolean;
}

export function TokenMarketingFields({ form, isDeploying }: TokenMarketingFieldsProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-semibold">Marketing Settings</h3>
      
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
    </div>
  );
}
