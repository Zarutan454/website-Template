import { useState, useEffect, useRef } from 'react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-[#050520]"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative">
            {/* The spotlight/glow effect */}
            <div className="absolute inset-0 blur-3xl bg-[#00a2ff]/20 rounded-full"></div>
            
            {/* Product image */}
            <img 
              src="/assets/images/product-bottle.png" 
              alt="APOXIAZULE Hydration Drink" 
              className="relative z-10 h-[70vh] max-h-[600px] object-contain transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
      
      {/* Text overlay */}
      <div className="absolute inset-x-0 bottom-1/4 text-center z-20">
        <h1 
          className={`text-5xl md:text-7xl lg:text-8xl tracking-widest font-light text-white mb-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          ELEVATE HYDRATION
        </h1>
        <p 
          className={`text-lg md:text-xl text-[#a0e4ff] tracking-wider font-light transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          Designed for clarity. Engineered for energy.
        </p>
      </div>
      
      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;