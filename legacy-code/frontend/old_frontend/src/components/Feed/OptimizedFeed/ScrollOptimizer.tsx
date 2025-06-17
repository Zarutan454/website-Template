
import React, { useRef, useEffect, ReactNode } from 'react';
import { useThrottle } from '@/hooks/useThrottle';

interface ScrollOptimizerProps {
  children: ReactNode;
  onScroll?: (scrollY: number) => void;
  className?: string;
  maxHeight?: string;
  saveKey?: string;
}

/**
 * Komponente zur Optimierung des Scroll-Verhaltens und Sitzungsspeicherung
 * der Scroll-Position zwischen Seitenwechseln
 */
const ScrollOptimizer: React.FC<ScrollOptimizerProps> = ({
  children,
  onScroll,
  className = '',
  maxHeight = '100vh',
  saveKey = 'feed-scroll'
}) => {
  // Ref für das Scroll-Element
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Throttled-Scroll-Handler für bessere Performance
  const handleScroll = useThrottle(() => {
    if (!scrollRef.current || !onScroll) return;
    
    const scrollY = scrollRef.current.scrollTop;
    onScroll(scrollY);
    
    // Optionale Speicherung der Position in sessionStorage
    if (saveKey) {
      try {
        sessionStorage.setItem(`scroll-position-${saveKey}`, scrollY.toString());
      } catch (err) {
        // Silent fail für Inkognito-Modus oder wenn Storage voll ist
      }
    }
  }, 50);
  
  // Wiederherstellung der Scroll-Position beim Laden
  useEffect(() => {
    if (!scrollRef.current || !saveKey) return;
    
    try {
      const savedScrollY = sessionStorage.getItem(`scroll-position-${saveKey}`);
      if (savedScrollY) {
        scrollRef.current.scrollTop = parseInt(savedScrollY, 10);
      }
    } catch (err) {
      // Silent fail für Inkognito-Modus
    }
  }, [saveKey]);
  
  return (
    <div 
      ref={scrollRef}
      className={`overflow-auto hide-scrollbar ${className}`}
      style={{ maxHeight }}
      onScroll={handleScroll}
      data-testid="scroll-optimizer"
    >
      {children}
    </div>
  );
};

export default ScrollOptimizer;
