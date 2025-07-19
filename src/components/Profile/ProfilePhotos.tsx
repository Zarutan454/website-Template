import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { userAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';

interface Photo {
  id: number;
  media_url: string;
  caption?: string;
  created_at: string;
}

interface ProfilePhotosProps {
  userId: number;
  isOwnProfile?: boolean;
}

const ProfilePhotos: React.FC<ProfilePhotosProps> = ({ userId, isOwnProfile = false }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Type guard for error with message
  function hasMessage(error: unknown): error is { message: string } {
    return typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string';
  }

  const fetchPhotos = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getUserPhotos(userId, page);
      if (response.results) {
        setPhotos(response.results);
        setHasNextPage(!!response.next);
        setHasPrevPage(!!response.previous);
      } else {
        setPhotos([]);
        setHasNextPage(false);
        setHasPrevPage(false);
      }
    } catch (err: unknown) {
      console.error('Error fetching photos:', err);
      let message = '';
      if (hasMessage(err)) {
        message = err.message;
      }
      // Show 'Feature nicht verfügbar' only if endpoint is missing (real 404)
      if (message.includes('Not Found') || message.includes('404')) {
        setError('Foto-Feature ist noch nicht verfügbar');
        setPhotos([]);
        setHasNextPage(false);
        setHasPrevPage(false);
      } else {
        setError('Fehler beim Laden der Fotos');
        toast.error('Fotos konnten nicht geladen werden');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPhotos(currentPage);
  }, [userId, currentPage, fetchPhotos]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Fotos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Lade Fotos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Show error only for real errors, not for empty data
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Fotos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchPhotos(currentPage)} variant="outline">
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Fotos ({photos.length})
        </CardTitle>
        {isOwnProfile && (
          <Button onClick={() => {/* TODO: open upload dialog */}}>
            Foto hochladen
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {isOwnProfile ? 'Du hast noch keine Fotos hochgeladen' : 'Keine Fotos vorhanden'}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" onClick={() => {/* TODO: open upload dialog */}}>
                Jetzt Foto hochladen
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img
                    src={photo.media_url}
                    alt={photo.caption || 'Foto'}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-sm truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {(hasNextPage || hasPrevPage) && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Zurück
                </Button>
                <span className="text-sm text-muted-foreground">
                  Seite {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  Weiter
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePhotos; 