// src/components/PoeticRhythm.jsx
import { useEffect, useState } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const PoeticRhythm = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoverSection, setHoverSection] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track mouse position for interactive blockchain elements
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
      {/* Dynamic blockchain network that follows mouse */}
      <div 
        className={`absolute w-64 h-64 rounded-full bg-[#00a2ff]/5 blur-3xl ${animationStarted ? 'opacity-30' : 'opacity-0'} transition-opacity duration-1000 delay-500 pointer-events-none`}
        style={{
          left: `${mousePosition.x * 60}%`,
          top: `${mousePosition.y * 60}%`,
          transform: 'translate(-50%, -50%)'
        }}
      ></div>

      {/* Magazine Style Elements with blockchain theme */}
      <div className={`absolute top-8 right-8 z-10 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700 delay-300`}>
        <div className="flex items-center">
          <div className="h-[1px] w-6 bg-gradient-to-r from-[#00a2ff]/40 to-white/20 mr-2"></div>
          <span className="text-white/50 text-sm font-mono tracking-widest">02-03</span>
          <div className="h-[1px] w-6 bg-gradient-to-l from-[#00a2ff]/40 to-white/20 ml-2"></div>
          <div className="ml-2 w-2 h-2 hexagon bg-[#00a2ff]/30"></div>
        </div>
      </div>
      
      <div className={`absolute left-8 top-[50vh] z-10 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-600`}>
        <div className="h-40 w-px bg-gradient-to-b from-transparent via-[#00a2ff]/20 to-white/10"></div>
      </div>
      
      <div className={`absolute right-8 top-[150vh] z-10 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-900`}>
        <div className="h-40 w-px bg-gradient-to-b from-transparent via-white/20 to-[#00a2ff]/20"></div>
      </div>

      {/* First Split Section - Decentralized Identity */}
      <div className="h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left Blockchain Visualization */}
        <div className={`w-full md:w-1/2 h-full relative ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'} transition-all duration-1500 ease-out`}>
          <div className="h-full w-full relative overflow-hidden bg-gradient-to-r from-[#050520] to-black">
            {/* Blockchain network visualization */}
            <div className="absolute inset-0 blockchain-grid opacity-20"></div>
            
            {/* Animated blockchain nodes */}
            <div className={`absolute top-[30%] left-[30%] w-36 h-36 hexagon border border-[#00a2ff]/20 opacity-30 ${animationStarted ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '15s' }}></div>
            <div className={`absolute bottom-[35%] right-[35%] w-24 h-24 rounded-full border border-white/5 opacity-40 ${animationStarted ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
            
            {/* Central identity symbol */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40vh] h-[40vh] rounded-full bg-[#00a2ff]/10 blur-3xl opacity-20"></div>
            
            {/* Identity visualization */}
            <div 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out ${hoverSection === 'first-image' ? 'scale-105' : 'scale-100'}`}
              onMouseEnter={() => setHoverSection('first-image')}
              onMouseLeave={() => setHoverSection('')}
            >
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="relative">
                  {/* Identity hexagon */}
                  <div className="w-48 h-48 hexagon bg-gradient-to-br from-[#00a2ff]/20 to-transparent border border-[#00a2ff]/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔐</div>
                      <div className="text-lg text-[#00a2ff] font-mono">IDENTITY</div>
                      <div className="text-xs text-[#8aa0ff] mt-2">DECENTRALIZED</div>
                    </div>
                  </div>
                  
                  {/* Orbiting privacy elements */}
                  <div className="absolute inset-0 animate-spin-slow" style={{animationDuration: '25s'}}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-4 bg-[#00a2ff]/60 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-4 h-4 bg-[#00a2ff]/60 rounded-full"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-4 h-4 bg-[#00a2ff]/60 rounded-full"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-4 h-4 bg-[#00a2ff]/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-30"></div>
          </div>
          
          {/* Caption that appears on hover */}
          <div className={`absolute bottom-10 left-10 z-10 transition-all duration-500 ${hoverSection === 'first-image' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs uppercase tracking-widest text-[#00a2ff]/80 font-light">YOUR DIGITAL IDENTITY</p>
          </div>
        </div>
        
        {/* Right Slogan - Decentralized */}
        <div 
          className={`w-full md:w-1/2 h-full flex items-center justify-center ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1500 delay-300 ease-out relative`}
          onMouseEnter={() => setHoverSection('first-text')}
          onMouseLeave={() => setHoverSection('')}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-5">
            <div className="text-[20rem] font-black text-white/5 select-none rotate-12 transform scale-150">B</div>
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
                True
              </span>
              <span 
                className="block text-[calc(2vw+1.5rem)] md:text-[calc(3vw+2rem)] tracking-tight leading-tight font-extralight"
                style={{
                  textShadow: hoverSection === 'first-text' ? '0 0 15px rgba(0, 162, 255, 0.5)' : 'none',
                  transition: 'text-shadow 0.5s ease-in-out'
                }}
              >
                ownership.
              </span>
            </h2>
            
            {/* Animated line */}
            <div 
              className="mt-6 h-[1px] bg-gradient-to-r from-[#00a2ff]/50 to-transparent transition-all duration-700"
              style={{ width: hoverSection === 'first-text' ? '100%' : '30px' }}
            ></div>
            
            {/* Hover text */}
            <p className={`mt-4 text-sm text-white/70 max-w-xs transition-all duration-500 ${hoverSection === 'first-text' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Your identity, your data, your control. Built on blockchain for ultimate security.
            </p>
          </div>
        </div>
      </div>
      
      {/* Second Split Section - Blockchain Security */}
      <div className="h-screen flex flex-col md:flex-row-reverse overflow-hidden">
        {/* Right Blockchain Security Visualization */}
        <div className={`w-full md:w-1/2 h-full relative ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1500 delay-500 ease-out`}>
          <div className="h-full w-full relative overflow-hidden bg-gradient-to-l from-[#050520] to-black">
            {/* Security grid pattern */}
            <div className="absolute inset-0 blockchain-grid opacity-15"></div>
            
            {/* Security shield visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[60vh] h-[60vh]">
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full transition-opacity duration-1000 delay-800 ${animationStarted ? 'opacity-15' : 'opacity-0'}`}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,3 100,28 100,72 50,97 0,72 0,28" fill="none" stroke="rgba(0, 162, 255, 0.2)" strokeWidth="0.5" className="animate-spin-very-slow" style={{transformOrigin: 'center', animationDuration: '30s'}} />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Security symbol */}
            <div 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${hoverSection === 'second-image' ? 'rotate-0 scale-105' : 'rotate-12 scale-100'}`}
              onMouseEnter={() => setHoverSection('second-image')}
              onMouseLeave={() => setHoverSection('')}
            >
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="relative">
                  {/* Security shield */}
                  <div className="w-48 h-48 hexagon bg-gradient-to-br from-[#00a2ff]/20 to-transparent border border-[#00a2ff]/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🛡️</div>
                      <div className="text-lg text-[#00a2ff] font-mono">SECURE</div>
                      <div className="text-xs text-[#8aa0ff] mt-2">BLOCKCHAIN</div>
                    </div>
                  </div>
                  
                  {/* Security indicators */}
                  <div className="absolute inset-0">
                    <div className="absolute top-4 left-4 w-3 h-3 bg-green-400/60 rounded-full animate-pulse"></div>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-green-400/60 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-green-400/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-400/60 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-l from-black to-transparent opacity-30"></div>
          </div>
          
          {/* Caption that appears on hover */}
          <div className={`absolute bottom-10 right-10 z-10 transition-all duration-500 ${hoverSection === 'second-image' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-right text-xs uppercase tracking-widest text-[#00a2ff]/80 font-light">MILITARY-GRADE SECURITY</p>
          </div>
        </div>
        
        {/* Left Slogan - Secure */}
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
                Unbreakable
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
                security.
              </span>
            </h2>
            
            {/* Animated security indicator */}
            <div 
              className="mt-6 ml-auto h-3 w-3 hexagon bg-[#00a2ff]/70 transition-all duration-500"
              style={{ 
                transform: hoverSection === 'second-text' ? 'scale(1.5)' : 'scale(1)',
                boxShadow: hoverSection === 'second-text' ? '0 0 20px rgba(0, 162, 255, 0.8)' : 'none'
              }}
            ></div>
            
            {/* Hover text */}
            <p className={`mt-4 text-sm text-white/70 transition-all duration-500 ${hoverSection === 'second-text' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Blockchain-powered security that makes your data truly yours.
            </p>
          </div>
        </div>
      </div>
      
      {/* Page transition overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-black via-transparent to-black transform ${animationStarted ? 'opacity-0' : 'opacity-100'} transition-all duration-2000 ease-in-out pointer-events-none`}
      ></div>
    </section>
  );
};

export default PoeticRhythm;