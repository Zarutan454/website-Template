import { useState, useEffect, useRef } from 'react';
import GlowingParticles from './animations/GlowingParticles';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hoverButton, setHoverButton] = useState(false);
  const heroRef = useRef(null);

  // Countdown timer logic
  useEffect(() => {
    // Set launch date - example: 3 months from now
    const launchDate = new Date();
    launchDate.setMonth(launchDate.getMonth() + 3);
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate - now;
      
      if (difference <= 0) {
        clearInterval(timer);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

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
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-[#050520] pt-20"
    >
      {/* Modern Blockchain Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050520] to-black"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(0, 162, 255, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 162, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating Hexagons */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`hex-${i}`}
            className="absolute opacity-10"
            style={{
              top: `${20 + (i * 10)}%`,
              left: `${10 + (i * 12)}%`,
              animation: `float-hex ${8 + i * 2}s infinite ease-in-out`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border border-[#00A2FF]/30 transform rotate-45"></div>
              <div className="absolute inset-2 border border-[#00A2FF]/20 transform rotate-45"></div>
            </div>
          </div>
        ))}

        {/* Connection Lines */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#00A2FF]/20 to-transparent"
            style={{
              top: `${30 + (i * 8)}%`,
              left: `${5 + (i * 15)}%`,
              width: `${100 + i * 20}px`,
              transform: `rotate(${i * 15}deg)`,
              animation: `pulse-line ${4 + i}s infinite ease-in-out`,
              animationDelay: `${i * 0.3}s`
            }}
          ></div>
        ))}

        {/* Subtle Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-[#00A2FF]/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `gentle-float ${6 + Math.random() * 4}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 3}s`
            }}
          ></div>
        ))}

        {/* Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00A2FF]/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content container with better spacing */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center py-16">
        {/* Central blockchain symbol with enhanced glow */}
        <div className={`transition-all duration-1000 ease-out transform mb-8 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative">
            {/* Enhanced main blockchain icon with glow */}
            <div className="absolute inset-0 blur-3xl bg-[#00a2ff]/20 rounded-full animate-pulse-glow"></div>
            
            {/* BSN Logo/Symbol with enhanced animation */}
            <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center group">
              <div className="relative">
                {/* Outer hexagon with pulsing glow */}
                <div className="w-36 h-36 md:w-48 md:h-48 relative transition-all duration-500 group-hover:scale-105">
                  {/* Glow Effect */}
                  <div className="absolute -inset-4 bg-[#00A2FF]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Outer Hexagon with Glow */}
                  <div className="absolute inset-0">
                    <div className="w-full h-full border-2 border-[#00A2FF] rounded-lg transform rotate-45 opacity-40 animate-pulse group-hover:opacity-60 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00A2FF]/20 to-transparent rounded-lg group-hover:from-[#00A2FF]/30 group-hover:to-[#0077FF]/20 transition-all duration-300"></div>
                  </div>
                  
                  {/* Inner Hexagon with Gradient */}
                  <div className="absolute inset-2">
                    <div className="w-full h-full bg-gradient-to-br from-[#00A2FF]/10 to-[#0077FF]/5 rounded-lg transform rotate-45 group-hover:rotate-90 transition-transform duration-700"></div>
                  </div>
                  
                  {/* BSN Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center transform group-hover:scale-110 transition-transform duration-500">
                      <span className="text-4xl md:text-6xl font-light text-[#00A2FF] tracking-widest group-hover:text-white transition-colors duration-300">BSN</span>
                      <div className="text-xs md:text-sm text-[#8aa0ff] tracking-widest font-mono mt-1 group-hover:text-[#00A2FF] transition-colors duration-300">NETWORK</div>
                    </div>
                  </div>
                  
                  {/* Orbiting Elements */}
                  <div className="absolute inset-0 animate-spin-slow group-hover:animate-spin-slow-faster">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00A2FF] rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00A2FF] rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00A2FF] rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00A2FF] rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300"></div>
                  </div>
                  
                  {/* Secondary Orbiting Ring */}
                  <div className="absolute inset-0 animate-spin-slow-reverse group-hover:animate-spin-slow-reverse-faster">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#00A2FF] rounded-full opacity-40 group-hover:opacity-80 group-hover:scale-150 transition-all duration-300"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[#00A2FF] rounded-full opacity-40 group-hover:opacity-80 group-hover:scale-150 transition-all duration-300"></div>
                  </div>

                  {/* Connection Lines */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-1/2 left-1/2 w-[1px] h-1/2 bg-gradient-to-b from-[#00A2FF]/0 via-[#00A2FF]/50 to-[#00A2FF]/0 transform -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-[1px] h-1/2 bg-gradient-to-t from-[#00A2FF]/0 via-[#00A2FF]/50 to-[#00A2FF]/0 transform -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-gradient-to-r from-[#00A2FF]/0 via-[#00A2FF]/50 to-[#00A2FF]/0 transform -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-gradient-to-l from-[#00A2FF]/0 via-[#00A2FF]/50 to-[#00A2FF]/0 transform -translate-y-1/2"></div>
                  </div>

                  {/* Particle Effects */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#00A2FF] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `float ${2 + Math.random() * 3}s infinite`,
                          animationDelay: `${Math.random() * 2}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Text overlay with enhanced typography and animation */}
        <div className="text-center z-20 max-w-5xl mx-auto">
          <h1 
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wider font-light mb-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{
              background: 'linear-gradient(to right, #ffffff, #00a2ff, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 162, 255, 0.3)'
            }}
          >
            BSN – DEZENTRALISIERTES<br className="hidden sm:block" /> SOCIAL NETWORK
          </h1>
          <p 
            className={`text-base sm:text-lg md:text-xl text-[#a0e4ff] tracking-wider font-light max-w-3xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            Erlebe Social Media neu: Mining-basierte Belohnungen, integrierte Wallets, 
            NFT- und Token-Optionen. Trete jetzt der Community bei!
          </p>
          <div 
            className={`mt-6 flex flex-wrap justify-center gap-2 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <span className="px-3 py-1 bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] text-xs tracking-wider rounded-full">BLOCKCHAIN</span>
            <span className="px-3 py-1 bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] text-xs tracking-wider rounded-full">WEB3</span>
            <span className="px-3 py-1 bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] text-xs tracking-wider rounded-full">PRIVACY</span>
          </div>
          
          {/* Enhanced CTA Button */}
          <div 
            className={`mt-8 md:mt-10 flex justify-center transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <a 
              href="#join-waitlist"
              className={`relative group overflow-hidden bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white px-6 sm:px-10 py-3 rounded-full text-sm sm:text-lg font-medium tracking-wider transition-all duration-500 shadow-lg shadow-[#00a2ff]/20 hover:shadow-[#00a2ff]/40 transform ${hoverButton ? 'translate-y-[-2px]' : ''}`}
              onMouseEnter={() => setHoverButton(true)}
              onMouseLeave={() => setHoverButton(false)}
            >
              <span className="relative z-10">JETZT REGISTRIEREN</span>
              
              {/* Button animation effect */}
              <span className={`absolute inset-0 w-full h-full bg-white/10 transition-all duration-300 ${hoverButton ? 'scale-x-100' : 'scale-x-0'} origin-left`}></span>
              
              {/* Particle effects */}
              {hoverButton && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <span 
                      key={i}
                      className="absolute w-1 h-1 bg-white/60 rounded-full animate-ping"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${0.5 + Math.random() * 1}s`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    ></span>
                  ))}
                </>
              )}
            </a>
          </div>
          
          {/* Countdown Timer - Improved styling */}
          <div 
            className={`mt-8 md:mt-10 transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <p className="text-[#00a2ff] text-sm mb-3 tracking-wider font-medium">PLATFORM LAUNCH IN</p>
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {Object.entries(countdown).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#00a2ff]/10 border border-[#00a2ff]/30 rounded-lg flex items-center justify-center shadow-lg shadow-[#00a2ff]/5">
                    <span className="text-xl sm:text-2xl text-white font-light">{value.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="text-xs text-[#00a2ff] mt-1 uppercase font-medium">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-700 delay-1300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-[#00a2ff]/60 rounded-full mt-2 animate-bounce"></div>
        </div>
        <p className="text-white/50 text-xs mt-2 text-center">SCROLL</p>
      </div>

      {/* Interactive Particle Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <GlowingParticles 
          particleCount={40} 
          minSize={2} 
          maxSize={5} 
          minSpeed={0.1} 
          maxSpeed={0.4} 
          color="#00a2ff" 
          baseOpacity={0.4} 
          glowIntensity={8}
          trails={true}
        />
      </div>

      {/* Global Network Nodes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Network Nodes */}
        {[
          { top: '25%', left: '20%', delay: 0 },
          { top: '30%', left: '80%', delay: 1 },
          { top: '60%', left: '15%', delay: 2 },
          { top: '65%', left: '85%', delay: 3 },
          { top: '45%', left: '10%', delay: 4 },
          { top: '50%', left: '90%', delay: 5 },
          { top: '15%', left: '50%', delay: 6 },
          { top: '75%', left: '50%', delay: 7 }
        ].map((node, i) => (
          <div
            key={`node-${i}`}
            className="absolute"
            style={{
              top: node.top,
              left: node.left,
              animationDelay: `${node.delay}s`
            }}
          >
            {/* Node */}
            <div className="relative">
              <div className="w-4 h-4 bg-[#00A2FF]/40 rounded-full animate-pulse">
                <div className="absolute inset-0 bg-[#00A2FF]/20 rounded-full animate-ping"></div>
              </div>
              
              {/* Connection Line */}
              <div className="absolute top-1/2 left-1/2 w-32 h-px bg-gradient-to-r from-[#00A2FF]/0 via-[#00A2FF]/30 to-[#00A2FF]/0 -translate-x-1/2 -translate-y-1/2 animate-pulse-line"></div>
            </div>
          </div>
        ))}

        {/* Background Stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${3 + Math.random() * 4}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Add these keyframes to your global CSS or Tailwind config */}
      <style jsx>{`
        @keyframes pulse-line {
          0%, 100% {
            opacity: 0.1;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.4;
            transform: scaleX(1.1);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;