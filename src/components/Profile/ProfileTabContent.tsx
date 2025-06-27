
import React from 'react';
import { Media } from '@/types/media';
import { motion } from 'framer-motion';
import { ImageIcon, FileIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProfileTabContentProps {
  activeTab: string;
  media: Media[];
  isLoadingMedia: boolean;
  isOwnProfile: boolean;
  handleMediaClick: (id: string) => void;
}

export const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
  activeTab,
  media,
  isLoadingMedia,
  isOwnProfile,
  handleMediaClick
}) => {
  if (isLoadingMedia) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-800 rounded-md" />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    let message = '';
    switch (activeTab) {
      case 'posts':
        message = isOwnProfile 
          ? 'Du hast noch keine Beiträge erstellt.' 
          : 'Dieser Benutzer hat noch keine Beiträge erstellt.';
        break;
      case 'saved':
        message = isOwnProfile 
          ? 'Du hast noch keine Beiträge gespeichert.' 
          : 'Dieser Benutzer hat noch keine Beiträge gespeichert.';
        break;
      case 'liked':
        message = isOwnProfile 
          ? 'Du hast noch keine Beiträge geliked.' 
          : 'Dieser Benutzer hat noch keine Beiträge geliked.';
        break;
      case 'collections':
        message = isOwnProfile 
          ? 'Du hast noch keine Alben erstellt.' 
          : 'Dieser Benutzer hat noch keine Alben erstellt.';
        break;
    }

    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {activeTab === 'collections' ? (
          <ImageIcon className="h-12 w-12 text-gray-500 mb-4" />
        ) : (
          <FileIcon className="h-12 w-12 text-gray-500 mb-4" />
        )}
        <h3 className="text-lg font-medium text-white mb-2">{`Keine ${activeTab === 'collections' ? 'Alben' : 'Medien'} gefunden`}</h3>
        <p className="text-gray-400 max-w-md">{message}</p>
      </div>
    );
  }

  // Definiere Animation Varianten für Grid und Items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 } 
    }
  };

  // Rendere Media Grid basierend auf activeTab
  if (activeTab === 'collections') {
    return (
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {media.map((item) => (
          <motion.div 
            key={item.id}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="cursor-pointer"
            onClick={() => handleMediaClick(item.id)}
          >
            <Card className="overflow-hidden bg-gray-800/60 hover:bg-gray-700/60 transition-colors">
              <div className="aspect-[4/3] relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.thumbnailUrl || item.url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 p-3 w-full">
                  <h3 className="text-white font-medium">{item.title}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Standard Media Grid für Posts, Saved, Liked
  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {media.map((item) => (
        <motion.div 
          key={item.id}
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          className="cursor-pointer aspect-square overflow-hidden rounded-md bg-gray-800/30"
          onClick={() => handleMediaClick(item.id)}
        >
          {item.type === 'image' || !item.type ? (
            <img 
              src={item.url || item.media_url || ''} 
              alt={item.caption || 'Medieninhalt'}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : item.type === 'video' ? (
            <div className="w-full h-full relative">
              <video 
                src={item.url || item.media_url || ''} 
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4.5v11l7-5.5-7-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <FileIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProfileTabContent;
