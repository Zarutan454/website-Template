
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { AlbumCard } from './components/AlbumCard';
import { supabase } from '@/lib/supabase';
import { CreateAlbumDialog } from './CreateAlbumDialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface PhotoAlbumGridProps {
  userId: string;
  isOwnProfile: boolean;
}

export const PhotoAlbumGrid: React.FC<PhotoAlbumGridProps> = ({ userId, isOwnProfile }) => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateAlbumDialog, setShowCreateAlbumDialog] = useState(false);

  const fetchAlbums = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('photo_albums')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAlbums(data || []);
    } catch (err) {
      toast.error('Die Alben konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAlbums();
    }
  }, [userId]);

  const handleCreateAlbum = async (data: { title: string; description: string }) => {
    try {
      const { error } = await supabase
        .from('photo_albums')
        .insert([
          {
            user_id: userId,
            title: data.title,
            description: data.description,
            visibility: 'public'
          }
        ]);
      
      if (error) throw error;
      
      toast.success('Album wurde erfolgreich erstellt');
      fetchAlbums();
      return true;
    } catch (err) {
      toast.error('Das Album konnte nicht erstellt werden.');
      return false;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6">
      {isOwnProfile && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowCreateAlbumDialog(true)}
            className="bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neues Album erstellen
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-dark-200/40 rounded-md animate-pulse" />
          ))}
        </div>
      ) : albums.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {albums.map((album) => (
            <AlbumCard 
              key={album.id} 
              album={album} 
              isOwnProfile={isOwnProfile} 
              onAlbumChange={fetchAlbums}
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-dark-200/40 w-24 h-24 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-white">Keine Alben gefunden</h3>
          <p className="text-gray-400 mt-2 max-w-md">
            {isOwnProfile ? 
              'Du hast noch keine Fotoalben erstellt. Klicke auf "Neues Album erstellen", um loszulegen.' : 
              'Dieser Benutzer hat noch keine Fotoalben erstellt.'}
          </p>
          {isOwnProfile && (
            <Button 
              onClick={() => setShowCreateAlbumDialog(true)}
              className="mt-6 bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neues Album erstellen
            </Button>
          )}
        </div>
      )}

      <CreateAlbumDialog
        isOpen={showCreateAlbumDialog}
        onClose={() => setShowCreateAlbumDialog(false)}
        onCreate={handleCreateAlbum}
      />
    </div>
  );
};
