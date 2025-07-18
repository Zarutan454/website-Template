import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface GroupMedia {
  id: string;
  url: string;
  type: string; // 'image' | 'video'
  created_at?: string;
  author?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface GroupMediaCardProps {
  media: GroupMedia;
  onOpenLightbox?: (media: GroupMedia) => void;
}

const GroupMediaCard: React.FC<GroupMediaCardProps> = ({ media, onOpenLightbox }) => {
  const { url, type, created_at, author } = media;
  // Entferne das Logging für children, da GroupMediaCard keine dynamischen Children rendert.
  return (
    <div className="rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors duration-200 shadow-sm p-2 flex flex-col gap-2 relative" role="article" aria-label="Medienbeitrag" tabIndex={0}>
      <div className="relative w-full h-40 rounded overflow-hidden flex items-center justify-center bg-black">
        {type === 'image' ? (
          <img src={url} alt="Gruppenbild" aria-label="Gruppenbild" className="object-cover w-full h-full" />
        ) : (
          <video src={url} controls className="object-cover w-full h-full" aria-label="Gruppenvideo" />
        )}
        {onOpenLightbox && (
          <Button size="icon" variant="ghost" className="absolute top-2 right-2 bg-black/60 hover:bg-black/80" onClick={() => onOpenLightbox(media)} title="Vorschau" aria-label="Medienvorschau öffnen">
            <Eye className="h-5 w-5 text-white" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1">
        {author && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.avatar_url} alt={author.display_name || author.username} />
            <AvatarFallback>{author.display_name?.charAt(0) || author.username.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        {author && <span className="text-xs text-gray-300 truncate">{author.display_name || author.username}</span>}
        {created_at && <span className="ml-auto text-xs text-gray-400">{new Date(created_at).toLocaleDateString('de-DE')}</span>}
      </div>
    </div>
  );
};

export default GroupMediaCard; 