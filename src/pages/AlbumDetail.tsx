import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ImageIcon, Settings, Share2 } from 'lucide-react';
import { Media } from '@/types/media';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface Album {
  id: string;
  title: string;
  description?: string;
  cover_url: string;
  user_id: string;
  photo_count: number;
  created_at: string;
  updated_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

const AlbumDetail = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfile();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const isOwner = profile && album && profile.id === Number(album.user_id);
  
  useEffect(() => {
    const fetchAlbumDetails = async () => {
      if (!albumId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch album details with user information
        // TODO: Diese Seite muss auf Django-API migriert werden. Supabase-Logik wurde entfernt.
        // const { data: albumData, error: albumError } = await supabase
        //   .from('photo_albums')
        //   .select(`
        //     *,
        //     users:user_id (
        //       username,
        //       display_name,
        //       avatar_url
        //     )
        //   `)
        //   .eq('id', albumId)
        //   .single();
        
        // if (albumError) throw albumError;
        
        // if (albumData) {
        //   // Transform album data to include user details
        //   const formattedAlbum: Album = {
        //     ...albumData,
        //     username: albumData.users?.username,
        //     display_name: albumData.users?.display_name,
        //     avatar_url: albumData.users?.avatar_url
        //   };
          
        //   setAlbum(formattedAlbum);
          
        //   // Fetch all photos in this album
        //   const { data: photosData, error: photosError } = await supabase
        //     .from('album_photos')
        //     .select('*')
        //     .eq('album_id', albumId)
        //     .order('created_at', { ascending: false });
          
        //   if (photosError) throw photosError;
          
        //   if (photosData) {
        //     // Transform into Media format
        //     const mediaItems: Media[] = photosData.map(photo => ({
        //       id: photo.id,
        //       url: photo.photo_url,
        //       type: photo.photo_type || 'image',
        //       title: photo.caption || undefined,
        //       createdAt: photo.created_at
        //     }));
            
        //     setMedia(mediaItems);
        //   }
        // }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load album');
        toast({
          title: 'Fehler',
          description: 'Das Album konnte nicht geladen werden.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlbumDetails();
  }, [albumId, toast]);
  
  const handleMediaClick = (id: string) => {
    // For now, we're just opening the lightbox in MediaGridTab
  };
  
  const handleShareAlbum = async () => {
    try {
      const url = `${window.location.origin}/album/${albumId}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link kopiert',
        description: 'Der Album-Link wurde in die Zwischenablage kopiert.',
      });
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Der Link konnte nicht kopiert werden.',
        variant: 'destructive'
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-dark-100 animate-pulse" />
            <div className="h-6 w-40 bg-dark-100 animate-pulse rounded" />
          </div>
          <div className="h-96 w-full mt-6 bg-dark-100 animate-pulse rounded-md" />
        </div>
      </div>
    );
  }
  
  if (error || !album) {
    return (
      <div className="min-h-screen bg-dark-200 p-4">
        <div className="max-w-6xl mx-auto text-center py-12">
          <ImageIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">Album nicht gefunden</h2>
          <p className="text-gray-400 mb-6">Das angeforderte Album existiert nicht oder Sie haben keine Berechtigung, es anzuzeigen.</p>
          <Button asChild>
            <Link to="/feed">Zurück zur Startseite</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-200">
      <div className="container mx-auto p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild className="mr-2">
                <Link to={`/profile/${album.user_id}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold truncate">{album.title}</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={handleShareAlbum}>
                <Share2 className="h-4 w-4" />
              </Button>
              
              {isOwner && (
                <Button variant="outline" size="icon" asChild>
                  <Link to={`/album/${albumId}/edit`}>
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
          
          {/* Album metadata */}
          {(album.description || album.photo_count > 0) && (
            <div className="mb-6">
              {album.description && (
                <p className="text-gray-300 mb-2">{album.description}</p>
              )}
              <div className="flex items-center text-sm text-gray-400">
                <span>{album.photo_count} {album.photo_count === 1 ? 'Foto' : 'Fotos'}</span>
                <span className="mx-2">•</span>
                <span>Erstellt am {new Date(album.created_at).toLocaleDateString('de-DE')}</span>
                {album.username && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Von <Link to={`/profile/${album.user_id}`} className="hover:text-primary-400 transition-colors">{album.display_name || album.username}</Link></span>
                  </>
                )}
              </div>
              <Separator className="my-4 bg-dark-100" />
            </div>
          )}
          
          {/* Album photos grid */}
          <div className="mb-8">
            {media.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square bg-dark-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleMediaClick(item.id)}
                  >
                    <img
                      src={item.url}
                      alt={item.title || 'Media item'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Empty state */}
          {media.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-dark-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white">Keine Medien</h3>
              <p className="text-gray-400 mt-2 max-w-md">
                Dieses Album enthält noch keine Fotos.
              </p>
              {isOwner && (
                <Button className="mt-4" asChild>
                  <Link to={`/album/${albumId}/edit`}>Fotos hinzufügen</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
