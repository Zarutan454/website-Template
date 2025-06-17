import { useState, useEffect, useRef } from 'react';

const useIntersectionObserver = ({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        // Update state only if:
        // - Element is newly intersecting, OR
        // - Element is no longer intersecting AND we're not freezing visibility
        if (isElementIntersecting || (!isElementIntersecting && !freezeOnceVisible)) {
          setIsIntersecting(isElementIntersecting);
        }

        // If element has been visible and we're freezing visibility
        if (isElementIntersecting && freezeOnceVisible) {
          setHasBeenVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  // If we're freezing visibility and element has been visible,
  // always return true for isIntersecting
  const returnValue = freezeOnceVisible && hasBeenVisible ? true : isIntersecting;

  return [elementRef, returnValue];
};

export default useIntersectionObserver;