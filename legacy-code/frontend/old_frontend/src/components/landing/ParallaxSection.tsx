
import React, { useRef, useEffect, useState } from 'react';
import { useMotionValue, useTransform, motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className = '',
  speed = 1,
  direction = 'vertical'
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  
  const [elementTop, setElementTop] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  // Fix the input range type
  const parallaxY = useTransform(
    y,
    [0, 1],
    [0, speed * 50]
  );
  
  // Update element position for parallax effect
  useEffect(() => {
    if (!elementRef.current) return;
    
    const updatePosition = () => {
      const element = elementRef.current;
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      setElementTop(rect.top + window.scrollY);
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [elementRef]);
  
  // Update motion value on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current || !inView) return;
      
      const scrollY = window.scrollY;
      const relativeY = (scrollY - elementTop) / window.innerHeight;
      y.set(relativeY);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [elementTop, y, inView]);
  
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        ref={elementRef}
        style={{ 
          y: direction === 'vertical' ? parallaxY : 0,
          x: direction === 'horizontal' ? parallaxY : 0,
        }}
        className="relative h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection;
