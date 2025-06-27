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
      <DialogContent className={`max-w-md ${darkMode ? 'bg-dark-200 border-gray-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Share2 className="inline h-5 w-5 mr-2" />
            Beitrag teilen
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`h-8 w-8 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share URL Preview */}
          <Card className={`${darkMode ? 'bg-dark-100 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {postTitle}
                  </p>
                  <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {shareUrl}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="h-8 w-8 ml-2 flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className={darkMode ? 'bg-gray-600' : 'bg-gray-200'} />

          {/* Share Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                onClick={() => handleShare(option.action)}
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                  darkMode 
                    ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500' 
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-full ${option.color} text-white`}>
                  {option.icon}
                </div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {option.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleShareModal; 
