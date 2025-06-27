
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import TokenCard from './TokenCard';
import { Token } from '@/types/token';
import { useNavigate } from 'react-router-dom';

interface TokenShareModalProps {
  token: Token | null;
  isOpen: boolean;
  onClose: () => void;
}

const TokenShareModal: React.FC<TokenShareModalProps> = ({ token, isOpen, onClose }) => {
  const [comment, setComment] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const navigate = useNavigate();

  const handleShare = async () => {
    if (!token) return;

    setIsSharing(true);
    
    try {
      // Hier würde in einer echten Implementierung der API-Call erfolgen
      // const response = await createPost({ tokenId: token.id, content: comment });
      
      // Simulierte Verzögerung von 1 Sekunde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Dein Token wurde im Feed geteilt!");
      setComment('');
      onClose();
      
      // Optional: Zum Feed navigieren
      navigate('/feed/recent');
    } catch (error) {
      toast.error("Es ist ein Fehler beim Teilen aufgetreten.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-100 text-white border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Token im Feed teilen</DialogTitle>
          <DialogDescription>
            Teile deinen Token mit der Community und erhalte Feedback!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <TokenCard token={token} isInFeed={false} />
          
          <div className="mt-4">
            <Textarea
              placeholder="Schreibe einen Kommentar zu deinem Token..."
              className="bg-dark-200 border-gray-700 text-white resize-none"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSharing}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={isSharing}
            className="bg-primary hover:bg-primary/90"
          >
            {isSharing ? 'Wird geteilt...' : 'Im Feed teilen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenShareModal;
