
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface MediaGalleryProps {
  userId: string;
  previewMode?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ userId, previewMode = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fotos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>Foto-Galerie wird bald verfügbar sein</p>
          {previewMode && (
            <p className="text-sm mt-2">Vorschau-Modus aktiv</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaGallery;
