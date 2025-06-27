
import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useThrottle } from '@/hooks/useThrottle';

interface ScrollToTopButtonProps {
  visible: boolean;
  onClick: () => void;
  className?: string;
  showLabel?: boolean;
}

/**
 * Button zum Scrollen zum Anfang des Feeds
 * - Erscheint nur, wenn der Benutzer bereits nach unten gescrollt hat
 * - Unterstützt animierte Ein-/Ausblendung
 * - Vollständig Tastatur- und Screen-Reader-zugänglich
 * - Verhindert zu viele Re-Renders bei Scroll-Events durch Throttling
 * - Unterstützt optionales Label für Desktop-Ansicht
 * - Pulsierender Hover-Effekt für bessere interaktive Rückmeldung
 */
const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  visible,
  onClick,
  className = '',
  showLabel = false
}) => {
  // Lokaler Zustand zur Steuerung der Sichtbarkeit
  const [isVisible, setIsVisible] = useState(visible);
  const [isHovered, setIsHovered] = useState(false);
  
  // Throttled onClick Handler zur Verhinderung von zu vielen Aufrufen
  const throttledOnClick = useThrottle(() => {
    onClick();
    // Optional: Schließen-Animation abspielen
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 500);
  }, 300);
  
  // Synchronisieren des lokalen Zustands mit der Prop
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-6 right-6 z-50 ${className}`}
          data-testid="scroll-to-top-button"
        >
          <Button
            variant="secondary"
            size={showLabel ? "default" : "icon"}
            className="rounded-full shadow-md hover:shadow-lg transition-shadow group"
            onClick={throttledOnClick}
            aria-label="Zum Seitenanfang scrollen"
            title="Zum Seitenanfang scrollen"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
          >
            <motion.div
              animate={isHovered ? { y: -2 } : { y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowUp className="h-5 w-5 group-hover:text-primary transition-colors" />
            </motion.div>
            {showLabel && <span className="ml-2">Nach oben</span>}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export als memoisierten Komponente für bessere Performance
export default React.memo(ScrollToTopButton);
