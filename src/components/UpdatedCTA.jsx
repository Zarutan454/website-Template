// src/components/UpdatedCTA.jsx
import { useEffect, useState } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const UpdatedCTA = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [isInView, animationStarted]);

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Magazine Style Back Cover Elements */}
      <div className={`absolute top-8 left-8 z-10 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700 delay-300`}>
        <div className="flex items-center">
          <span className="border border-[#00a2ff]/30 px-2 py-1 text-[#00a2ff]/80 text-xl tracking-widest font-light">A</span>
          <span className="ml-3 text-white/70 text-xl tracking-wider font-light">BACK COVER</span>
        </div>
      </div>
      
      {/* Magazine Page Number */}
      <div className={`absolute bottom-8 right-8 z-10 text-white/50 text-sm ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-500`}>
        <span className="font-mono">05</span>
      </div>
      
      {/* Magazine Style Caption */}
      <div className={`absolute bottom-8 left-8 z-10 max-w-[200px] ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-700`}>
        <p className="text-xs text-white/40 italic">APOXIAZULE © 2025. Luxury hydration for the modern world. All rights reserved.</p>
      </div>
      {/* Deep space gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030312] via-[#0a0a2a] to-[#000000]"></div>
      
      {/* Star field effect */}
      <div className="absolute inset-0 opacity-50">
        {[...Array(100)].map((_, i) => {
          const size = Math.random() * 2 + 1;
          const opacity = Math.random() * 0.7 + 0.3;
          const top = `${Math.random() * 100}%`;
          const left = `${Math.random() * 100}%`;
          const animationDelay = `${Math.random() * 5}s`;
          
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top,
                left,
                opacity,
                animationDelay,
              }}
            ></div>
          );
        })}
      </div>
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Product on pedestal */}
        <div className={`mb-16 ${animationStarted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-1500 ease-out`}>
          <div className="relative inline-block">
            {/* Glowing pedestal */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-[#00a2ff]/20 filter blur-xl rounded-full"></div>
            
            {/* Bottle image */}
            <img 
              src="/assets/images/product-bottle.png" 
              alt="APOXIAZULE bottle" 
              className="relative z-10 h-[50vh] max-h-[500px] mx-auto object-contain animate-float"
            />
            
            {/* Radial glow */}
            <div className="absolute inset-0 bg-gradient-radial from-[#00a2ff]/10 to-transparent rounded-full filter blur-xl"></div>
          </div>
        </div>
        
        {/* CTA Text */}
        <div className={`max-w-2xl mx-auto ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1500 delay-300 ease-out`}>
          <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
            It's not just a drink.<br />
            <span className="text-[#00a2ff]">It's the future in a bottle.</span>
          </h2>
          
          {/* CTA Button */}
          <div className={`mt-12 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1500 delay-700 ease-out`}>
            <button className="relative bg-transparent border border-[#00a2ff]/30 text-white px-10 py-3 rounded-sm overflow-hidden group">
              <span className="relative z-10 text-lg tracking-widest uppercase font-light">Get Yours</span>
              <div className="absolute inset-0 bg-[#00a2ff]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00a2ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdatedCTA;