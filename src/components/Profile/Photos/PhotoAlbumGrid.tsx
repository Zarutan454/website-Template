import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image } from 'lucide-react';
// import { supabase } from '@/lib/supabase'; // TODO: Migrate to Django
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface PhotoAlbumGridProps {
  isOwnProfile: boolean;
}

const PhotoAlbumGrid: React.FC<PhotoAlbumGridProps> = ({ isOwnProfile }) => {
  const { user: profile } = useAuth();

  useEffect(() => {
    // TODO: Implement Django photo albums fetching
    toast.info('Photo Albums werden zu Django migriert');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Foto-Alben</h2>
        {isOwnProfile && (
          <Button
            disabled
            className="bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 opacity-50 cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neues Album (Migration in Arbeit)
          </Button>
        )}
      </div>

      <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-8 text-center">
        <Image className="h-16 w-16 mx-auto mb-4 text-gray-500" />
        <h3 className="text-xl font-semibold text-white mb-2">Migration in Arbeit</h3>
        <p className="text-gray-300 mb-4">
          Die Photo Album-Funktionalität wird gerade von Supabase zu Django migriert.
        </p>
        <p className="text-gray-400 text-sm">
          Diese Funktion wird bald wieder verfügbar sein.
        </p>
      </div>
    </div>
  );
};

export default PhotoAlbumGrid;
