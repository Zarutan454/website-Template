
import React, { useState } from 'react';
import { useProfileMedia } from '@/hooks/useProfileMedia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import MediaLightbox from './MediaLightbox';
import { Media } from '@/types/media';

interface MediaGalleryProps {
  userId: string;
  isOwnProfile: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ userId, isOwnProfile }) => {
  const { media, isLoading, refreshMedia } = useProfileMedia(userId, 'media', isOwnProfile);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(-1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedMediaIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateMedia = (index: number) => {
    setSelectedMediaIndex(index);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    );
  }

  if (!media || media.length === 0) {
    return (
      <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Keine Medien</h3>
          <p className="text-sm text-gray-400 mb-4">
            {isOwnProfile
              ? 'Du hast noch keine Medien geteilt.'
              : 'Dieser Benutzer hat noch keine Medien geteilt.'}
          </p>
          {isOwnProfile && (
            <Button className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Medien hinzufügen
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Konvertiere die importierten Media-Objekte in das richtige Format für die MediaLightbox-Komponente
  const mediaForLightbox: Media[] = media.map(item => ({
    id: item.id,
    url: item.url || '',
    type: item.type || 'image',
    title: item.title,
    description: item.description,
    createdAt: item.createdAt || item.created_at,
    authorId: item.authorId
  }));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map((item, index) => (
          <div 
            key={item.id} 
            className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(index)}
          >
            <img 
              src={item.url || item.media_url} 
              alt={item.title || `Bild ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {lightboxOpen && selectedMediaIndex >= 0 && (
        <MediaLightbox
          media={mediaForLightbox}
          currentIndex={selectedMediaIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          onNavigate={navigateMedia}
        />
      )}
    </div>
  );
};

export default MediaGallery;
