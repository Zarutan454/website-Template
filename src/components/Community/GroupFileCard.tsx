import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';

interface GroupFileCardProps {
  file: {
    id: string;
    file_name: string;
    file_size: number;
    sender?: {
      id: string;
      username: string;
      display_name?: string;
      avatar_url?: string;
    };
    created_at?: string;
    download_url: string;
  };
  isAdmin?: boolean;
  onDelete?: (fileId: string) => void;
}

const GroupFileCard: React.FC<GroupFileCardProps> = ({ file, isAdmin, onDelete }) => {
  const { id, file_name, file_size, sender, created_at, download_url } = file;
  // Entferne das Logging für children, da GroupFileCard keine dynamischen Children rendert.
  return (
    <div className="rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors duration-200 shadow-sm p-3 flex items-center gap-3"
      aria-label={`Datei: ${file_name}`}
    >
      <div className="flex-1 min-w-0">
        <a href={download_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline truncate flex items-center gap-2"
          aria-label={`Datei herunterladen: ${file_name}`}
        >
          <Download className="h-4 w-4" />
          {file_name}
        </a>
        <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
          <span>{(file_size / 1024).toFixed(1)} KB</span>
          {sender && (
            <>
              <span>•</span>
              <Avatar className="h-5 w-5">
                <AvatarImage src={sender.avatar_url} alt={sender.display_name || sender.username} />
                <AvatarFallback>{sender.display_name?.charAt(0) || sender.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{sender.display_name || sender.username}</span>
            </>
          )}
          {created_at && <span>• {new Date(created_at).toLocaleDateString('de-DE')}</span>}
        </div>
      </div>
      {isAdmin && (
        <Button size="icon" variant="ghost" title="Datei löschen" aria-label={`Datei löschen: ${file_name}`} onClick={() => onDelete?.(id)}>
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      )}
    </div>
  );
};

export default GroupFileCard; 