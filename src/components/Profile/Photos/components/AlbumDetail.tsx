import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext.utils';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Upload, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import { getAlbum, getPhotos, uploadPhoto, deletePhoto, updateAlbum, deleteAlbum, Album, Photo } from '@/api/albums';

const AlbumDetail: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user: profile } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnAlbum, setIsOwnAlbum] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrivacy, setEditPrivacy] = useState<'private' | 'friends' | 'public'>('private');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (!albumId) return;
    setIsLoading(true);
    setError(null);
    Promise.all([
      getAlbum(albumId),
      getPhotos(albumId)
    ]).then(([albumData, photosData]) => {
      setAlbum(albumData);
      setPhotos(photosData);
      // Album hat kein user-Feld, daher isOwnAlbum auf true setzen, wenn das Profil existiert (ggf. anpassen, falls user_id verfügbar ist)
      setIsOwnAlbum(!!profile);
      setEditTitle(albumData.name);
      setEditDescription(albumData.description || '');
      setEditPrivacy(albumData.privacy);
    }).catch(() => {
      setError('Fehler beim Laden des Albums');
      toast.error('Fehler beim Laden des Albums');
    }).finally(() => setIsLoading(false));
  }, [albumId, profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !albumId) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      await uploadPhoto(albumId, file);
      const updatedPhotos = await getPhotos(albumId);
      setPhotos(updatedPhotos);
      toast.success('Foto erfolgreich hochgeladen');
    } catch {
      toast.error('Fehler beim Hochladen des Fotos');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Foto wirklich löschen?')) return;
    try {
      await deletePhoto(photoId);
      setPhotos(photos.filter((p) => p.id !== photoId));
      toast.success('Foto gelöscht');
    } catch {
      toast.error('Fehler beim Löschen des Fotos');
    }
  };

  const handleEditAlbum = () => setIsEditMode(true);
  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (album) {
      setEditTitle(album.name);
      setEditDescription(album.description || '');
      setEditPrivacy(album.privacy);
    }
  };

  const handleSaveAlbum = async () => {
    if (!albumId) return;
    try {
      const updated = await updateAlbum(albumId, {
        name: editTitle,
        description: editDescription,
        privacy: editPrivacy
      });
      setAlbum(updated);
      setIsEditMode(false);
      toast.success('Album gespeichert');
    } catch {
      toast.error('Fehler beim Speichern des Albums');
    }
  };

  const handleDeleteAlbum = async () => {
    if (!albumId) return;
    if (!window.confirm('Album wirklich löschen? Alle Fotos werden entfernt.')) return;
    try {
      await deleteAlbum(albumId);
      toast.success('Album gelöscht');
      navigate(-1);
    } catch {
      toast.error('Fehler beim Löschen des Albums');
    }
  };

  // Drag & Drop Handler
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (!albumId) return;
    const files = Array.from(e.dataTransfer.files as FileList).filter((f: File) => f.type.startsWith('image/'));
    if (files.length === 0) return toast.error('Nur Bilddateien erlaubt!');
    setIsUploading(true);
    try {
      for (const file of files) {
        await uploadPhoto(albumId, file as File);
      }
      const updatedPhotos = await getPhotos(albumId);
      setPhotos(updatedPhotos);
      toast.success(`${files.length} Foto(s) erfolgreich hochgeladen`);
    } catch {
      toast.error('Fehler beim Hochladen der Fotos');
    } finally {
      setIsUploading(false);
    }
  }, [albumId]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  // Album-Sharing (nur für öffentliche Alben)
  const handleShareAlbum = () => {
    if (!album) return;
    const url = `${window.location.origin}/albums/${album.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Album-Link kopiert!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-12 bg-dark-200/40 rounded-md animate-pulse w-48"></div>
        <div className="h-60 bg-dark-200/40 rounded-md animate-pulse"></div>
      </div>
    );
  }
  if (error || !album) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Album Details</h1>
        </div>
        <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-4">{error || 'Album nicht gefunden'}</h2>
          <Button onClick={() => navigate('/profile')} className="bg-primary-500 hover:bg-primary-600">
            Zurück zum Profil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white flex-1">Album: {album.name}</h1>
        {album.privacy === 'public' && (
          <Button variant="outline" onClick={handleShareAlbum} className="mr-2">
            <Plus className="h-4 w-4 mr-1" /> Teilen
          </Button>
        )}
        {isOwnAlbum && !isEditMode && (
          <>
            <Button variant="outline" onClick={handleEditAlbum} className="mr-2">
              <Edit className="h-4 w-4 mr-1" /> Bearbeiten
            </Button>
            <Button variant="destructive" onClick={handleDeleteAlbum}>
              <Trash2 className="h-4 w-4 mr-1" /> Album löschen
            </Button>
          </>
        )}
      </div>
      {isEditMode ? (
        <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 mb-6">
          <div className="mb-4">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Albumtitel" title="Albumtitel" className="mb-2" />
            <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Beschreibung" title="Beschreibung" className="mb-2" />
            <label htmlFor="editPrivacy" className="block text-sm font-medium text-white mb-1">Sichtbarkeit</label>
            <select id="editPrivacy" title="Sichtbarkeit" value={editPrivacy} onChange={e => setEditPrivacy(e.target.value as 'private' | 'friends' | 'public')} className="mb-2 p-2 rounded">
              <option value="public">Öffentlich</option>
              <option value="friends">Nur Freunde</option>
              <option value="private">Privat</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveAlbum}>
              <Save className="h-4 w-4 mr-1" /> Speichern
            </Button>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-1" /> Abbrechen
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">{album.name}</h2>
          <p className="text-gray-400 mb-2">{album.description || 'Keine Beschreibung'}</p>
          <span className="text-xs text-gray-500">{album.privacy === 'public' ? 'Öffentlich' : album.privacy === 'friends' ? 'Nur Freunde' : 'Privat'}</span>
        </div>
      )}
      <div
        className={`mb-6 flex items-center justify-between ${isDragActive ? 'ring-2 ring-primary-500' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragLeave}
        style={{ minHeight: 40 }}
      >
        <h2 className="text-lg font-bold text-white">Fotos ({photos.length})</h2>
        {isOwnAlbum && (
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="h-4 w-4 mr-1" />
            {isUploading ? 'Wird hochgeladen...' : 'Foto hochladen'}
          </Button>
        )}
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={isUploading} multiple title="Foto auswählen" placeholder="Foto auswählen" />
        {isDragActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-white text-lg font-semibold">Bilder hierher ziehen zum Hochladen</span>
          </div>
        )}
      </div>
      {photos.length === 0 ? (
        <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">Noch keine Fotos vorhanden</h3>
          <p className="text-gray-400 text-sm">Lade das erste Foto hoch!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group bg-dark-200/50 border border-gray-700 rounded-lg overflow-hidden">
              <img src={photo.image_url} alt={photo.caption || 'Foto'} className="w-full h-48 object-cover" />
              {isOwnAlbum && (
                <Button size="icon" variant="destructive" className="absolute top-2 right-2 opacity-80 group-hover:opacity-100" onClick={() => handleDeletePhoto(photo.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {photo.caption && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">{photo.caption}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;

