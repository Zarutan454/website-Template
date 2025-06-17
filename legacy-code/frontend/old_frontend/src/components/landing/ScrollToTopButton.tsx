
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  // Animation variants
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
    hover: { 
      scale: 1.1,
      boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)'
    },
    tap: { scale: 0.9 }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          whileHover={prefersReducedMotion ? {} : "hover"}
          whileTap={prefersReducedMotion ? {} : "tap"}
          variants={buttonVariants}
          transition={{ type: 'spring', stiffness: 300 }}
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
