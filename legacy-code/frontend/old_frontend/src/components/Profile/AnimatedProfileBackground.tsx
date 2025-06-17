
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedProfileBackgroundProps {
  coverUrl?: string;
}

const AnimatedProfileBackground: React.FC<AnimatedProfileBackgroundProps> = ({ coverUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Zurücksetzen bei URL-Änderungen
    setImageLoaded(false);
    setImageError(false);
    
    // Versuche das Bild vorab zu laden, um zu prüfen, ob es zugänglich ist
    if (coverUrl) {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
      };
      img.src = coverUrl;
    }
  }, [coverUrl]);

  // Wenn ein Cover-Bild vorhanden ist und es erfolgreich geladen wurde, zeigen wir das als Hintergrund an
  if (coverUrl && !imageError) {
    return (
      <div className="absolute inset-0 h-64 overflow-hidden -z-10">
        <div 
          className={`w-full h-full bg-cover bg-center transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            backgroundImage: `url("${coverUrl}")`,
            filter: 'brightness(0.7)'
          }}
        />
        <div className={`absolute inset-0 flex items-center justify-center ${imageLoaded ? 'hidden' : 'block'}`}>
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-100" />
      </div>
    );
  }

  // Wenn kein Cover-Bild vorhanden ist oder es einen Fehler beim Laden gab, zeigen wir den animierten Hintergrund an
  console.log('Rendering animated background (no valid cover image)');
  return (
    <div className="absolute inset-0 h-64 overflow-hidden -z-10">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-secondary-600/10 to-accent/10"
        animate={{
          background: [
            "linear-gradient(to right, rgba(51, 153, 255, 0.1), rgba(102, 51, 204, 0.05), rgba(255, 102, 102, 0.05))",
            "linear-gradient(to right, rgba(102, 51, 204, 0.1), rgba(255, 102, 102, 0.05), rgba(51, 153, 255, 0.05))",
            "linear-gradient(to right, rgba(255, 102, 102, 0.1), rgba(51, 153, 255, 0.05), rgba(102, 51, 204, 0.05))",
            "linear-gradient(to right, rgba(51, 153, 255, 0.1), rgba(102, 51, 204, 0.05), rgba(255, 102, 102, 0.05))"
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="absolute w-full h-full">
        {[...Array(30)].map((_, i) => {
          const size = Math.random() * 4 + 1;
          const delay = Math.random() * 5;
          const duration = Math.random() * 10 + 15;
          const initialX = Math.random() * 100;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: size,
                height: size,
                left: `${initialX}%`,
                top: -20,
              }}
              animate={{
                y: ["0vh", "70vh"],
                x: [0, Math.sin(i) * 50],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          );
        })}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-100" />
    </div>
  );
};

export default AnimatedProfileBackground;
