
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink, Copy, Check, Share2 } from "lucide-react";
import NetworkIcon from "../NetworkIcon";
import { TokenVerification } from "@/wallet/components/TokenVerification";
import { getExplorerUrl, getFullExplorerUrl } from '@/services/explorer/explorerUrlService';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ethers } from 'ethers';

interface SuccessStepProps {
  contractAddress: string;
  network: string;
  tokenName: string;
  tokenSymbol: string;
  constructorArgs: any[];
}

const DeploymentSuccess: React.FC<SuccessStepProps> = ({
  contractAddress,
  network,
  tokenName,
  tokenSymbol,
  constructorArgs
}) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isLinkCopied, setIsLinkCopied] = React.useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(contractAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyLinkClick = () => {
    const explorerUrl = getFullExplorerUrl(network, 'address', contractAddress);
    navigator.clipboard.writeText(explorerUrl);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const explorerUrl = getFullExplorerUrl(network, 'address', contractAddress);

  // Format constructor args for the verification component
  const formattedConstructorArgs = constructorArgs.map(arg => {
    // If the argument is a BigNumber or looks like one, format it properly
    if (typeof arg === 'object' && arg._hex) {
      return ethers.formatUnits(arg, 0);
    }
    return arg;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Deployment Successful!</CardTitle>
              <CardDescription>
                Your token is now live on the blockchain
              </CardDescription>
            </div>
            <Badge className="ml-2 bg-green-500 hover:bg-green-600">Deployed</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center space-x-4 p-3 bg-card border rounded-md">
            <NetworkIcon network={network} size={36} className="flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{tokenName}</h3>
              <p className="text-sm text-muted-foreground">
                {tokenSymbol} • {network.charAt(0).toUpperCase() + network.slice(1)}
              </p>
            </div>
          </div>

          <div className="p-4 border rounded-md space-y-2 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Contract Address:</p>
              <Button variant="ghost" size="sm" onClick={handleCopyClick} disabled={isCopied} className="h-8">
                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-xs font-mono break-all border p-2 rounded bg-background">{contractAddress}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <NetworkIcon network={network} size={20} className="mr-2" />
                <span className="text-sm">View on Explorer</span>
              </div>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleCopyLinkClick} className="h-8 w-8">
                        {isLinkCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isLinkCopied ? "Link copied!" : "Copy link"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <Separator />
          
          <TokenVerification 
            contractAddress={contractAddress}
            network={network}
            constructorArgs={formattedConstructorArgs}
          />
        </CardContent>
      </Card>

      <Alert variant="default" className="bg-muted">
        <AlertDescription>
          Your token contract has been successfully deployed to the blockchain. You can now add it to your wallet, 
          verify the contract on the explorer, and start using it in your applications.
        </AlertDescription>
      </Alert>

      <div className="flex space-x-4 justify-center">
        <Button asChild variant="default">
          <a href="/wallet">Go to Wallet</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/create-token">Create Another Token</a>
        </Button>
      </div>
    </div>
  );
};

export default DeploymentSuccess;
