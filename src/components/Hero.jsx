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
      {/* Blockchain network visualization */}
      <div className="absolute inset-0 blockchain-grid opacity-20"></div>
      
      {/* Floating blockchain nodes */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-[#00a2ff]/30 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div className="absolute inset-0 bg-[#00a2ff]/20 rounded-full animate-ping"></div>
          </div>
        ))}
      </div>
      
      {/* Central blockchain symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative">
            {/* Main blockchain icon with glow */}
            <div className="absolute inset-0 blur-3xl bg-[#00a2ff]/20 rounded-full"></div>
            
            {/* BSN Logo/Symbol */}
            <div className="relative z-10 w-64 h-64 flex items-center justify-center">
              <div className="relative">
                {/* Outer hexagon */}
                <div className="w-48 h-48 hexagon bg-gradient-to-br from-[#00a2ff]/20 to-[#0077ff]/10 border border-[#00a2ff]/30 flex items-center justify-center">
                  {/* Inner content */}
                  <div className="text-center">
                    <div className="text-6xl font-light text-[#00a2ff] mb-2">BSN</div>
                    <div className="text-sm text-[#8aa0ff] tracking-widest font-mono">NETWORK</div>
                  </div>
                </div>
                
                {/* Orbiting elements */}
                <div className="absolute inset-0 animate-spin-slow">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-4 h-4 bg-[#00a2ff]/60 rounded-full"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-4 h-4 bg-[#00a2ff]/60 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-4 h-4 bg-[#00a2ff]/60 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 w-4 h-4 bg-[#00a2ff]/60 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Text overlay */}
      <div className="absolute inset-x-0 bottom-1/4 text-center z-20">
        <h1 
          className={`text-5xl md:text-7xl lg:text-8xl tracking-widest font-light text-white mb-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          DECENTRALIZED SOCIAL
        </h1>
        <p 
          className={`text-lg md:text-xl text-[#a0e4ff] tracking-wider font-light transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          Where your data is yours. Where connections are authentic.
        </p>
        <div 
          className={`mt-6 flex justify-center space-x-4 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <span className="px-3 py-1 bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] text-xs tracking-wider rounded-full">BLOCKCHAIN</span>
          <span className="px-3 py-1 bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] text-xs tracking-wider rounded-full">WEB3</span>
          <span className="px-3 py-1 bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] text-xs tracking-wider rounded-full">PRIVACY</span>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-[#00a2ff]/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;