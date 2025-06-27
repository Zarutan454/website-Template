
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TokenType } from '../types';

interface DetailsStepProps {
  form: any;
  initialSupply: string;
  selectedTokenType: TokenType;
  errors: any;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ form, selectedTokenType, errors }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Token Supply & Decimals</h2>
      <p className="text-muted-foreground mb-6">
        Set the initial supply for your token and the number of decimal places. Most tokens use 18 decimals like Ethereum.
      </p>

      <FormField
        control={form.control}
        name="supply"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Initial Supply</FormLabel>
            <FormControl>
              <Input type="text" placeholder="1000000" {...field} />
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
              <Input type="number" placeholder="18" min="0" max="18" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedTokenType === 'business' && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Advanced Token Limits</h3>
          
          <FormField
            control={form.control}
            name="maxTransactionLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Transaction Limit</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Optional - e.g., 10000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxWalletLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Wallet Limit</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Optional - e.g., 50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSupply"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Supply</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Optional - e.g., 1000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default DetailsStep;
