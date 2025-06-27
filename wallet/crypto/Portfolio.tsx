import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { formatNumber } from "@/utils/formatters";
import { ethers } from "ethers";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import React from 'react';

interface TokenBalance {
  symbol: string;
  balance: string;
  totalValue: number;
}

export const Portfolio = () => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false); // Änderung: Initial auf false
  const [balances, setBalances] = useState<TokenBalance[]>([]); // Leeres Array als Initialwert
  const [totalBalance, setTotalBalance] = useState(0); // Initial auf 0
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false);
      setBalances([]);
      setTotalBalance(0);
      return;
    }

    const fetchBalances = async () => {
      setIsLoading(true);
      try {
        // Get Etherscan API key
        const { data: { api_key } } = await axios.get('/api/user/api-key/').then(res => res.data);

        if (!api_key) {
          throw new Error('Failed to retrieve Etherscan API key');
        }

        // Fetch ETH balance from Etherscan
        const response = await fetch(
          `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${api_key}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch balance from Etherscan');
        }

        const data = await response.json();
        
        if (data.status !== "1") {
          throw new Error(data.message || 'Failed to fetch balance');
        }

        const ethBalance = ethers.formatEther(data.result);
        
        // Fetch ETH price from CoinGecko
        const ethPriceResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        
        if (!ethPriceResponse.ok) {
          throw new Error('Failed to fetch ETH price');
        }

        const ethPriceData = await ethPriceResponse.json();
        const ethPrice = ethPriceData.ethereum.usd;
        const ethValue = Number(ethBalance) * ethPrice;

        const newBalances = [{
          symbol: 'ETH',
          balance: Number(ethBalance).toFixed(4),
          totalValue: ethValue
        }];

        setBalances(newBalances);
        setTotalBalance(ethValue);
        setError(null);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load portfolio data';
        setError(errorMessage);
        toast({
          title: "Fehler beim Laden des Portfolios",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [address, isConnected, toast]);

  if (!isConnected) {
    return (
      <Card className="bg-white border border-gray-200 mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="mb-[20px] md:mb-[25px] flex items-center justify-between">
          <h5 className="mb-0 text-gray-900">Portfolio</h5>
        </div>
        <div className="text-center text-gray-600 py-8">
          Bitte verbinden Sie Ihre Wallet, um Ihr Portfolio anzuzeigen
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border border-gray-200 mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="mb-[20px] md:mb-[25px] flex items-center justify-between">
          <h5 className="mb-0 text-gray-900">Portfolio</h5>
        </div>
        <div className="text-center text-red-500">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="mb-[20px] md:mb-[25px] flex items-center justify-between">
        <h5 className="mb-0 text-gray-900">Portfolio</h5>
      </div>
      
      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="relative z-[1]">
          {totalBalance > 0 ? (
            <>
              <div className="flex items-center mb-[20px] md:mb-[28px]">
                <img src="/src/assets/images/icons/total-balance.svg" alt="total-balance" />
                <div className="ml-[10px]">
                  <span className="block uppercase text-gray-600">Total Balance</span>
                  <h4 className="mb-0 text-gray-900 font-semibold mt-[6px] text-[18px] md:text-[20px]">
                    {formatNumber(totalBalance)}
                    <span className="font-medium relative text-base ml-[3px] pl-[25px] text-success-100">
                      <TrendingUp className="absolute text-[20px] left-0 top-1/2 -translate-y-1/2" />
                    </span>
                  </h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="font-medium text-xs text-gray-600 text-left px-[14px] pb-[7px] whitespace-nowrap first:pl-0">Asset</th>
                      <th className="font-medium text-xs text-gray-600 text-center px-[14px] pb-[7px] whitespace-nowrap">Balance</th>
                      <th className="font-medium text-xs text-gray-600 text-right px-[14px] pb-[7px] whitespace-nowrap last:pr-0">Value (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((asset, index) => (
                      <tr key={index}>
                        <td className="font-medium text-gray-900 text-left whitespace-nowrap px-[14px] first:pl-0 py-[10px] border-b border-gray-100">
                          {asset.symbol}
                        </td>
                        <td className="font-medium text-gray-900 text-center whitespace-nowrap px-[14px] py-[10px] border-b border-gray-100">
                          {asset.balance} {asset.symbol}
                        </td>
                        <td className="font-medium text-gray-900 text-right whitespace-nowrap px-[14px] last:pr-0 py-[10px] border-b border-gray-100">
                          {formatNumber(asset.totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600 py-8">
              Keine Assets gefunden
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
