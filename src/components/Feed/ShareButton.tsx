import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Twitter, Facebook, Linkedin, Link, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ShareButtonProps {
  postId: number;
  postContent: string;
  postUrl?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

interface ShareData {
  platform: string;
  url: string;
  title: string;
  description: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  postId,
  postContent,
  postUrl,
  className = "",
  variant = "ghost",
  size = "sm"
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useAuth();

  // Generate share URL
  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const url = postUrl || `${baseUrl}/post/${postId}`;
    setShareUrl(url);
    return url;
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Link in Zwischenablage kopiert!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Fehler beim Kopieren des Links');
    }
  };

  // Share to social media
  const shareToSocial = (platform: string) => {
    const url = generateShareUrl();
    const title = 'Schau dir diesen Post an!';
    const description = postContent.length > 100 
      ? postContent.substring(0, 100) + '...' 
      : postContent;

    const shareData: ShareData = {
      platform,
      url,
      title,
      description
    };

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success(`Auf ${platform} geteilt!`);
  };

  // Native share API (if available)
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BSN Post',
          text: postContent,
          url: generateShareUrl(),
        });
        toast.success('Erfolgreich geteilt!');
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleShareClick = () => {
    generateShareUrl();
    nativeShare();
  };

  return (
    <>
      <Button
        onClick={handleShareClick}
        variant={variant}
        size={size}
        className={`gap-2 ${className}`}
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Teilen</span>
      </Button>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post teilen</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Share URL */}
            <div className="space-y-2">
              <Label htmlFor="share-url">Link zum Teilen</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="min-w-[80px]"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Kopiert
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Kopieren
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="space-y-3">
              <Label>Teilen auf Social Media</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => shareToSocial('twitter')}
                  variant="outline"
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <Twitter className="h-5 w-5 text-blue-500" />
                  <span className="text-xs">Twitter</span>
                </Button>
                
                <Button
                  onClick={() => shareToSocial('facebook')}
                  variant="outline"
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </Button>
                
                <Button
                  onClick={() => shareToSocial('linkedin')}
                  variant="outline"
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              </div>
            </div>

            {/* Direct Link */}
            <div className="space-y-2">
              <Label>Direkter Link</Label>
              <Button
                onClick={() => {
                  copyToClipboard();
                  setIsShareModalOpen(false);
                }}
                className="w-full"
                variant="outline"
              >
                <Link className="h-4 w-4 mr-2" />
                Link kopieren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton; 