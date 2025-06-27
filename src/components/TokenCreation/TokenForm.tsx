
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTokenCreation } from "./hooks/useTokenCreation";

// Update the form schema to match TokenFormData
const formSchema = z.object({
  name: z.string().min(1, "Token name is required"),
  symbol: z.string().min(1, "Token symbol is required").max(6, "Symbol must be 6 characters or less"),
  supply: z.string().min(1, "Initial supply is required"),
  decimals: z.string().min(1, "Decimals is required"),
  network: z.string().min(1, "Network is required"),
  tokenType: z.string().min(1, "Token type is required"),
  features: z.object({
    mintable: z.boolean().optional(),
    burnable: z.boolean().optional(),
    pausable: z.boolean().optional(),
    shareable: z.boolean().optional(),
  }).optional(),
  description: z.string().optional(),
  maxTransactionLimit: z.string().optional(),
  maxWalletLimit: z.string().optional(),
  maxSupply: z.string().optional(),
  lockupTime: z.string().optional(),
  marketingWallet: z.string().optional(),
  buyTax: z.string().optional(),
  sellTax: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TokenForm: React.FC = () => {
  const { 
    deployTokenContract, 
    handleInputChange, 
    handleFeaturesChange 
  } = useTokenCreation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      supply: "1000000",
      decimals: "18",
      network: "ethereum",
      tokenType: "standard",
      features: {
        mintable: true,
        burnable: true,
        pausable: false,
        shareable: false,
      },
    },
  });

  const { handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: FormValues) => {
    // Handle the form submission
    await deployTokenContract();
  };

  // Update the useTokenCreation hook state whenever form fields change
  const handleFormChange = (field: keyof FormValues, value: any) => {
    form.setValue(field, value);
    handleInputChange(field, value);
  };

  // Update features in the useTokenCreation hook
  const handleFeatureChange = (feature: string, value: boolean) => {
    form.setValue(`features.${feature}` as any, value);
    handleFeaturesChange(feature, value);
  };

  const requiredFields = ["symbol", "name", "decimals", "supply"];

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="My Token" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleFormChange("name", e.target.value);
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Symbol</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="TKN" 
                    maxLength={6} 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFormChange("symbol", e.target.value);
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supply"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Supply</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="1000000" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFormChange("supply", e.target.value);
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="decimals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decimals</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="18" 
                    min="0" 
                    max="18" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFormChange("decimals", e.target.value);
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="features.mintable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleFeatureChange("mintable", checked as boolean);
                    }} 
                  />
                </FormControl>
                <FormLabel>Mintable - Allow creating new tokens after deployment</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="features.burnable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleFeatureChange("burnable", checked as boolean);
                    }} 
                  />
                </FormControl>
                <FormLabel>Burnable - Allow destroying tokens to reduce supply</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="features.pausable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleFeatureChange("pausable", checked as boolean);
                    }} 
                  />
                </FormControl>
                <FormLabel>Pausable - Allow pausing all token transfers in emergencies</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Deploy Token</Button>
      </form>
    </Form>
  );
};

export default TokenForm;
