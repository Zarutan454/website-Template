
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import NFTReport from './NFTReport';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NFTReportDialogProps {
  nftId: string;
  buttonLabel?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

const NFTReportDialog: React.FC<NFTReportDialogProps> = ({
  nftId,
  buttonLabel = 'Melden',
  showIcon = true,
  variant = 'ghost',
  className,
  buttonSize = 'sm'
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={buttonSize}
          className={cn("gap-1", className)}
        >
          {showIcon && <Flag className="h-4 w-4" />}
          {buttonLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <NFTReport 
          nftId={nftId} 
          onComplete={() => setOpen(false)} 
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NFTReportDialog;
