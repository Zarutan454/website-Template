import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Download, 
  ExternalLink, 
  Maximize2, 
  X 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogClose } from '../ui/dialog';

interface MessageAttachmentProps {
  url: string;
  name: string;
  type: string;
  size?: number;
  className?: string;
}

const MessageAttachment: React.FC<MessageAttachmentProps> = ({
  url,
  name,
  type,
  size,
  className = ''
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const fileType = type.split('/')[0];
  const fileExtension = name.split('.').pop()?.toLowerCase();
  
  const isImage = fileType === 'image';
  const isVideo = fileType === 'video';
  const isAudio = fileType === 'audio';
  const isPdf = fileExtension === 'pdf' || type === 'application/pdf';
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const renderIcon = () => {
    switch (fileType) {
      case 'image':
        return <ImageIcon size={20} />;
      case 'video':
        return <Film size={20} />;
      case 'audio':
        return <Music size={20} />;
      default:
        return <FileText size={20} />;
    }
  };
  
  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <img 
            src={url} 
            alt={name} 
            className="max-h-[200px] rounded-md object-cover" 
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Maximize2 className="text-white drop-shadow-md" />
          </div>
        </div>
      );
    }
    
    if (isVideo) {
      return (
        <div className="relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
          <video 
            src={url} 
            controls 
            className="max-h-[200px] w-full" 
          />
        </div>
      );
    }
    
    if (isAudio) {
      return (
        <div className="rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 p-2">
          <audio 
            src={url} 
            controls 
            className="w-full" 
          />
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-gray-100 dark:bg-gray-800">
        {renderIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:text-primary/80"
          onClick={(e) => e.stopPropagation()}
        >
          {isPdf ? <ExternalLink size={18} /> : <Download size={18} />}
        </a>
      </div>
    );
  };
  
  return (
    <>
      <div className={`mt-2 ${className}`}>
        {renderPreview()}
      </div>
      
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-0">
          <div className="relative">
            <DialogClose className="absolute top-2 right-2 z-10">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70">
                <X size={16} />
              </Button>
            </DialogClose>
            <img 
              src={url} 
              alt={name} 
              className="max-h-[80vh] max-w-full object-contain rounded-md" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageAttachment;
