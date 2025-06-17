
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface NFTReportProps {
  nftId: string;
  onComplete: () => void;
}

const NFTReport: React.FC<NFTReportProps> = ({ nftId, onComplete }) => {
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('copyright');
  const [description, setDescription] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error('Du musst angemeldet sein, um ein NFT zu melden');
      return;
    }
    
    if (!description) {
      toast.error('Bitte gib eine Beschreibung an');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit report to backend
      const { error } = await (supabase as any)
        .from('nft_reports')
        .insert({
          user_id: profile.id,
          nft_id: nftId,
          reason,
          description
        });
      
      if (error) {
        throw error;
      }
      
      toast.success('NFT wurde erfolgreich gemeldet');
      onComplete();
    } catch (error) {
      toast.error('Fehler beim Melden des NFTs');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reasonOptions = [
    { value: 'copyright', label: 'Urheberrechtsverletzung' },
    { value: 'inappropriate', label: 'Unangemessener Inhalt' },
    { value: 'fraud', label: 'Betrug oder Scam' },
    { value: 'violence', label: 'Gewalt oder gefährliche Inhalte' },
    { value: 'other', label: 'Sonstiges' }
  ];
  
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>NFT melden</AlertDialogTitle>
        <AlertDialogDescription>
          Bitte gib an, warum du dieses NFT melden möchtest.
        </AlertDialogDescription>
      </AlertDialogHeader>
      
      <form onSubmit={handleSubmit} className="py-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Grund der Meldung</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reasonOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              placeholder="Bitte beschreibe das Problem genauer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <AlertDialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onComplete}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting || !description} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Wird gesendet...' : 'Melden'}
          </Button>
        </AlertDialogFooter>
      </form>
    </>
  );
};

export default NFTReport;
