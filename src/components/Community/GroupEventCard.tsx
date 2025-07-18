import * as React from 'react';
import { Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupEventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time?: string;
    location?: string;
    rsvp_status?: 'going' | 'interested' | 'declined' | null;
  };
  onRSVP?: (eventId: string, status: 'going' | 'interested' | 'declined') => void;
}

const statusLabel = {
  going: 'Zusagen',
  interested: 'Interessiert',
  declined: 'Abgelehnt',
};

const GroupEventCard: React.FC<GroupEventCardProps> = ({ event, onRSVP }) => {
  const { id, title, start_time, location, rsvp_status } = event;
  // Fallbacks für alle Felder
  const safeTitle = title || 'Unbenanntes Event';
  const safeStartTime = start_time ? new Date(start_time).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'Unbekannt';
  const safeLocation = location || 'Ort unbekannt';
  return (
    <div className="rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors duration-200 shadow-sm p-4 flex flex-col gap-2" aria-label={`Event: ${safeTitle}`} role="article" tabIndex={0}>
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="font-semibold text-white text-base truncate" aria-label="Eventtitel">{safeTitle}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span aria-label="Startzeit"><Clock className="h-3 w-3" aria-hidden="true" /> {safeStartTime}</span>
        {location && (
          <>
            <span className="mx-2">•</span>
            <MapPin className="h-3 w-3" aria-hidden="true" />
            <span aria-label="Ort">{safeLocation}</span>
          </>
        )}
      </div>
      {rsvp_status && (
        <div className="flex items-center gap-2 mt-1" aria-label={`Status: ${statusLabel[rsvp_status]}`}>
          <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
          <span className="text-xs text-green-400">{statusLabel[rsvp_status]}</span>
        </div>
      )}
      {onRSVP && (
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant={rsvp_status === 'going' ? 'default' : 'outline'} onClick={() => onRSVP(id, 'going')} aria-label="Event zusagen">Zusagen</Button>
          <Button size="sm" variant={rsvp_status === 'interested' ? 'default' : 'outline'} onClick={() => onRSVP(id, 'interested')} aria-label="Event interessiert">Interessiert</Button>
          <Button size="sm" variant={rsvp_status === 'declined' ? 'default' : 'outline'} onClick={() => onRSVP(id, 'declined')} aria-label="Event absagen">Absagen</Button>
        </div>
      )}
    </div>
  );
};

export default GroupEventCard; 