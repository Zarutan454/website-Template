import React, { useState, useEffect } from 'react';
import { PhotoAlbumGrid } from './PhotoAlbumGrid';
import { useAuth } from '@/context/AuthContext.utils';

interface PhotoAlbumsProps {
  userId: string;
}

export const PhotoAlbums: React.FC<PhotoAlbumsProps> = ({ userId }) => {
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { user: profile } = useAuth();
  
  useEffect(() => {
    // Überprüfen, ob es das eigene Profil ist
    if (profile && userId) {
      setIsOwnProfile(profile.id === userId);
    }
  }, [profile, userId]);

  return (
    <div className="space-y-6">
      <PhotoAlbumGrid userId={userId} isOwnProfile={isOwnProfile} />
    </div>
  );
};

