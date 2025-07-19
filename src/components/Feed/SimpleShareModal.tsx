import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { 
  Share2, 
  MessageCircle, 
  Send, 
  Twitter, 
  Facebook, 
  Mail, 
  Copy, 
  X,
  ExternalLink
} from 'lucide-react';

interface SimpleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  postTitle?: string;
  darkMode?: boolean;
}

const SimpleShareModal: React.FC<SimpleShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  postTitle = 'Teile diesen Beitrag',
  darkMode = true
}) => {
  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-6 w-6" />,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${postTitle} ${shareUrl}`)}`)
    },
    {
      name: 'Telegram',
      icon: <Send className="h-6 w-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postTitle)}`)
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-6 w-6" />,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(shareUrl)}`)
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-6 w-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)
    },
    {
      name: 'E-Mail',
      icon: <Mail className="h-6 w-6" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => window.open(`mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(`Schau dir diesen Beitrag an: ${shareUrl}`)}`)
    },
    {
      name: 'Link kopieren',
      icon: <Copy className="h-6 w-6" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link wurde in die Zwischenablage kopiert!');
        } catch (error) {
          console.error('Fehler beim Kopieren:', error);
          toast.error('Fehler beim Kopieren des Links');
        }
      }
    }
  ];

  const handleShare = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md rounded-2xl shadow-2xl border-0 p-0 overflow-hidden ${darkMode ? 'bg-dark-200' : 'bg-white'}`}> 
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 px-6 pt-5 pb-3 border-b border-gray-700/40">
          <DialogTitle className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}> 
            <Share2 className="inline h-5 w-5" /> Beitrag teilen
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`h-9 w-9 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} focus:ring-2 focus:ring-primary`}
            aria-label="Dialog schließen"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <div className="px-6 pt-4 pb-6 space-y-6">
          {/* Link kopieren prominent */}
          <div className="flex items-center gap-3 bg-black/10 dark:bg-white/10 rounded-xl p-3">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{postTitle}</p>
              <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{shareUrl}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  toast.success('Link wurde in die Zwischenablage kopiert!');
                } catch {
                  toast.error('Fehler beim Kopieren des Links');
                }
              }}
              className="h-10 w-10 rounded-full border-0 bg-primary/90 text-white hover:bg-primary focus:ring-2 focus:ring-primary"
              aria-label="Link kopieren"
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
          {/* Social Share Grid */}
          <div className="grid grid-cols-2 gap-4">
            {shareOptions.filter(opt => opt.name !== 'Link kopieren').map((option) => (
              <Button
                key={option.name}
                variant="outline"
                onClick={() => handleShare(option.action)}
                className={`h-auto p-4 flex flex-col items-center space-y-2 rounded-xl border-0 shadow-sm transition-all duration-150 focus:ring-2 focus:ring-primary ${darkMode ? 'bg-dark-100 hover:bg-dark-300' : 'bg-gray-50 hover:bg-gray-100'}`}
                aria-label={option.name}
              >
                <div className={`p-2 rounded-full ${option.color} text-white shadow-md`}>{option.icon}</div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{option.name}</span>
              </Button>
            ))}
          </div>
          {/* Info-Hinweis für Accessibility */}
          <div className="text-xs text-gray-400 text-center pt-2">Du kannst den Link kopieren oder direkt in sozialen Netzwerken teilen.</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleShareModal; 
