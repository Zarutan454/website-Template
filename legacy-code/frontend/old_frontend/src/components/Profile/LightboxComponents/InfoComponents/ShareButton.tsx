
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Link, Mail, Twitter, Facebook, Copy, Check, Linkedin } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: 'outline' | 'ghost';
  size?: 'sm' | 'default';
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  url, 
  title, 
  text,
  className,
  variant = 'outline',
  size = 'sm'
}) => {
  const [copying, setCopying] = useState(false);
  const [sharing, setSharing] = useState(false);
  
  const shareText = title ? `${title} | BSN` : 'Medien auf BSN';
  
  const handleCopyLink = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(url);
      toast.success('Link in die Zwischenablage kopiert');
    } catch (error) {
      toast.error('Fehler beim Kopieren des Links');
    } finally {
      setCopying(false);
    }
  };
  
  const handleShare = async (type: 'twitter' | 'facebook' | 'linkedin' | 'mail' | 'native') => {
    try {
      setSharing(true);
      
      if (type === 'native' && navigator.share) {
        await navigator.share({
          title: shareText,
          text: text || shareText,
          url: url
        });
        return;
      }
      
      switch (type) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'mail':
          window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(text || '')}%0A%0A${encodeURIComponent(url)}`);
          break;
      }
    } catch (error) {
      toast.error('Fehler beim Teilen');
    } finally {
      setSharing(false);
    }
  };
  
  const canUseNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex items-center gap-2">
      {canUseNativeShare ? (
        <Button 
          variant={variant} 
          size={size}
          className={cn("flex items-center gap-2", className)}
          onClick={() => handleShare('native')}
          disabled={sharing}
        >
          {sharing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          <span>Teilen</span>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={variant} 
              size={size}
              className={cn("flex items-center gap-2", className)}
            >
              <Share2 className="h-4 w-4" />
              <span>Teilen</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleCopyLink()} disabled={copying}>
              {copying ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Link kopieren
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('twitter')}>
              <Twitter className="mr-2 h-4 w-4" /> Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('facebook')}>
              <Facebook className="mr-2 h-4 w-4" /> Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('linkedin')}>
              <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('mail')}>
              <Mail className="mr-2 h-4 w-4" /> E-Mail
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ShareButton;
