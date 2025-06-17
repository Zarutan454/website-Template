import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "../TokenForm";
import * as z from "zod";

interface TokenBasicFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  isDeploying: boolean;
}

export function TokenBasicFields({ form, isDeploying }: TokenBasicFieldsProps) {
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("logo", file);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Token Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          className="w-full"
          placeholder="Enter token name"
          disabled={isDeploying}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="symbol">Token Symbol</Label>
        <Input
          id="symbol"
          {...form.register("symbol")}
          className="w-full"
          placeholder="Enter token symbol (max 6 characters)"
          disabled={isDeploying}
        />
        {form.formState.errors.symbol && (
          <p className="text-sm text-red-500">{form.formState.errors.symbol.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          className="w-full"
          placeholder="Enter token description"
          disabled={isDeploying}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialSupply">Initial Supply</Label>
        <Input
          id="initialSupply"
          type="number"
          {...form.register("initialSupply")}
          className="w-full"
          placeholder="Enter initial supply"
          disabled={isDeploying}
        />
        {form.formState.errors.initialSupply && (
          <p className="text-sm text-red-500">{form.formState.errors.initialSupply.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="decimals">Decimals</Label>
        <Input
          id="decimals"
          type="number"
          {...form.register("decimals")}
          className="w-full"
          placeholder="Enter number of decimals"
          disabled={isDeploying}
        />
        {form.formState.errors.decimals && (
          <p className="text-sm text-red-500">{form.formState.errors.decimals.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Token Logo</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="w-full"
          disabled={isDeploying}
        />
        {form.formState.errors.logo && (
          <p className="text-sm text-red-500">{form.formState.errors.logo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerAddress">Owner Address</Label>
        <Input
          id="ownerAddress"
          {...form.register("ownerAddress")}
          className="w-full"
          placeholder="Enter owner address (default: your wallet address)"
          disabled={isDeploying}
        />
        {form.formState.errors.ownerAddress && (
          <p className="text-sm text-red-500">{form.formState.errors.ownerAddress.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="network">Network</Label>
        <select
          id="network"
          {...form.register("network")}
          className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isDeploying}
        >
          <option value="holesky">Holesky Testnet</option>
          <option value="ethereum">Ethereum Mainnet</option>
          <option value="polygon">Polygon (MATIC)</option>
          <option value="bsc">BNB Smart Chain</option>
          <option value="avalanche">Avalanche</option>
          <option value="fantom">Fantom</option>
          <option value="arbitrum">Arbitrum One</option>
          <option value="optimism">Optimism</option>
          <option value="cronos">Cronos</option>
          <option value="klaytn">Klaytn</option>
          <option value="harmony">Harmony (ONE)</option>
          <option value="moonbeam">Moonbeam</option>
          <option value="celo">Celo</option>
        </select>
      </div>
    </>
  );
}