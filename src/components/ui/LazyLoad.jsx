import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyLoad Komponente für verzögertes Laden von Inhalten
 * 
 * @param {Object} props - Komponenten-Props
 * @param {React.ReactNode} props.children - Der zu ladende Inhalt
 * @param {string} props.placeholder - Optional: Platzhalter während des Ladens
 * @param {number} props.threshold - Optional: Schwellenwert für Intersection Observer (0-1)
 * @param {string} props.className - Optional: CSS-Klassen für den Container
 * @returns {React.ReactElement}
 */
const LazyLoad = ({ 
  children, 
  placeholder = null, 
  threshold = 0.1, 
  className = "",
  height = "auto"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const currentRef = containerRef.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef);
        }
      },
      { threshold }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setHasLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div 
      ref={containerRef} 
      className={`transition-opacity duration-500 ${hasLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ minHeight: !hasLoaded ? height : 'auto' }}
    >
      {isVisible ? children : placeholder}
    </div>
  );
};

/**
 * LazyImage Komponente für verzögertes Laden von Bildern
 * 
 * @param {Object} props - Komponenten-Props
 * @param {string} props.src - Bildquelle
 * @param {string} props.alt - Alt-Text für das Bild
 * @param {string} props.className - Optional: CSS-Klassen für das Bild
 * @param {number} props.threshold - Optional: Schwellenwert für Intersection Observer (0-1)
 * @returns {React.ReactElement}
 */
export const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  threshold = 0.1,
  width,
  height
}) => {
  const placeholderColor = "bg-gray-800";
  
  return (
    <LazyLoad 
      placeholder={
        <div 
          className={`${placeholderColor} animate-pulse ${className}`} 
          style={{ width, height }}
        />
      }
      threshold={threshold}
      height={height}
    >
      <img 
        src={src} 
        alt={alt} 
        className={className}
        width={width}
        height={height}
        loading="lazy"
      />
    </LazyLoad>
  );
};

export default LazyLoad; 