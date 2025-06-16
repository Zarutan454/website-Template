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
          <span className="border border-[#00a2ff]/30 px-2 py-1 text-[#00a2ff]/80 text-xl tracking-widest font-light">B</span>
          <span className="ml-3 text-white/70 text-xl tracking-wider font-light">BACK COVER</span>
        </div>
      </div>
      
      {/* Magazine Page Number */}
      <div className={`absolute bottom-8 right-8 z-10 text-white/50 text-sm ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-500`}>
        <div className="flex items-center">
          <span className="font-mono">05</span>
          <div className="ml-2 w-2 h-2 hexagon bg-[#00a2ff]/30"></div>
        </div>
      </div>
      
      {/* Magazine Style Caption */}
      <div className={`absolute bottom-8 left-8 z-10 max-w-[200px] ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-700`}>
        <p className="text-xs text-white/40 italic">BSN © 2025. Blockchain Social Network for the decentralized future. All rights reserved.</p>
      </div>

      {/* Deep space blockchain background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030312] via-[#0a0a2a] to-[#000000]"></div>
      
      {/* Blockchain network constellation */}
      <div className="absolute inset-0 opacity-50">
        {[...Array(100)].map((_, i) => {
          const size = Math.random() * 2 + 1;
          const opacity = Math.random() * 0.7 + 0.3;
          const top = `${Math.random() * 100}%`;
          const left = `${Math.random() * 100}%`;
          const animationDelay = `${Math.random() * 5}s`;
          const isHexagon = Math.random() > 0.8;
          
          return (
            <div
              key={i}
              className={`absolute ${isHexagon ? 'hexagon bg-[#00a2ff]' : 'rounded-full bg-white'} animate-pulse`}
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
        {/* BSN Network on pedestal */}
        <div className={`mb-16 ${animationStarted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-1500 ease-out`}>
          <div className="relative inline-block">
            {/* Glowing blockchain pedestal */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-[#00a2ff]/20 filter blur-xl rounded-full"></div>
            
            {/* BSN Network Symbol */}
            <div className="relative z-10 mx-auto flex justify-center animate-float">
              <div className="w-80 h-80 flex items-center justify-center">
                <div className="relative">
                  {/* Main BSN hexagon */}
                  <div className="w-64 h-64 hexagon bg-gradient-to-br from-[#00a2ff]/20 to-transparent border-2 border-[#00a2ff]/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-light text-[#00a2ff] mb-4">BSN</div>
                      <div className="text-lg text-[#8aa0ff] tracking-widest font-mono">NETWORK</div>
                      <div className="mt-4 flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-[#00a2ff]/60 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-[#00a2ff]/60 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        <div className="w-3 h-3 bg-[#00a2ff]/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Orbiting blockchain elements */}
                  <div className="absolute inset-0 animate-spin-slow" style={{animationDuration: '20s'}}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 w-8 h-8 hexagon bg-[#00a2ff]/40 border border-[#00a2ff]/60"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 w-8 h-8 hexagon bg-[#00a2ff]/40 border border-[#00a2ff]/60"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 w-8 h-8 hexagon bg-[#00a2ff]/40 border border-[#00a2ff]/60"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 w-8 h-8 hexagon bg-[#00a2ff]/40 border border-[#00a2ff]/60"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Radial blockchain glow */}
            <div className="absolute inset-0 bg-gradient-radial from-[#00a2ff]/10 to-transparent rounded-full filter blur-xl"></div>
          </div>
        </div>
        
        {/* CTA Text */}
        <div className={`max-w-2xl mx-auto ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1500 delay-300 ease-out`}>
          <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
            It's not just social media.<br />
            <span className="text-[#00a2ff]">It's your digital sovereignty.</span>
          </h2>
          
          {/* Feature highlights */}
          <div className="flex justify-center space-x-6 mb-8 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 hexagon bg-[#00a2ff]/60 mr-2"></div>
              <span className="text-[#8aa0ff]">Own Your Data</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 hexagon bg-[#00a2ff]/60 mr-2"></div>
              <span className="text-[#8aa0ff]">Earn Tokens</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 hexagon bg-[#00a2ff]/60 mr-2"></div>
              <span className="text-[#8aa0ff]">True Privacy</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className={`mt-12 flex flex-col sm:flex-row gap-4 justify-center ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1500 delay-700 ease-out`}>
            <button className="relative bg-[#00a2ff] text-black px-8 py-3 rounded-sm overflow-hidden group font-medium">
              <span className="relative z-10 text-lg tracking-widest uppercase">Join BSN</span>
              <div className="absolute inset-0 bg-[#0077ff] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </button>
            
            <button className="relative bg-transparent border border-[#00a2ff]/30 text-white px-8 py-3 rounded-sm overflow-hidden group">
              <span className="relative z-10 text-lg tracking-widest uppercase font-light">Learn More</span>
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