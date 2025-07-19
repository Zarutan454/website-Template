import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ContentReportDialogProps {
  contentType: 'post' | 'comment' | 'user' | 'story';
  contentId: string | number;
  buttonLabel?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  onComplete?: () => void;
}

const REPORT_TYPES = {
  post: [
    { value: 'spam', label: 'Spam oder irreführender Inhalt' },
    { value: 'inappropriate', label: 'Unangemessener Inhalt' },
    { value: 'harassment', label: 'Belästigung oder Mobbing' },
    { value: 'violence', label: 'Gewalt oder gefährliche Inhalte' },
    { value: 'copyright', label: 'Urheberrechtsverletzung' },
    { value: 'fake_news', label: 'Fake News oder Desinformation' },
    { value: 'other', label: 'Sonstiges' }
  ],
  comment: [
    { value: 'spam', label: 'Spam oder irreführender Inhalt' },
    { value: 'inappropriate', label: 'Unangemessener Inhalt' },
    { value: 'harassment', label: 'Belästigung oder Mobbing' },
    { value: 'violence', label: 'Gewalt oder gefährliche Inhalte' },
    { value: 'other', label: 'Sonstiges' }
  ],
  user: [
    { value: 'harassment', label: 'Belästigung oder Mobbing' },
    { value: 'spam', label: 'Spam-Account' },
    { value: 'fake', label: 'Fake-Account oder Identitätsdiebstahl' },
    { value: 'inappropriate', label: 'Unangemessener Inhalt' },
    { value: 'violence', label: 'Gewalt oder gefährliche Inhalte' },
    { value: 'other', label: 'Sonstiges' }
  ],
  story: [
    { value: 'inappropriate', label: 'Unangemessener Inhalt' },
    { value: 'harassment', label: 'Belästigung oder Mobbing' },
    { value: 'violence', label: 'Gewalt oder gefährliche Inhalte' },
    { value: 'spam', label: 'Spam oder irreführender Inhalt' },
    { value: 'other', label: 'Sonstiges' }
  ]
};

const ContentReportDialog: React.FC<ContentReportDialogProps> = ({
  contentType,
  contentId,
  buttonLabel = 'Melden',
  showIcon = true,
  variant = 'ghost',
  className,
  buttonSize = 'sm',
  onComplete
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportType, setReportType] = useState('spam');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Du musst angemeldet sein, um Content zu melden');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Bitte gib eine Beschreibung an');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/moderation/report-content/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getAccessToken()}`,
        },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          report_type: reportType,
          reason: reason.trim(),
          evidence: evidence.trim() ? { description: evidence.trim() } : {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Melden');
      }

      const result = await response.json();
      
      toast.success('Meldung wurde erfolgreich übermittelt');
      setOpen(false);
      setReason('');
      setEvidence('');
      setReportType('spam');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error reporting content:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Melden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'post': return 'Beitrag';
      case 'comment': return 'Kommentar';
      case 'user': return 'Benutzer';
      case 'story': return 'Story';
      default: return 'Inhalt';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isSubmitting) return; // Prevent closing while submitting
    setOpen(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
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
        <AlertDialogHeader>
          <AlertDialogTitle>{getContentTypeLabel()} melden</AlertDialogTitle>
          <AlertDialogDescription>
            Bitte gib an, warum du diesen {getContentTypeLabel().toLowerCase()} melden möchtest.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Grund der Meldung</Label>
              <RadioGroup value={reportType} onValueChange={setReportType}>
                {REPORT_TYPES[contentType].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Beschreibung</Label>
              <Textarea
                id="reason"
                placeholder="Bitte beschreibe das Problem genauer..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="evidence">Zusätzliche Informationen (optional)</Label>
              <Textarea
                id="evidence"
                placeholder="Links, Screenshots oder weitere Details..."
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          </div>
          
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={isSubmitting}>
              Abbrechen
            </AlertDialogCancel>
            <Button 
              type="submit" 
              disabled={isSubmitting || !reason.trim()} 
              className="gap-2"
              variant="destructive"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Wird gesendet...' : 'Melden'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ContentReportDialog; 