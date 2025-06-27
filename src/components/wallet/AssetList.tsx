import React, { useState } from 'react';
import { formatAddress, formatBalance } from '@/utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Wallet,
} from "lucide-react";
import { toast } from 'sonner';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  address: string;
  network: {
    name: string;
    icon: string;
    explorerUrl: string;
  };
}

interface AssetListProps {
  assets: Asset[];
  isLoading?: boolean;
}

const AssetList: React.FC<AssetListProps> = ({ assets, isLoading = false }) => {
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  
  const toggleExpand = (assetId: string) => {
    setExpandedAssetId(expandedAssetId === assetId ? null : assetId);
  };
  
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(message);
      },
      () => {
        toast.error("Fehler beim Kopieren");
      }
    );
  };
  
  if (isLoading) {
    return (
      <Card className="bg-dark-100 border-gray-800">
        <CardHeader>
          <CardTitle>Assets werden geladen...</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  if (!assets || assets.length === 0) {
    return (
      <Card className="bg-dark-100 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Keine Assets gefunden</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Du hast noch keine Assets in deiner Wallet. Kaufe oder transferiere Assets, um sie hier zu sehen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assets.map((asset) => (
        <Card key={asset.id} className="bg-dark-100 border-gray-800 transition-all">
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-lg">{asset.symbol.substring(0, 1)}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{asset.name}</h3>
                  <p className="text-sm text-gray-400">{formatBalance(asset.balance, asset.symbol)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleExpand(asset.id)}
                aria-label={expandedAssetId === asset.id ? "Collapse details" : "Expand details"}
              >
                {expandedAssetId === asset.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          
          {expandedAssetId === asset.id && (
            <CardContent className="pt-0 pb-4">
              <div className="space-y-3 border-t border-gray-800 mt-2 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Token Adresse:</span>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">
                      {formatAddress(asset.address)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(asset.address, "Adresse kopiert!")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <a
                      className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-700/50"
                      href={`${asset.network.explorerUrl}/address/${asset.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Netzwerk:</span>
                  <span className="text-sm">{asset.network.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button className="w-full">
                    <Wallet className="h-4 w-4 mr-2" />
                    Senden
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Explorer
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AssetList;
