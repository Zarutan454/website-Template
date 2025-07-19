import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.utils';
import { reportUser } from '../../hooks/useProfile';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertTriangle, Flag, X } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface ReportUserProps {
  userId: number;
  username: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam oder unangemessene Inhalte' },
  { value: 'harassment', label: 'Belästigung oder Mobbing' },
  { value: 'fake_account', label: 'Fake-Account oder Identitätsdiebstahl' },
  { value: 'inappropriate_content', label: 'Unangemessene oder schädliche Inhalte' },
  { value: 'violence', label: 'Gewalt oder Drohungen' },
  { value: 'copyright', label: 'Urheberrechtsverletzung' },
  { value: 'other', label: 'Andere Gründe' },
] as const;

export const ReportUser: React.FC<ReportUserProps> = ({ userId, username, onClose }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte wähle einen Grund aus",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Fehler",
        description: "Du musst angemeldet sein",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await reportUser(userId, reason, description);
      toast({
        title: "Erfolg",
        description: "Report erfolgreich eingereicht"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Report konnte nicht eingereicht werden",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-600" />
          Benutzer melden
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warnung */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Wichtiger Hinweis</p>
            <p className="text-xs mt-1">
              Reports werden von unserem Team überprüft. Falsche Reports können zu Konsequenzen führen.
            </p>
          </div>
        </div>

        {/* Benutzer-Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Du meldest: <span className="font-medium text-gray-900">@{username}</span>
          </p>
        </div>

        {/* Grund auswählen */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Grund für den Report *</label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Wähle einen Grund aus" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((reportReason) => (
                <SelectItem key={reportReason.value} value={reportReason.value}>
                  {reportReason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Beschreibung */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Zusätzliche Details (optional)
          </label>
          <Textarea
            placeholder="Beschreibe den Vorfall genauer..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {description.length}/500 Zeichen
          </p>
        </div>

        {/* Datenschutz-Hinweis */}
        <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
          <p className="font-medium mb-1">Datenschutz</p>
          <p>
            Deine Report-Daten werden vertraulich behandelt und nur zur Überprüfung verwendet. 
            Der gemeldete Benutzer erfährt nicht, wer ihn gemeldet hat.
          </p>
        </div>

        {/* Aktions-Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1"
          >
            {isSubmitting ? 'Wird eingereicht...' : 'Report einreichen'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 