import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// import { supabase } from '@/lib/supabase'; // TODO: Migrate to Django
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Heart, 
  MessageCircle,
  Share2,
  Download
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AlbumDetailProps {
  albumId: string;
  isEditMode?: boolean;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({ albumId, isEditMode = false }) => {
  const navigate = useNavigate();
  const { user: profile } = useAuth();
  const [album, setAlbum] = useState<unknown>(null);
  const [photos, setPhotos] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnAlbum, setIsOwnAlbum] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit mode states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVisibility, setEditVisibility] = useState<'private' | 'friends' | 'public'>('private');

  useEffect(() => {
    // TODO: Implement Django album fetching
    // For now, show a placeholder message
    setIsLoading(false);
    toast.info('Album-Funktionalität wird zu Django migriert');
  }, [albumId]);

  // Placeholder functions - TODO: Implement with Django API
  const fetchAlbumDetails = async () => {
    // TODO: Implement Django API call
    console.log('TODO: Fetch album details from Django API');
  };

  const handleSaveAlbum = async () => {
    // TODO: Implement Django API call
    toast.info('Album-Speicherung wird zu Django migriert');
  };

  const handleDeleteAlbum = async () => {
    // TODO: Implement Django API call
    toast.info('Album-Löschung wird zu Django migriert');
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement Django media upload
    toast.info('Photo-Upload wird zu Django migriert');
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    // TODO: Implement Django API call
    toast.info('Photo-Löschung wird zu Django migriert');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-12 bg-dark-200/40 rounded-md animate-pulse w-48"></div>
        <div className="h-60 bg-dark-200/40 rounded-md animate-pulse"></div>
      </div>
    );
  }

  // Show migration notice
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Album Details</h1>
      </div>
      
      <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Migration in Arbeit</h2>
        <p className="text-gray-300 mb-4">
          Die Album-Funktionalität wird gerade von Supabase zu Django migriert.
        </p>
        <Button onClick={() => navigate('/profile')} className="bg-primary-500 hover:bg-primary-600">
          Zurück zum Profil
        </Button>
      </div>
    </div>
  );
};

export default AlbumDetail;
