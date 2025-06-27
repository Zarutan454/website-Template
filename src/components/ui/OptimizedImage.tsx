// Optimized Image Component

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  generateOptimizedImageUrl,
  generateResponsiveSrcset,
  generateResponsiveSizes,
  optimizeImageForUse,
  generatePlaceholderUrl,
  createLazyImageObserver,
  ImageOptimizationOptions,
} from '@/utils/mediaOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  useCase?: 'thumbnail' | 'preview' | 'full' | 'hero';
  optimizationOptions?: ImageOptimizationOptions;
  lazy?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  useCase = 'preview',
  optimizationOptions = {},
  lazy = true,
  placeholder,
  onLoad,
  onError,
  priority = false,
  sizes,
  fill = false,
  quality = 80,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [placeholderSrc, setPlaceholderSrc] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);

  // Generate optimized image URL
  useEffect(() => {
    const generateOptimizedSrc = async () => {
      try {
        let optimizedUrl: string;

        if (useCase) {
          optimizedUrl = await optimizeImageForUse(src, useCase);
        } else {
          optimizedUrl = generateOptimizedImageUrl(src, {
            width,
            height,
            quality,
            ...optimizationOptions,
          });
        }

        setOptimizedSrc(optimizedUrl);
      } catch (error) {
        console.error('Error generating optimized image URL:', error);
        setOptimizedSrc(src);
      }
    };

    generateOptimizedSrc();
  }, [src, useCase, width, height, quality, optimizationOptions]);

  // Generate placeholder
  useEffect(() => {
    if (placeholder) {
      setPlaceholderSrc(placeholder);
    } else if (width && height) {
      setPlaceholderSrc(generatePlaceholderUrl(width, height, 'Loading...'));
    }
  }, [placeholder, width, height]);

  // Lazy loading setup
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = createLazyImageObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageRef.current) {
            const img = imageRef.current;
            img.src = optimizedSrc;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px 0px' }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [lazy, priority, optimizedSrc]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Generate responsive attributes
  const responsiveSrcset = generateResponsiveSrcset(src, undefined, {
    quality,
    ...optimizationOptions,
  });

  const responsiveSizes = sizes || generateResponsiveSizes(width || 800);

  // Image props
  const imageProps = {
    ref: imageRef,
    alt,
    className: cn(
      'transition-opacity duration-300',
      {
        'opacity-0': !isLoaded && !isError,
        'opacity-100': isLoaded,
        'object-cover': fill,
      },
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    ...(fill && {
      fill: true,
      style: { objectFit: 'cover' as const },
    }),
    ...(!fill && {
      width,
      height,
    }),
    ...(priority && {
      src: optimizedSrc,
    }),
    ...(!priority && {
      'data-src': optimizedSrc,
      src: lazy ? placeholderSrc : optimizedSrc,
    }),
    ...(responsiveSrcset && {
      srcSet: responsiveSrcset,
      sizes: responsiveSizes,
    }),
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <AnimatePresence>
        {/* Placeholder */}
        {!isLoaded && !isError && placeholderSrc && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={placeholderSrc}
            alt="Loading placeholder"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Main image */}
        <motion.img
          {...imageProps}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Error state */}
        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          >
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">??</div>
              <div className="text-sm">Bild konnte nicht geladen werden</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
