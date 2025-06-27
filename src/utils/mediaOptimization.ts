/**
 * Media Optimization Utilities
 * Handles WebP conversion, responsive images, and lazy loading
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
}

export interface ResponsiveImageSizes {
  sm: number;  // 640px
  md: number;  // 768px
  lg: number;  // 1024px
  xl: number;  // 1280px
  '2xl': number; // 1536px
}

// Default responsive breakpoints
const DEFAULT_SIZES: ResponsiveImageSizes = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Check if WebP is supported in the browser
 */
export const isWebPSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalFormat = async (): Promise<'webp' | 'jpeg'> => {
  const supportsWebP = await isWebPSupported();
  return supportsWebP ? 'webp' : 'jpeg';
};

/**
 * Generate optimized image URL with parameters
 */
export const generateOptimizedImageUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    lazy = true,
  } = options;

  // If no optimization needed, return original URL
  if (!width && !height && format === 'jpeg') {
    return originalUrl;
  }

  // For external URLs, we might need a different approach
  if (originalUrl.startsWith('http') && !originalUrl.includes('localhost')) {
    // Use a CDN or image optimization service
    return generateCDNUrl(originalUrl, options);
  }

  // For local images, we can use our own optimization
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (quality !== 80) params.append('q', quality.toString());
  if (format !== 'jpeg') params.append('f', format);
  if (lazy) params.append('lazy', '1');

  const separator = originalUrl.includes('?') ? '&' : '?';
  return `${originalUrl}${separator}${params.toString()}`;
};

/**
 * Generate CDN URL for external images
 */
const generateCDNUrl = (url: string, options: ImageOptimizationOptions): string => {
  // Example using a hypothetical CDN
  const cdnBase = 'https://cdn.example.com/optimize';
  const params = new URLSearchParams();
  
  params.append('url', encodeURIComponent(url));
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('f', options.format);
  
  return `${cdnBase}?${params.toString()}`;
};

/**
 * Generate responsive image srcset
 */
export const generateResponsiveSrcset = (
  originalUrl: string,
  sizes: Partial<ResponsiveImageSizes> = DEFAULT_SIZES,
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string => {
  const srcsetParts: string[] = [];

  Object.entries(sizes).forEach(([breakpoint, width]) => {
    if (width) {
      const optimizedUrl = generateOptimizedImageUrl(originalUrl, {
        ...options,
        width,
      });
      srcsetParts.push(`${optimizedUrl} ${width}w`);
    }
  });

  return srcsetParts.join(', ');
};

/**
 * Generate responsive image sizes attribute
 */
export const generateResponsiveSizes = (maxWidth: number = 1200): string => {
  return `(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, ${maxWidth}px`;
};

/**
 * Lazy loading utility for images
 */
export const createLazyImageObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Optimize image for different use cases
 */
export const optimizeImageForUse = async (
  originalUrl: string,
  useCase: 'thumbnail' | 'preview' | 'full' | 'hero'
): Promise<string> => {
  const format = await getOptimalFormat();
  
  const presets = {
    thumbnail: { width: 150, height: 150, quality: 70, format },
    preview: { width: 400, height: 300, quality: 80, format },
    full: { width: 800, height: 600, quality: 85, format },
    hero: { width: 1200, height: 600, quality: 90, format },
  };

  return generateOptimizedImageUrl(originalUrl, presets[useCase]);
};

/**
 * Generate placeholder image URL
 */
export const generatePlaceholderUrl = (
  width: number = 400,
  height: number = 300,
  text: string = 'Loading...'
): string => {
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    txt: encodeURIComponent(text),
    bg: 'f0f0f0',
    txtclr: '666666',
  });

  return `https://via.placeholder.com/${width}x${height}?${params.toString()}`;
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Batch preload images
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url));
  await Promise.allSettled(promises);
};

/**
 * Get image dimensions from URL
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Calculate aspect ratio
 */
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

/**
 * Generate optimal image dimensions maintaining aspect ratio
 */
export const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);
  
  let width = maxWidth;
  let height = width / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}; 
