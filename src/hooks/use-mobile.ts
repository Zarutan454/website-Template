
import { useState, useEffect } from 'react';

export function useMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Set initial value
    setMatches(media.matches);

    // Define callback for media query change
    const listener = () => setMatches(media.matches);
    
    // Add listener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
