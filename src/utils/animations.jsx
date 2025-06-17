import React, { useRef, useEffect, useState } from 'react';

// Blockchain particles component
export const BlockchainParticles = ({ count = 15 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-[#00a2ff]/30 rounded-full animate-float-slow"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${6 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};

// Blockchain connections component
export const BlockchainConnections = ({ count = 6 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`connection-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-[#00a2ff]/20 to-transparent"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: 0,
            right: 0,
            width: '100%',
            transform: `rotate(${-30 + Math.random() * 60}deg)`,
            opacity: 0.2 + Math.random() * 0.3
          }}
        />
      ))}
    </div>
  );
};

// Animated section component with fade-in and slide-up animation
export const AnimatedSection = ({ 
  children, 
  delay = 0, 
  threshold = 0.1,
  duration = 700,
  className = "",
  distance = 30
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={sectionRef}
      className={`${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// Animated card component with hover effects
export const AnimatedCard = ({ children, className = "" }) => {
  return (
    <div className={`transform hover:scale-105 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

// Hook for scroll-based animations
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);
  
  return [ref, isVisible];
};

// Function to add extended animations to the page
export const addExtendedAnimations = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes pulse-border {
      0%, 100% { border-color: rgba(0, 162, 255, 0.2); }
      50% { border-color: rgba(0, 162, 255, 0.5); }
    }
    
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes spin-slow-faster {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes spin-slow-reverse {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    
    @keyframes spin-slow-reverse-faster {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
    
    .animate-pulse-border {
      animation: pulse-border 2s infinite;
    }
    
    .animate-spin-slow {
      animation: spin-slow 20s linear infinite;
    }
    
    .animate-spin-slow-faster {
      animation: spin-slow-faster 15s linear infinite;
    }
    
    .animate-spin-slow-reverse {
      animation: spin-slow-reverse 25s linear infinite;
    }
    
    .animate-spin-slow-reverse-faster {
      animation: spin-slow-reverse-faster 18s linear infinite;
    }
  `;
  document.head.appendChild(style);
};

// Animated Counter component
export const AnimatedCounter = ({ 
  start = 0, 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  decimals = 0
}) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    countRef.current = start;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const currentCount = start + progress * (end - start);
      countRef.current = currentCount;
      setCount(currentCount);
      
      if (progress === 1) {
        clearInterval(interval);
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, [start, end, duration, isVisible]);

  return (
    <div ref={sectionRef}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </div>
  );
};

// Typing Animation component
export const TypingAnimation = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = "",
  cursor = true
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let timeout;
    
    timeout = setTimeout(() => {
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsComplete(true);
        }
      }, speed);
      
      return () => clearInterval(typingInterval);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [text, speed, delay, isVisible]);

  return (
    <div ref={sectionRef} className={className}>
      {displayText}
      {cursor && !isComplete && (
        <span className="inline-block w-[2px] h-[1em] bg-current animate-blink ml-[1px] align-middle"></span>
      )}
    </div>
  );
};

// Animated Gradient Text component
export const AnimatedGradientText = ({ 
  text, 
  gradientColors = ['#00a2ff', '#0077ff', '#00a2ff'],
  duration = 3,
  className = ""
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className="bg-clip-text text-transparent bg-gradient-to-r animate-gradient-x"
        style={{
          backgroundImage: `linear-gradient(to right, ${gradientColors.join(', ')})`,
          backgroundSize: `${gradientColors.length * 100}% 100%`,
          animationDuration: `${duration}s`
        }}
      >
        {text}
      </span>
    </div>
  );
};

// Animated Icon component
export const AnimatedIcon = ({ 
  icon, 
  size = 24, 
  color = 'currentColor',
  animation = 'pulse', // pulse, spin, bounce, shake
  duration = 2,
  className = ""
}) => {
  let animationClass = '';
  
  switch (animation) {
    case 'pulse':
      animationClass = 'animate-pulse';
      break;
    case 'spin':
      animationClass = 'animate-spin';
      break;
    case 'bounce':
      animationClass = 'animate-bounce';
      break;
    case 'shake':
      animationClass = 'animate-shake';
      break;
    default:
      animationClass = '';
  }
  
  return (
    <div 
      className={`inline-flex items-center justify-center ${animationClass} ${className}`}
      style={{ animationDuration: `${duration}s` }}
    >
      {icon}
    </div>
  );
};

// Erweiterte Animationen für die App.jsx
export default {
  BlockchainParticles,
  BlockchainConnections,
  AnimatedSection,
  AnimatedCard,
  useScrollAnimation,
  addExtendedAnimations
}; 