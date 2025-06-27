import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users, 
  Lock,
  Image
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { supabase } from '@/lib/supabase'; // TODO: Migrate to Django
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: unknown;
  isOwnProfile: boolean;
  onAlbumChange: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, isOwnProfile, onAlbumChange }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <Card className="overflow-hidden bg-dark-200 border-gray-800/40 hover:border-primary-500/30 transition-colors group cursor-pointer">
        <div className="relative aspect-square bg-dark-300/50 flex items-center justify-center">
          <Image className="h-12 w-12 text-gray-500" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-sm font-medium">Migration in Arbeit</p>
              <p className="text-xs text-gray-300">Album wird zu Django migriert</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-white line-clamp-1">Album</h3>
              <p className="text-sm text-gray-400 mt-1">Migration in Arbeit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
