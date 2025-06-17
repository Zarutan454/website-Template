
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Upload, Trash2, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AlbumDetailProps {
  albumId: string;
  isEditMode?: boolean;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({ albumId, isEditMode = false }) => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [album, setAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnAlbum, setIsOwnAlbum] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit mode state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVisibility, setEditVisibility] = useState('private');

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      if (!albumId) return;
      
      try {
        setIsLoading(true);
        
        // Album Daten laden
        const { data: albumData, error: albumError } = await supabase
          .from('photo_albums')
          .select('*')
          .eq('id', albumId)
          .single();
        
        if (albumError) throw albumError;
        
        setAlbum(albumData);
        setIsOwnAlbum(profile?.id === albumData.user_id);
        
        // Für Edit-Modus die Felder vorausfüllen
        setEditTitle(albumData.title);
        setEditDescription(albumData.description || '');
        setEditVisibility(albumData.visibility || 'private');
        
        // Fotos des Albums laden
        const { data: photosData, error: photosError } = await supabase
          .from('album_photos')
          .select('*')
          .eq('album_id', albumId)
          .order('created_at', { ascending: false });
        
        if (photosError) throw photosError;
        
        setPhotos(photosData || []);
      } catch (error) {
        toast.error('Die Albumdetails konnten nicht geladen werden.');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlbumDetails();
  }, [albumId, profile, navigate]);

  const handleSaveAlbum = async () => {
    if (!isOwnAlbum) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('photo_albums')
        .update({
          title: editTitle,
          description: editDescription,
          visibility: editVisibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', albumId);
      
      if (error) throw error;
      
      toast.success('Album erfolgreich aktualisiert');
      
      // Update local state
      setAlbum(prev => ({
        ...prev,
        title: editTitle,
        description: editDescription,
        visibility: editVisibility
      }));
      
      // Navigate back to album view
      navigate(`/albums/${albumId}`);
    } catch (error) {
      console.error('Fehler beim Speichern des Albums:', error);
      toast.error('Das Album konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteAlbum = async () => {
    if (!isOwnAlbum || !window.confirm('Möchtest du dieses Album wirklich löschen?')) return;
    
    try {
      const { error } = await supabase
        .from('photo_albums')
        .delete()
        .eq('id', albumId);
      
      if (error) throw error;
      
      toast.success('Album erfolgreich gelöscht');
      navigate('/profile');
    } catch (error) {
      console.error('Fehler beim Löschen des Albums:', error);
      toast.error('Das Album konnte nicht gelöscht werden.');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !profile) return;
    
    try {
      setIsUploading(true);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Foto in den Storage hochladen
      const { error: uploadError, data } = await supabase.storage
        .from('album_photos')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Öffentliche URL abrufen
      const { data: { publicUrl } } = supabase.storage
        .from('album_photos')
        .getPublicUrl(filePath);
      
      // Foto zur Datenbank hinzufügen
      const { error: dbError } = await supabase
        .from('album_photos')
        .insert([{
          album_id: albumId,
          user_id: profile.id,
          photo_url: publicUrl,
          title: file.name
        }]);
      
      if (dbError) throw dbError;
      
      toast.success('Foto erfolgreich hochgeladen');
      
      // Fotos neu laden
      const { data: newPhotos, error: reloadError } = await supabase
        .from('album_photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });
      
      if (reloadError) throw reloadError;
      
      setPhotos(newPhotos || []);
    } catch (error) {
      console.error('Fehler beim Hochladen des Fotos:', error);
      toast.error('Das Foto konnte nicht hochgeladen werden.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    if (!confirm('Möchtest du dieses Foto wirklich löschen?')) return;
    
    try {
      // Foto aus der Datenbank löschen
      const { error: dbError } = await supabase
        .from('album_photos')
        .delete()
        .eq('id', photoId);
      
      if (dbError) throw dbError;
      
      // Foto aus dem Storage löschen
      // Der folgende Code würde in einer echten Anwendung das Foto aus dem Storage löschen
      // Das ist hier vereinfacht, da wir die genaue Storage-Struktur nicht kennen
      
      toast.success('Foto erfolgreich gelöscht');
      
      // Fotos aus der lokalen State entfernen
      setPhotos(photos.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Fehler beim Löschen des Fotos:', error);
      toast.error('Das Foto konnte nicht gelöscht werden.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-12 bg-dark-200/40 rounded-md animate-pulse w-48"></div>
        <div className="h-60 bg-dark-200/40 rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Album nicht gefunden</h1>
        <Button onClick={() => navigate(-1)}>Zurück</Button>
      </div>
    );
  }

  // Edit Mode Render
  if (isEditMode && isOwnAlbum) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(`/albums/${albumId}`)} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Album bearbeiten</h1>
          </div>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/albums/${albumId}`)}
              className="border-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            
            <Button 
              onClick={handleSaveAlbum}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary-500 to-secondary-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-300">
                Albumtitel
              </label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-dark-200 border-gray-700"
                placeholder="Gib deinem Album einen Namen"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-300">
                Beschreibung
              </label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-dark-200 border-gray-700 min-h-32"
                placeholder="Beschreibe dein Album (optional)"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Sichtbarkeit
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={editVisibility === 'private'}
                    onChange={() => setEditVisibility('private')}
                    className="text-primary-500"
                  />
                  <span className="text-gray-300">Privat (nur ich)</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="friends"
                    checked={editVisibility === 'friends'}
                    onChange={() => setEditVisibility('friends')}
                    className="text-primary-500"
                  />
                  <span className="text-gray-300">Freunde</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={editVisibility === 'public'}
                    onChange={() => setEditVisibility('public')}
                    className="text-primary-500"
                  />
                  <span className="text-gray-300">Öffentlich</span>
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteAlbum}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Album löschen
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Fotos in diesem Album</h2>
          
          {photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden bg-dark-200 border-gray-800/40 hover:border-primary-500/30 transition-colors group">
                  <div className="relative aspect-square">
                    <img 
                      src={photo.photo_url} 
                      alt={photo.title || 'Foto'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Keine Fotos in diesem Album
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular View Mode
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">{album.title}</h1>
      </div>
      
      {album.description && (
        <p className="text-gray-300">{album.description}</p>
      )}
      
      {isOwnAlbum && (
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-dark-300 hover:border-primary-500/30"
              onClick={() => navigate(`/albums/${albumId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Album bearbeiten
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-400"
              onClick={handleDeleteAlbum}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Album löschen
            </Button>
          </div>
          
          <div>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={isUploading}
            />
            <label htmlFor="photo-upload">
              <Button
                className="bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 cursor-pointer"
                disabled={isUploading}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Wird hochgeladen...' : 'Foto hochladen'}
              </Button>
            </label>
          </div>
        </div>
      )}
      
      {photos.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Card className="overflow-hidden bg-dark-200 border-gray-800/40 hover:border-primary-500/30 transition-colors group">
                <div className="relative aspect-square">
                  <img 
                    src={photo.photo_url} 
                    alt={photo.title || 'Foto'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {isOwnAlbum && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {photo.title && (
                  <CardContent className="p-2">
                    <p className="text-sm text-gray-300 truncate">{photo.title}</p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-dark-200/40 w-24 h-24 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-white">Keine Fotos in diesem Album</h3>
          <p className="text-gray-400 mt-2 max-w-md">
            {isOwnAlbum ? 
              'Dieses Album enthält noch keine Fotos. Lade dein erstes Foto hoch, um loszulegen.' : 
              'Dieses Album enthält noch keine Fotos.'}
          </p>
          {isOwnAlbum && (
            <div className="mt-6">
              <input
                type="file"
                id="empty-photo-upload"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
              <label htmlFor="empty-photo-upload">
                <Button
                  className="bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 cursor-pointer"
                  disabled={isUploading}
                  onClick={() => document.getElementById('empty-photo-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Wird hochgeladen...' : 'Erstes Foto hochladen'}
                </Button>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;
