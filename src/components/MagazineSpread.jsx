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
      {/* Blockchain network decorative elements */}
      <div className={`absolute top-24 left-[5%] w-32 h-32 border border-[#00a2ff]/10 hexagon ${animationStarted ? 'opacity-30 scale-100' : 'opacity-0 scale-90'} transition-all duration-1800 delay-700`}></div>
      <div className={`absolute bottom-32 right-[15%] w-48 h-48 border border-[#00a2ff]/5 rounded-full ${animationStarted ? 'opacity-20 scale-100' : 'opacity-0 scale-90'} transition-all duration-1800 delay-900`}></div>
      
      {/* Magazine Style Header with blockchain theme */}
      <div 
        className={`absolute top-8 left-8 z-10 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700 delay-300`}
        onMouseEnter={() => setHoverText(true)}
        onMouseLeave={() => setHoverText(false)}
      >
        <div className="flex items-center group cursor-pointer">
          <span className={`border border-white/30 px-2 py-1 text-white text-xl tracking-widest font-light group-hover:border-[#00a2ff]/50 transition-colors duration-300 ${hoverText ? 'text-[#00a2ff]' : ''}`}>B</span>
          <span className={`ml-3 text-white text-xl tracking-wider font-light group-hover:tracking-widest transition-all duration-300 ${hoverText ? 'text-[#00a2ff]/80' : ''}`}>
            BLOCKCHAIN 2025
            <span className={`block h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-[#00a2ff]/80 to-transparent transition-all duration-500 ${hoverText ? 'w-full' : ''}`}></span>
          </span>
        </div>
        {hoverText && (
          <div className="absolute top-full left-0 mt-2 text-xs font-light text-[#00a2ff]/70 animate-fade-in opacity-0 animate-[fadeIn_0.3s_ease-in_forwards]">
            DECENTRALIZED EDITION
          </div>
        )}
      </div>
      
      {/* Page Number with blockchain styling */}
      <div className={`absolute bottom-8 right-8 text-white/50 text-sm ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-500`}>
        <div className="flex items-center">
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#00a2ff]/30 mr-3"></div>
          <span className="font-mono">01</span>
          <div className="ml-2 w-2 h-2 border border-[#00a2ff]/30 rotate-45"></div>
        </div>
      </div>

      {/* Image Side with blockchain visualization */}
      <div className={`w-full md:w-1/2 h-screen ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-1500 ease-in-out`}>
        <div className="h-full w-full relative overflow-hidden">
          {/* Blockchain network visualization */}
          <div className="absolute inset-0 blockchain-grid opacity-10"></div>
          
          {/* Animated blockchain nodes */}
          <div className={`absolute top-1/4 left-1/4 w-16 h-16 hexagon border border-[#00a2ff]/20 animate-float-slow ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-800`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full border border-[#00a2ff]/10 animate-float ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-1000`}></div>
          
          {/* Central blockchain symbol */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] bg-[#00a2ff]/5 rounded-full blur-3xl opacity-30"></div>
          
          {/* Main BSN symbol */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-80 h-80 flex items-center justify-center">
              <div className="relative">
                {/* Large hexagon container */}
                <div className="w-64 h-64 hexagon bg-gradient-to-br from-[#00a2ff]/10 to-transparent border border-[#00a2ff]/20 flex items-center justify-center hover:scale-105 transition-transform duration-700">
                  <div className="text-center">
                    <div className="text-8xl font-light text-[#00a2ff] mb-4">BSN</div>
                    <div className="text-lg text-[#8aa0ff] tracking-widest font-mono">NETWORK</div>
                    <div className="mt-4 flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-[#00a2ff]/60 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-[#00a2ff]/60 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="w-2 h-2 bg-[#00a2ff]/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                  </div>
                </div>
                
                {/* Orbiting blockchain elements */}
                <div className="absolute inset-0 animate-spin-slow" style={{animationDuration: '20s'}}>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-6 h-6 hexagon bg-[#00a2ff]/40 border border-[#00a2ff]/60"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-6 h-6 hexagon bg-[#00a2ff]/40 border border-[#00a2ff]/60"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-6 h-6 hexagon bg-[#00a2ff]/40 border border-[#00a2ff]/60"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-6 h-6 hexagon bg-[#00a2ff]/40 border border-[#00a2ff]/60"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black opacity-50"></div>
        </div>
      </div>
      
      {/* Vertical Slogan Side with blockchain messaging */}
      <div className={`w-full md:w-1/2 h-screen flex items-center justify-center ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-1500 delay-300 ease-in-out`}>
        {/* Decorative blockchain elements */}
        <div className="absolute top-20 right-20 w-40 h-[1px] bg-gradient-to-r from-[#00a2ff]/20 to-transparent transform rotate-45"></div>
        <div className="absolute bottom-20 left-20 w-40 h-[1px] bg-gradient-to-l from-[#00a2ff]/20 to-transparent transform -rotate-45"></div>
        
        <div className="relative h-[80vh] flex items-center">
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-1 h-32">
            <div className="w-full h-full bg-gradient-to-b from-transparent via-[#00a2ff]/30 to-transparent"></div>
          </div>
          
          <h2 
            className="vertical-text text-[calc(5vw+1rem)] md:text-[calc(4vw+1rem)] tracking-tighter leading-none whitespace-nowrap transform -rotate-90 origin-center"
            style={{
              background: "linear-gradient(to right, white, #00a2ff, #cceeff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 200
            }}
          >
            More than social media —<br/>
            <span 
              className="ml-20 relative group"
              onMouseEnter={() => setHoverText(true)}
              onMouseLeave={() => setHoverText(false)}
            >
              it's your digital identity.
              {hoverText && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00a2ff] to-transparent animate-[fadeIn_0.5s_ease-in_forwards]"></span>
              )}
            </span>
          </h2>
        </div>
      </div>
      
      {/* Page turn effect overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent transform origin-bottom-left ${animationStarted ? 'scale-0' : 'scale-100'} transition-all duration-1500 ease-out`}
      ></div>
    </section>
  );
};

export default MagazineSpread;