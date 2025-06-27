
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getExplorerUrl } from "@/wallet/services/verification/verificationService";

export interface ExplorerLinkProps {
  network: string;
  value: string;
  type: 'transaction' | 'address';
  label?: string;
  variant?: 'link' | 'button' | 'text';
  className?: string;
}

const ExplorerLink = ({ 
  network, 
  value, 
  type, 
  label,
  variant = 'link',
  className = ''
}: ExplorerLinkProps) => {
  const baseUrl = getExplorerUrl(network);
  const path = type === 'transaction' ? 'tx' : 'address';
  const url = `${baseUrl}/${path}/${value}`;
  const displayLabel = label || `View on Explorer`;

  if (variant === 'button') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={className}
        asChild
      >
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {displayLabel}
        </a>
      </Button>
    );
  }

  if (variant === 'text') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-primary inline-flex items-center ${className}`}
      >
        {displayLabel}
      </a>
    );
  }

  // Default link variant
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-primary hover:text-primary-dark underline inline-flex items-center ${className}`}
    >
      {displayLabel}
      <ExternalLink className="h-3.5 w-3.5 ml-1" />
    </a>
  );
};

export default ExplorerLink;
