
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageIcon, AlertCircle } from 'lucide-react';

export interface Photo {
  id: string;
  photo_url: string;
  caption?: string;
  created_at: string;
  post_id?: string;
  album_id?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  isOwnProfile: boolean;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, isOwnProfile }) => {
  if (!photos || photos.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {isOwnProfile 
            ? 'Du hast noch keine Fotos hochgeladen.' 
            : 'Dieser Benutzer hat noch keine Fotos hochgeladen.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map(photo => (
          <Card key={photo.id} className="overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity">
            <CardContent className="p-0 aspect-square">
              <div className="w-full h-full relative">
                <img 
                  src={photo.photo_url} 
                  alt={photo.caption || 'Foto'} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;
