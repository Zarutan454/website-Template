// src/components/MagazineSpread.jsx
import { useEffect, useState } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const MagazineSpread = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoverText, setHoverText] = useState(false);
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [isInView, animationStarted]);

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex flex-col md:flex-row bg-black overflow-hidden"
    >
      {/* Decorative geometric elements */}
      <div className={`absolute top-24 left-[5%] w-32 h-32 border border-[#00a2ff]/10 rounded-full ${animationStarted ? 'opacity-30 scale-100' : 'opacity-0 scale-90'} transition-all duration-1800 delay-700`}></div>
      <div className={`absolute bottom-32 right-[15%] w-48 h-48 border border-[#00a2ff]/5 rounded-full ${animationStarted ? 'opacity-20 scale-100' : 'opacity-0 scale-90'} transition-all duration-1800 delay-900`}></div>
      
      {/* Magazine Style Header with hover effect */}
      <div 
        className={`absolute top-8 left-8 z-10 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700 delay-300`}
        onMouseEnter={() => setHoverText(true)}
        onMouseLeave={() => setHoverText(false)}
      >
        <div className="flex items-center group cursor-pointer">
          <span className={`border border-white/30 px-2 py-1 text-white text-xl tracking-widest font-light group-hover:border-[#00a2ff]/50 transition-colors duration-300 ${hoverText ? 'text-[#00a2ff]' : ''}`}>A</span>
          <span className={`ml-3 text-white text-xl tracking-wider font-light group-hover:tracking-widest transition-all duration-300 ${hoverText ? 'text-[#00a2ff]/80' : ''}`}>
            EDITION 2025
            <span className={`block h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-[#00a2ff]/80 to-transparent transition-all duration-500 ${hoverText ? 'w-full' : ''}`}></span>
          </span>
        </div>
        {hoverText && (
          <div className="absolute top-full left-0 mt-2 text-xs font-light text-[#00a2ff]/70 animate-fade-in opacity-0 animate-[fadeIn_0.3s_ease-in_forwards]">
            PREMIER COLLECTION
          </div>
        )}
      </div>
      
      {/* Page Number with decorative line */}
      <div className={`absolute bottom-8 right-8 text-white/50 text-sm ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-500`}>
        <div className="flex items-center">
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white/30 mr-3"></div>
          <span className="font-mono">01</span>
        </div>
      </div>

      {/* Image Side with floating decorative elements */}
      <div className={`w-full md:w-1/2 h-screen ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-1500 ease-in-out`}>
        <div className="h-full w-full relative overflow-hidden">
          {/* Animated decorative elements around the bottle */}
          <div className={`absolute top-1/4 left-1/4 w-16 h-16 rounded-full border border-[#00a2ff]/20 animate-float-slow ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-800`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full border border-[#00a2ff]/10 animate-float ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-1000`}></div>
          
          {/* Subtle radial glow under the bottle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] bg-[#00a2ff]/5 rounded-full blur-3xl opacity-30"></div>
          
          <img 
            src="/assets/images/product-bottle.png" 
            alt="APOXIAZULE bottle" 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[90vh] max-h-[800px] object-contain z-10 hover:scale-105 transition-transform duration-700"
          />
          
          {/* Dynamic grain texture overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-30 mix-blend-overlay pointer-events-none"></div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black opacity-50"></div>
        </div>
      </div>
      
      {/* Vertical Slogan Side with interactive elements */}
      <div className={`w-full md:w-1/2 h-screen flex items-center justify-center ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-1500 delay-300 ease-in-out`}>
        {/* Decorative diagonal lines */}
        <div className="absolute top-20 right-20 w-40 h-[1px] bg-gradient-to-r from-white/5 to-transparent transform rotate-45"></div>
        <div className="absolute bottom-20 left-20 w-40 h-[1px] bg-gradient-to-l from-white/5 to-transparent transform -rotate-45"></div>
        
        <div className="relative h-[80vh] flex items-center">
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-1 h-32">
            <div className="w-full h-full bg-gradient-to-b from-transparent via-[#00a2ff]/30 to-transparent"></div>
          </div>
          
          <h2 
            className="vertical-text text-[calc(5vw+1rem)] md:text-[calc(4vw+1rem)] tracking-tighter leading-none whitespace-nowrap transform -rotate-90 origin-center"
            style={{
              background: "linear-gradient(to right, white, #cceeff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 200
            }}
          >
            More than hydration —<br/>
            <span 
              className="ml-20 relative group"
              onMouseEnter={() => setHoverText(true)}
              onMouseLeave={() => setHoverText(false)}
            >
              it's a moment.
              {hoverText && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00a2ff] to-transparent animate-[fadeIn_0.5s_ease-in_forwards]"></span>
              )}
            </span>
          </h2>
        </div>
      </div>
      
      {/* Page turn effect overlay with improved animation */}
      <div 
        className={`absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent transform origin-bottom-left ${animationStarted ? 'scale-0' : 'scale-100'} transition-all duration-1500 ease-out`}
      ></div>
    </section>
  );
};

export default MagazineSpread;