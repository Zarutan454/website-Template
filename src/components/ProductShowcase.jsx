// src/components/ProductShowcase.jsx
import { useEffect, useState, useRef } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const ProductShowcase = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoverState, setHoverState] = useState('');
  const networkRef = useRef(null);
  
  // Interactive blockchain network animation
  const handleMouseMove = (e) => {
    if (networkRef.current) {
      const bounds = networkRef.current.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      
      const rotateX = (mouseY - centerY) / 50;
      const rotateY = (centerX - mouseX) / 50;
      
      networkRef.current.style.transform = `rotate3d(1, 0, 0, ${rotateX}deg) rotate3d(0, 1, 0, ${rotateY}deg)`;
    }
  };
  
  const handleMouseLeave = () => {
    if (networkRef.current) {
      networkRef.current.style.transform = 'rotate3d(0, 0, 0, 0deg)';
    }
  };
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [isInView, animationStarted]);

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Blockchain network grid background */}
      <div className="absolute inset-0 blockchain-grid opacity-10"></div>
      
      {/* Magazine Style Header */}
      <div 
        className={`absolute top-8 left-8 z-20 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700 delay-300`}
        onMouseEnter={() => setHoverState('header')}
        onMouseLeave={() => setHoverState('')}
      >
        <div className="flex items-center">
          <div className={`h-4 w-4 hexagon border border-[#00a2ff]/30 transition-all duration-300 ${hoverState === 'header' ? 'rotate-45 bg-[#00a2ff]/10' : ''}`}></div>
          <span className="ml-3 text-white/70 text-sm font-mono tracking-widest">FEATURE <span className="text-[#00a2ff]/70">|</span> BLOCKCHAIN NETWORK</span>
        </div>
      </div>
      
      {/* Page Number */}
      <div className={`absolute bottom-8 right-8 z-20 text-white/50 text-sm ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-500`}>
        <div className="flex items-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#00a2ff]/30 mr-2"></div>
          <span className="font-mono tracking-widest">04</span>
          <div className="ml-2 w-2 h-2 hexagon bg-[#00a2ff]/30"></div>
        </div>
      </div>
      
      {/* Decorative blockchain elements */}
      <div className={`absolute top-0 right-24 h-32 w-px bg-gradient-to-b from-transparent via-[#00a2ff]/30 to-transparent transform rotate-45 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-700`}></div>
      <div className={`absolute bottom-0 left-1/4 h-40 w-px bg-gradient-to-t from-transparent via-white/10 to-transparent transform -rotate-45 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-900`}></div>
      <div className={`absolute top-1/4 right-1/3 w-24 h-24 hexagon border border-white/5 ${animationStarted ? 'animate-spin-slow opacity-20' : 'opacity-0'} transition-opacity duration-700 delay-1100`} style={{ animationDuration: '30s' }}></div>
      
      {/* Enhanced background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050520] to-black opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,162,255,0.1),transparent_70%)] opacity-60"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="flex flex-col items-center">
          {/* Interactive Blockchain Network Visualization */}
          <div 
            className={`w-full mb-8 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-1500 ease-out`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative perspective-1000">
              {/* Multiple layered network effects */}
              <div className="absolute inset-0 -top-10 -left-10 -right-10 -bottom-10 bg-[#00a2ff]/10 blur-3xl rounded-full animate-pulse-slow" style={{ animationDuration: '8s' }}></div>
              <div className="absolute inset-0 -top-12 -left-12 -right-12 -bottom-12 bg-[#00a2ff]/5 blur-2xl rounded-full animate-pulse-slow" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
              
              {/* Main BSN Network Visualization */}
              <div 
                className="relative z-10 mx-auto flex justify-center"
                onMouseEnter={() => setHoverState('network')}
                onMouseLeave={() => setHoverState('')}
              >
                <div 
                  ref={networkRef}
                  className="relative w-[70vh] max-w-[600px] h-[70vh] max-h-[600px] flex items-center justify-center"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Central BSN Hub */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 hexagon bg-gradient-to-br from-[#00a2ff]/30 to-[#0077ff]/10 border-2 border-[#00a2ff]/50 flex items-center justify-center animate-pulse-glow">
                      <div className="text-center">
                        <div className="text-2xl font-light text-[#00a2ff]">BSN</div>
                        <div className="text-xs text-[#8aa0ff] font-mono">HUB</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Orbiting Network Nodes */}
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const radius = 200;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <div
                        key={i}
                        className="absolute w-16 h-16 hexagon bg-[#00a2ff]/20 border border-[#00a2ff]/40 flex items-center justify-center animate-float"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                          animationDelay: `${i * 0.5}s`
                        }}
                      >
                        <div className="w-2 h-2 bg-[#00a2ff]/80 rounded-full animate-pulse"></div>
                      </div>
                    );
                  })}
                  
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'translate3d(0,0,0)' }}>
                    {[...Array(8)].map((_, i) => {
                      const angle = (i * 45) * (Math.PI / 180);
                      const radius = 200;
                      const x = Math.cos(angle) * radius + 300;
                      const y = Math.sin(angle) * radius + 300;
                      
                      return (
                        <line
                          key={i}
                          x1="50%"
                          y1="50%"
                          x2={x}
                          y2={y}
                          stroke="rgba(0, 162, 255, 0.2)"
                          strokeWidth="1"
                          className="animate-pulse"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Data flow particles */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-[#00a2ff]/60 rounded-full animate-blockchain-flow"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${10 + Math.random() * 10}s`
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Interactive labels */}
                <div 
                  className={`absolute left-1/4 top-1/2 transform -translate-y-1/2 transition-all duration-500 ${hoverState === 'network' ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-10'}`}
                >
                  <div className="h-[1px] w-12 bg-[#00a2ff]/40"></div>
                  <p className="mt-2 text-xs uppercase tracking-widest text-[#00a2ff]/80 font-light rotate-90 origin-left transform translate-y-6">DECENTRALIZED</p>
                </div>
                
                <div 
                  className={`absolute right-1/4 bottom-1/3 transform transition-all duration-500 ${hoverState === 'network' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                >
                  <div className="h-[1px] w-12 bg-[#00a2ff]/40"></div>
                  <p className="mt-2 text-xs uppercase tracking-widest text-[#00a2ff]/80 font-light -rotate-90 origin-right transform translate-y-6">SECURE NETWORK</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced blockchain manifesto text */}
          <div className={`w-full md:w-3/4 mx-auto text-center ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-1500 delay-300 ease-out`}>
            <div 
              className="relative"
              onMouseEnter={() => setHoverState('text')}
              onMouseLeave={() => setHoverState('')}
            >
              {/* Decorative elements */}
              <div className={`absolute -left-8 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[#00a2ff]/20 to-transparent transition-all duration-500 ${hoverState === 'text' ? 'opacity-100 scale-y-100' : 'opacity-30 scale-y-50'}`}></div>
              <div className={`absolute -right-8 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[#00a2ff]/20 to-transparent transition-all duration-500 ${hoverState === 'text' ? 'opacity-100 scale-y-100' : 'opacity-30 scale-y-50'}`}></div>
              
              <h2 className="relative text-4xl md:text-6xl font-extralight tracking-tight mb-8 leading-none">
                <span className="block text-white">Built for Web3.</span>
                <span 
                  className="block relative"
                  style={{
                    background: 'linear-gradient(135deg, #00a2ff 0%, #0077ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Designed for tomorrow.
                  <div className={`absolute -right-12 top-1/2 transform -translate-y-1/2 transition-all duration-500 ${hoverState === 'text' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}>
                    <div className="h-[1px] w-8 bg-[#00a2ff]"></div>
                  </div>
                </span>
              </h2>
              
              <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-8 mx-auto max-w-2xl">
                We don't just connect people. We <span className="text-white font-normal">empower</span> them. BSN represents a paradigm shift where social networking meets blockchain technology, creating unprecedented digital sovereignty.
              </p>
              
              <div className={`w-24 h-[1px] bg-gradient-to-r from-[#00a2ff]/80 to-transparent mb-8 mx-auto transition-all duration-700 ${hoverState === 'text' ? 'w-40' : 'w-24'}`}></div>
              
              <div className="flex justify-center items-center">
                <p className="text-sm uppercase tracking-widest text-[#00a2ff]/70 font-light">
                  Blockchain Social Architecture
                </p>
                
                <div 
                  className={`ml-4 opacity-0 transition-all duration-500 ${hoverState === 'text' ? 'opacity-100 translate-x-0' : 'translate-x-5'}`}
                >
                  <div className="w-8 h-8 hexagon border border-[#00a2ff]/20 flex items-center justify-center">
                    <div className="w-2 h-2 hexagon bg-[#00a2ff]/70"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;