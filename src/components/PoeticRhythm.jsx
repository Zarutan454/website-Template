// src/components/PoeticRhythm.jsx
import { useEffect, useState } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const PoeticRhythm = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoverSection, setHoverSection] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track mouse position for interactive elements
  const handleMouseMove = (e) => {
    setMousePosition({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    });
  };
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isInView, animationStarted]);

  return (
    <section 
      ref={ref}
      className="relative min-h-[200vh] bg-black"
    >
      {/* Dynamic geometric decorations that follow mouse movement */}
      <div 
        className={`absolute w-64 h-64 rounded-full bg-[#00a2ff]/5 blur-3xl ${animationStarted ? 'opacity-30' : 'opacity-0'} transition-opacity duration-1000 delay-500 pointer-events-none`}
        style={{
          left: `${mousePosition.x * 60}%`,
          top: `${mousePosition.y * 60}%`,
          transform: 'translate(-50%, -50%)'
        }}
      ></div>

      {/* Magazine Style Elements with enhanced styling */}
      <div className={`absolute top-8 right-8 z-10 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700 delay-300`}>
        <div className="flex items-center">
          <div className="h-[1px] w-6 bg-gradient-to-r from-[#00a2ff]/40 to-white/20 mr-2"></div>
          <span className="text-white/50 text-sm font-mono tracking-widest">02-03</span>
          <div className="h-[1px] w-6 bg-gradient-to-l from-[#00a2ff]/40 to-white/20 ml-2"></div>
        </div>
      </div>
      
      <div className={`absolute left-8 top-[50vh] z-10 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-600`}>
        <div className="h-40 w-px bg-gradient-to-b from-transparent via-[#00a2ff]/20 to-white/10"></div>
      </div>
      
      <div className={`absolute right-8 top-[150vh] z-10 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-900`}>
        <div className="h-40 w-px bg-gradient-to-b from-transparent via-white/20 to-[#00a2ff]/20"></div>
      </div>

      {/* First Split Section */}
      <div className="h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left Image with decorative elements */}
        <div className={`w-full md:w-1/2 h-full relative ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'} transition-all duration-1500 ease-out`}>
          <div className="h-full w-full relative overflow-hidden bg-gradient-to-r from-[#050520] to-black">
            {/* Decorative elements around bottle */}
            <div className={`absolute top-[30%] left-[30%] w-36 h-36 rounded-full border border-[#00a2ff]/10 opacity-30 ${animationStarted ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '15s' }}></div>
            <div className={`absolute bottom-[35%] right-[35%] w-24 h-24 rounded-full border border-white/5 opacity-40 ${animationStarted ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
            
            {/* Subtle glow effect around bottle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40vh] h-[40vh] rounded-full bg-[#00a2ff]/10 blur-3xl opacity-20"></div>
            
            <img 
              src="/assets/images/product-bottle.png" 
              alt="APOXIAZULE lifestyle" 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[80vh] object-contain opacity-90 transition-all duration-700 ease-in-out ${hoverSection === 'first-image' ? 'scale-105' : 'scale-100'}`}
              onMouseEnter={() => setHoverSection('first-image')}
              onMouseLeave={() => setHoverSection('')}
            />
            
            {/* Dynamic texture overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-30"></div>
          </div>
          
          {/* Caption that appears on hover */}
          <div className={`absolute bottom-10 left-10 z-10 transition-all duration-500 ${hoverSection === 'first-image' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs uppercase tracking-widest text-[#00a2ff]/80 font-light">BOTTLED ELEGANCE</p>
          </div>
        </div>
        
        {/* Right Slogan with enhanced typography */}
        <div 
          className={`w-full md:w-1/2 h-full flex items-center justify-center ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1500 delay-300 ease-out relative`}
          onMouseEnter={() => setHoverSection('first-text')}
          onMouseLeave={() => setHoverSection('')}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-5">
            <div className="text-[20rem] font-black text-white/5 select-none rotate-12 transform scale-150">A</div>
          </div>
          
          <div className="relative">
            <h2 className="relative">
              <span 
                className="block text-[calc(2vw+1.5rem)] md:text-[calc(3vw+2rem)] tracking-tight leading-tight font-thin mb-2"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 30%, #00a2ff 70%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Cold
              </span>
              <span 
                className="block text-[calc(2vw+1.5rem)] md:text-[calc(3vw+2rem)] tracking-tight leading-tight font-extralight"
                style={{
                  textShadow: hoverSection === 'first-text' ? '0 0 15px rgba(0, 162, 255, 0.5)' : 'none',
                  transition: 'text-shadow 0.5s ease-in-out'
                }}
              >
                clarity.
              </span>
            </h2>
            
            {/* Line that animates on hover */}
            <div 
              className="mt-6 h-[1px] bg-gradient-to-r from-[#00a2ff]/50 to-transparent transition-all duration-700"
              style={{ width: hoverSection === 'first-text' ? '100%' : '30px' }}
            ></div>
            
            {/* Text that appears on hover */}
            <p className={`mt-4 text-sm text-white/70 max-w-xs transition-all duration-500 ${hoverSection === 'first-text' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Precisely formulated for those moments when focus matters most.
            </p>
          </div>
        </div>
      </div>
      
      {/* Second Split Section */}
      <div className="h-screen flex flex-col md:flex-row-reverse overflow-hidden">
        {/* Right Image */}
        <div className={`w-full md:w-1/2 h-full relative ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1500 delay-500 ease-out`}>
          <div className="h-full w-full relative overflow-hidden bg-gradient-to-l from-[#050520] to-black">
            {/* Hexagonal decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[60vh] h-[60vh]">
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full transition-opacity duration-1000 delay-800 ${animationStarted ? 'opacity-15' : 'opacity-0'}`}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,3 100,28 100,72 50,97 0,72 0,28" fill="none" stroke="rgba(0, 162, 255, 0.2)" strokeWidth="0.5" className="animate-spin-very-slow" style={{transformOrigin: 'center', animationDuration: '30s'}} />
                  </svg>
                </div>
              </div>
            </div>
            
            <img 
              src="/assets/images/product-bottle.png" 
              alt="APOXIAZULE lifestyle" 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[80vh] object-contain opacity-90 rotate-12 transition-all duration-700 ${hoverSection === 'second-image' ? 'rotate-0 scale-105' : 'rotate-12 scale-100'}`}
              onMouseEnter={() => setHoverSection('second-image')}
              onMouseLeave={() => setHoverSection('')}
            />
            
            {/* Gradient lighting effects */}
            <div className="absolute inset-0 bg-gradient-radial from-[#00a2ff]/10 to-transparent opacity-30 mix-blend-overlay" style={{top: '30%', left: '30%', width: '40%', height: '40%'}}></div>
            <div className="absolute inset-0 bg-gradient-to-l from-black to-transparent opacity-30"></div>
          </div>
          
          {/* Caption that appears on hover */}
          <div className={`absolute bottom-10 right-10 z-10 transition-all duration-500 ${hoverSection === 'second-image' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-right text-xs uppercase tracking-widest text-[#00a2ff]/80 font-light">ENGINEERED REFINEMENT</p>
          </div>
        </div>
        
        {/* Left Slogan with alternative typography */}
        <div 
          className={`w-full md:w-1/2 h-full flex items-center justify-center ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'} transition-all duration-1500 delay-800 ease-out`}
          onMouseEnter={() => setHoverSection('second-text')}
          onMouseLeave={() => setHoverSection('')}
        >
          <div className="relative text-right">
            <h2 className="relative">
              <span 
                className="block text-[calc(2vw+1.5rem)] md:text-[calc(3vw+2rem)] tracking-tight leading-tight font-light mb-2 uppercase letter-spacing-wider"
                style={{
                  color: '#ffffff'
                }}
              >
                Silent
              </span>
              <span 
                className="block text-[calc(2vw+1.5rem)] md:text-[calc(3vw+2rem)] tracking-tight leading-tight"
                style={{
                  fontFamily: '"Times New Roman", serif',
                  fontStyle: 'italic',
                  color: hoverSection === 'second-text' ? '#00a2ff' : 'white',
                  transition: 'color 0.5s ease-in-out'
                }}
              >
                strength.
              </span>
            </h2>
            
            {/* Animated dot decoration */}
            <div 
              className="mt-6 ml-auto h-3 w-3 rounded-full bg-[#00a2ff]/70 transition-all duration-500"
              style={{ 
                transform: hoverSection === 'second-text' ? 'scale(1.5)' : 'scale(1)',
                boxShadow: hoverSection === 'second-text' ? '0 0 20px rgba(0, 162, 255, 0.8)' : 'none'
              }}
            ></div>
            
            {/* Text that appears on hover */}
            <p className={`mt-4 text-sm text-white/70 transition-all duration-500 ${hoverSection === 'second-text' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              The subtle power of precision engineering in every drop.
            </p>
          </div>
        </div>
      </div>
      
      {/* Page transition overlay with enhanced animation */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-black via-transparent to-black transform ${animationStarted ? 'opacity-0' : 'opacity-100'} transition-all duration-2000 ease-in-out pointer-events-none`}
      ></div>
    </section>
  );
};

export default PoeticRhythm;