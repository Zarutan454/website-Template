
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Image } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: {
    id: string;
    title: string;
    description: string;
    cover_url: string | null;
    photo_count: number;
    created_at: string;
  };
  isOwnProfile: boolean;
  onAlbumChange: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, isOwnProfile, onAlbumChange }) => {
  const navigate = useNavigate();
  
  const handleAlbumClick = () => {
    navigate(`/albums/${album.id}`);
  };
  
  const handleEditAlbum = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/albums/${album.id}/edit`);
  };
  
  const handleDeleteAlbum = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm(`Möchtest du das Album "${album.title}" wirklich löschen?`)) {
      try {
        const { error } = await supabase
          .from('photo_albums')
          .delete()
          .eq('id', album.id);
        
        if (error) throw error;
        
        toast.success('Album erfolgreich gelöscht');
        onAlbumChange();
      } catch (err) {
        toast.error('Fehler beim Löschen des Albums');
      }
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <Card 
        className={cn(
          "h-48 cursor-pointer relative overflow-hidden group bg-dark-200 border-gray-800/40 hover:border-primary-500/30 transition-colors",
          "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/80 before:to-transparent before:opacity-70 before:z-10"
        )}
        onClick={handleAlbumClick}
      >
        {album.cover_url ? (
          <img 
            src={album.cover_url} 
            alt={album.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-dark-300 to-dark-400">
            <Image className="h-16 w-16 text-gray-600" />
          </div>
        )}
        
        <CardContent className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-semibold text-white truncate">{album.title}</h3>
              <p className="text-sm text-gray-300 truncate">{album.photo_count} Fotos</p>
            </div>
            
            {isOwnProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-dark-100/50 border-gray-700/50 hover:bg-dark-300/70"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Aktionen</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-dark-100 border-gray-700">
                  <DropdownMenuItem onClick={handleEditAlbum} className="hover:bg-dark-300 cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Bearbeiten</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteAlbum} className="text-red-500 hover:bg-dark-300 cursor-pointer">
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Löschen</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
