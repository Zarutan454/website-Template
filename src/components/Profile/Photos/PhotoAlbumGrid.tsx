import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getAlbums, Album } from '@/api/albums';
import { useNavigate } from 'react-router-dom';
import { CreateAlbumDialog } from './CreateAlbumDialog';
import { createAlbum } from '@/api/albums';

interface PhotoAlbumGridProps {
  isOwnProfile: boolean;
}

const PhotoAlbumGrid: React.FC<PhotoAlbumGridProps> = ({ isOwnProfile }) => {
  const { user: profile } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAlbums();
        if (Array.isArray(data)) {
          setAlbums(data);
        } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: unknown }).results)) {
          setAlbums((data as { results: Album[] }).results);
        } else {
          setAlbums([]);
        }
      } catch (e) {
        setError('Fehler beim Laden der Alben');
        toast.error('Fehler beim Laden der Alben');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  const handleCreateAlbum = () => {
    setShowCreateDialog(true);
  };

  const handleCreateAlbumSubmit = async ({ title, description }: { title: string; description: string }) => {
    try {
      const newAlbum = await createAlbum({ name: title, description });
      setAlbums((prev) => [newAlbum, ...prev]);
      toast.success('Album erfolgreich erstellt');
      return true;
    } catch (e: unknown) {
      let errorMsg = 'Fehler beim Erstellen des Albums';
      if (typeof e === 'object' && e && 'response' in e) {
        const err = e as { response?: { data?: { name?: string[] } } };
        if (err.response?.data?.name?.[0]) {
          errorMsg = err.response.data.name[0];
        }
      }
      toast.error(errorMsg);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Foto-Alben</h2>
          {isOwnProfile && (
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Plus className="h-4 w-4 mr-2" />
              Neues Album
            </Button>
          )}
        </div>
        <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 text-center animate-pulse">
          <Image className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">Lade Alben...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Foto-Alben</h2>
          {isOwnProfile && (
            <Button onClick={handleCreateAlbum}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Album
            </Button>
          )}
        </div>
        <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">{error}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Foto-Alben</h2>
        {isOwnProfile && (
          <Button onClick={handleCreateAlbum}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Album
          </Button>
        )}
      </div>
      <CreateAlbumDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateAlbumSubmit}
      />
      {albums.length === 0 ? (
        <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 text-center">
          <Image className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">Noch keine Alben vorhanden</h3>
          <p className="text-gray-400 text-sm">Lege dein erstes Album an!</p>
          {isOwnProfile && (
            <Button className="mt-4" onClick={handleCreateAlbum}>
              <Plus className="h-4 w-4 mr-2" />
              Jetzt Album erstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Card key={album.id} className="cursor-pointer hover:border-primary-500 transition" onClick={() => navigate(`/albums/${album.id}`)}>
              <CardHeader>
                <CardTitle className="truncate">{album.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm truncate mb-2">{album.description || 'Kein Beschreibungstext'}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{album.photos.length} Fotos</span>
                  <span>·</span>
                  <span>{album.privacy === 'public' ? 'Öffentlich' : album.privacy === 'friends' ? 'Nur Freunde' : 'Privat'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoAlbumGrid;
