
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PostReport from './PostReport';

interface PostReportDialogProps {
  postId: string;
  buttonLabel?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

const PostReportDialog: React.FC<PostReportDialogProps> = ({
  postId,
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
        <PostReport 
          postId={postId} 
          onComplete={() => setOpen(false)} 
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PostReportDialog;
