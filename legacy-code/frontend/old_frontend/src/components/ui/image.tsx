
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  className?: string;
}

export const Image = ({ alt, className, ...props }: ImageProps) => {
  return (
    <img 
      alt={alt} 
      className={className}
      loading="lazy" 
      {...props} 
    />
  );
};
