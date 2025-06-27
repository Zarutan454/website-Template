
import React, { useState } from 'react';
import { X, Download, Info, Clock, Image, MapPin, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Media } from '@/types/media';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  MediaPreviewSection, 
  MediaInfoSection,
} from './InfoComponents';
import ShareButton from './InfoComponents/ShareButton';

interface InfoOverlayProps {
  media: Media;
  isVisible: boolean;
  onClose: () => void;
  onDownload: () => Promise<void>;
  className?: string;
  overlayClassName?: string;
}

const InfoOverlay: React.FC<InfoOverlayProps> = ({
  media,
  isVisible,
  onClose,
  onDownload,
  className,
  overlayClassName
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const creationDate = media.createdAt || media.created_at;
  const metadata = media.metadata || {};

  const handleDownload = async () => {
    try {
      setDownloadProgress(0);
      await onDownload();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadProgress(null);
    }
  };

  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col overflow-auto",
          overlayClassName
        )}
      >
        <div className="sticky top-0 z-40 w-full">
          <div className="flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent p-4">
            <h2 className="text-white text-lg font-semibold">Medieninformationen</h2>
            <div className="flex space-x-2">
              <ShareButton 
                url={media.url} 
                title={media.title}
                className="hover:bg-white/20"
              />
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20" 
                onClick={handleDownload}
                disabled={downloadProgress !== null}
                aria-label="Download media"
              >
                {downloadProgress !== null ? (
                  <div className="flex items-center">
                    <div className="relative h-4 w-4 mr-2">
                      <div 
                        className="absolute inset-0 rounded-full border border-white"
                        style={{
                          background: `conic-gradient(white ${downloadProgress * 100}%, transparent 0)`
                        }}
                      />
                    </div>
                    Downloading...
                  </div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Herunterladen
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20" 
                onClick={onClose}
                aria-label="Close info overlay"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className={cn("flex-1 overflow-auto p-4 md:p-6 space-y-6", className)}>
          <MediaPreviewSection media={media} />
          <MediaInfoSection media={media} />
          
          {creationDate && (
            <div className="text-white/80 text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2 opacity-70" />
              Hochgeladen am {format(new Date(creationDate), 'dd.MM.yyyy HH:mm')}
            </div>
          )}
          
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="bg-black/30 rounded-lg p-4 mt-4">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                EXIF Metadaten
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/80">
                {metadata.cameraMake && (
                  <div className="flex">
                    <span className="w-32 font-medium">Kamera:</span>
                    <span>{metadata.cameraMake} {metadata.cameraModel}</span>
                  </div>
                )}
                {metadata.exposureTime && (
                  <div className="flex">
                    <span className="w-32 font-medium">Belichtung:</span>
                    <span>{metadata.exposureTime}s</span>
                  </div>
                )}
                {metadata.fNumber && (
                  <div className="flex">
                    <span className="w-32 font-medium">Blende:</span>
                    <span>f/{metadata.fNumber}</span>
                  </div>
                )}
                {metadata.iso && (
                  <div className="flex">
                    <span className="w-32 font-medium">ISO:</span>
                    <span>{metadata.iso}</span>
                  </div>
                )}
                {metadata.focalLength && (
                  <div className="flex">
                    <span className="w-32 font-medium">Brennweite:</span>
                    <span>{metadata.focalLength}mm</span>
                  </div>
                )}
                {metadata.location && (
                  <div className="flex">
                    <span className="w-32 font-medium">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      Standort:
                    </span>
                    <span>
                      {metadata.location.latitude}, {metadata.location.longitude}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoOverlay;
