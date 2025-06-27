import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Copy, Mail, Facebook, Twitter, Send, Share2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title?: string;
}

const socialLinks = [
  {
    name: 'WhatsApp',
    icon: <Send className="w-5 h-5 text-green-500" />,
    getUrl: (url: string) => `https://wa.me/?text=${encodeURIComponent(url)}`
  },
  {
    name: 'Telegram',
    icon: <Send className="w-5 h-5 text-blue-400" />,
    getUrl: (url: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}`
  },
  {
    name: 'Twitter',
    icon: <Twitter className="w-5 h-5 text-blue-400" />,
    getUrl: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`
  },
  {
    name: 'Facebook',
    icon: <Facebook className="w-5 h-5 text-blue-600" />,
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  {
    name: 'E-Mail',
    icon: <Mail className="w-5 h-5 text-gray-600" />,
    getUrl: (url: string) => `mailto:?subject=Schau%20dir%20diesen%20Beitrag%20an&body=${encodeURIComponent(url)}`
  },
];

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl, title }) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link in die Zwischenablage kopiert!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open ? onClose() : undefined}>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Teilen</DialogTitle>
          <DialogClose asChild>
            <button className="absolute right-2 top-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {socialLinks.map(link => (
            <a
              key={link.name}
              href={link.getUrl(shareUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => toast.success(`${link.name} geöffnet!`)}
            >
              {link.icon}
              <span>{link.name}</span>
            </a>
          ))}
          <button
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={handleCopy}
          >
            <Copy className="w-5 h-5 text-gray-500" />
            <span>Link kopieren</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal; 
