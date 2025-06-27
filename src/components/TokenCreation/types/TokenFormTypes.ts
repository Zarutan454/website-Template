
import { z } from "zod";

// Define the TokenType enum
export type TokenType = 'standard' | 'business' | 'marketing' | 'custom';

// Define the form schema using zod
export const tokenFormSchema = z.object({
  network: z.string().min(1, "Network is required"),
  tokenType: z.string().min(1, "Token type is required"),
  name: z.string().min(1, "Token name is required").max(50, "Token name must not exceed 50 characters"),
  symbol: z.string().min(1, "Token symbol is required").max(6, "Token symbol must not exceed 6 characters"),
  decimals: z.string().default("18"),
  supply: z.string().min(1, "Initial supply is required"),
  features: z.object({
    mintable: z.boolean().default(false),
    burnable: z.boolean().default(false),
    pausable: z.boolean().default(false),
    shareable: z.boolean().default(false)
  }),
  description: z.string().optional(),
  maxTransactionLimit: z.string().optional(),
  maxWalletLimit: z.string().optional(),
  maxSupply: z.string().optional(),
  ownerAddress: z.string().optional(),
  buyTax: z.string().optional(),
  sellTax: z.string().optional(),
  marketingWallet: z.string().optional(),
  devWallet: z.string().optional(),
  charityWallet: z.string().optional(),
  logo: z.unknown().optional() // File upload
});

// Export the form type based on the schema
export type TokenFormValues = z.infer<typeof tokenFormSchema>;

// Define deployment status
export type DeploymentStatusType = 
  'not-started' | 
  'preparing' | 
  'deploying' | 
  'verifying' | 
  'completed' | 
  'failed';

// Define constructor arguments structure
export type TokenConstructorArgs = {
  name: string;
  symbol: string;
  initialSupply: string;
  decimals: string;
  owner: string;
  [key: string]: unknown; // Additional arguments based on token type
};
