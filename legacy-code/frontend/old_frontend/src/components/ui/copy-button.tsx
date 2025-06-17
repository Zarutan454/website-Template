
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'default';
}

export const CopyButton = ({ 
  text, 
  className,
  variant = 'ghost',
  size = 'default'
}: CopyButtonProps) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={copyToClipboard}
      className={className}
      aria-label="Copy to clipboard"
    >
      {isCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};
