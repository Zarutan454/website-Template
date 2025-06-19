import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

/**
 * Hook für responsive Design
 * Stellt Breakpoints und Hilfsfunktionen für verschiedene Bildschirmgrößen bereit
 */
const useResponsive = () => {
  // Definiere Breakpoints nach Tailwind CSS Standards
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  // Media Queries für verschiedene Bildschirmgrößen
  const isMobile = useMediaQuery({ maxWidth: breakpoints.md - 1 });
  const isTablet = useMediaQuery({ minWidth: breakpoints.md, maxWidth: breakpoints.lg - 1 });
  const isDesktop = useMediaQuery({ minWidth: breakpoints.lg });
  const isLargeDesktop = useMediaQuery({ minWidth: breakpoints.xl });

  // State für SSR-Kompatibilität (Server-Side Rendering)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hilfsfunktion für bedingte Styles basierend auf Bildschirmgröße
  const getResponsiveStyle = (mobileStyle, tabletStyle, desktopStyle) => {
    if (!isClient) return {}; // Fallback für SSR
    
    if (isMobile) return mobileStyle;
    if (isTablet) return tabletStyle;
    return desktopStyle;
  };

  // Hilfsfunktion für bedingte Klassen basierend auf Bildschirmgröße
  const getResponsiveClass = (mobileClass, tabletClass, desktopClass) => {
    if (!isClient) return ''; // Fallback für SSR
    
    if (isMobile) return mobileClass;
    if (isTablet) return tabletClass;
    return desktopClass;
  };

  return {
    breakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isClient,
    getResponsiveStyle,
    getResponsiveClass
  };
};

export default useResponsive; 