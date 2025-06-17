// src/components/PoeticRhythm.jsx
import { useEffect, useState, useRef } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const PoeticRhythm = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoverSection, setHoverSection] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef(null);
  
  // Features data
  const features = [
    {
      id: 'identity',
      title: 'Decentralized Identity',
      subtitle: 'True ownership.',
      description: 'Your identity, your data, your control. Built on blockchain for ultimate security and complete ownership. No more centralized data harvesting.',
      icon: '🔐',
      color: '#00a2ff'
    },
    {
      id: 'security',
      title: 'Blockchain Security',
      subtitle: 'Unbreakable trust.',
      description: 'Military-grade encryption with transparent verification. Your data is secured by thousands of nodes across the globe.',
      icon: '🛡️',
      color: '#00d2ff'
    },
    {
      id: 'privacy',
      title: 'Privacy First',
      subtitle: 'Your data is yours.',
      description: 'Choose what you share and with whom. End-to-end encryption and zero-knowledge proofs ensure your privacy is never compromised.',
      icon: '👁️',
      color: '#0077ff'
    }
  ];
  
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

  // Auto-rotate through features every 5 seconds
  useEffect(() => {
    if (!animationStarted) return;
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [animationStarted, features.length]);

  return (
    <section 
      ref={ref}
      className="relative min-h-screen bg-black py-20"
    >
      {/* Section Title */}
      <div className={`relative z-20 text-center mb-16 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-300`}>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-4">
          <span className="relative">
            <span 
              className="text-white"
              style={{
                background: 'linear-gradient(to right, #ffffff, #00a2ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Revolutionary Features
            </span>
            <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
          </span>
        </h2>
        <p className="text-[#a0e4ff]/70 max-w-2xl mx-auto text-lg">
          Powered by blockchain technology for a truly decentralized social experience
        </p>
      </div>
      
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
      
      {/* Feature Navigation */}
      <div className={`relative z-20 flex justify-center mb-12 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-500`}>
        <div className="flex space-x-6 md:space-x-10">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              className={`relative px-4 py-2 text-sm md:text-base transition-all duration-300 ${activeFeature === index ? 'text-[#00a2ff]' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveFeature(index)}
            >
              {feature.title}
              {activeFeature === index && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Feature Content Container */}
      <div 
        ref={sectionRef} 
        className="container mx-auto px-6 relative z-10"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Feature Visual */}
          <div className={`w-full md:w-1/2 mb-10 md:mb-0 transition-all duration-1000 ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
            <div className="relative h-[50vh] max-h-[500px]">
              {/* Background effects */}
              <div className="absolute inset-0 blockchain-grid opacity-20"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,162,255,0.1),transparent_70%)]"></div>
              
              {/* Feature visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                {features.map((feature, index) => (
                  <div
                    key={feature.id}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                      activeFeature === index 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-90 pointer-events-none'
                    }`}
                  >
                    <div 
                      className={`w-64 h-64 flex items-center justify-center transition-transform duration-500 ${hoverSection === `feature-${index}` ? 'scale-105' : 'scale-100'}`}
                      onMouseEnter={() => setHoverSection(`feature-${index}`)}
                      onMouseLeave={() => setHoverSection('')}
                    >
                      <div className="relative">
                        {/* Feature hexagon */}
                        <div 
                          className="w-48 h-48 hexagon flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${feature.color}20 0%, transparent 70%)`,
                            borderColor: `${feature.color}40`,
                            borderWidth: '1px',
                            borderStyle: 'solid'
                          }}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-2">{feature.icon}</div>
                            <div className="text-lg font-mono" style={{ color: feature.color }}>{feature.title.split(' ')[0]}</div>
                            <div className="text-xs mt-2" style={{ color: `${feature.color}99` }}>{feature.title.split(' ')[1]?.toUpperCase()}</div>
                          </div>
                        </div>
                        
                        {/* Orbiting elements */}
                        <div className="absolute inset-0 animate-spin-slow" style={{animationDuration: '25s'}}>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-4 rounded-full" style={{ backgroundColor: `${feature.color}60` }}></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-4 h-4 rounded-full" style={{ backgroundColor: `${feature.color}60` }}></div>
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-4 h-4 rounded-full" style={{ backgroundColor: `${feature.color}60` }}></div>
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-4 h-4 rounded-full" style={{ backgroundColor: `${feature.color}60` }}></div>
                        </div>
                        
                        {/* Secondary orbiting elements */}
                        <div className="absolute inset-0 animate-spin-slow" style={{animationDuration: '40s', animationDirection: 'reverse'}}>
                          <div className="absolute top-1/4 left-0 transform -translate-x-2 w-2 h-2 hexagon" style={{ backgroundColor: `${feature.color}40`, borderColor: `${feature.color}60`, borderWidth: '1px' }}></div>
                          <div className="absolute bottom-1/4 right-0 transform translate-x-2 w-2 h-2 hexagon" style={{ backgroundColor: `${feature.color}40`, borderColor: `${feature.color}60`, borderWidth: '1px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Interactive glow effect */}
              <div 
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,162,255,0.2),transparent_40%)] opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at center, ${features[activeFeature].color}20, transparent 40%)`
                }}
              ></div>
            </div>
          </div>
          
          {/* Feature Description */}
          <div className={`w-full md:w-1/2 md:pl-10 transition-all duration-1000 ${animationStarted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`transition-all duration-700 ${
                  activeFeature === index 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10 absolute pointer-events-none'
                }`}
                style={{ position: activeFeature === index ? 'relative' : 'absolute' }}
              >
                <h3 
                  className="text-3xl md:text-4xl lg:text-5xl font-light mb-6"
                  style={{
                    background: `linear-gradient(135deg, #ffffff 30%, ${feature.color} 70%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {feature.subtitle}
                </h3>
                
                <div 
                  className="h-[1px] w-20 mb-6 transition-all duration-500"
                  style={{ 
                    background: `linear-gradient(to right, ${feature.color}80, transparent)`,
                    width: hoverSection === `feature-${index}` ? '100%' : '80px'
                  }}
                ></div>
                
                <p className="text-white/70 text-lg mb-8 max-w-lg">
                  {feature.description}
                </p>
                
                {/* Feature-specific details */}
                <div className="space-y-4">
                  {index === 0 && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">Self-sovereign identity verification</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">Portable reputation across platforms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">No central authority controlling your data</span>
                      </div>
                    </>
                  )}
                  
                  {index === 1 && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">Immutable data verification</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">Distributed consensus mechanisms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">Cryptographic protection against attacks</span>
                      </div>
                    </>
                  )}
                  
                  {index === 2 && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">End-to-end encryption for all communications</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">Granular permission controls</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }}></div>
                        <span className="text-white/80">Zero-knowledge proofs for verification</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Learn more button */}
                <button 
                  className="mt-8 px-6 py-2 border rounded-full group transition-all duration-300 hover:bg-white/5"
                  style={{ borderColor: feature.color }}
                  onMouseEnter={() => setHoverSection(`feature-${index}`)}
                  onMouseLeave={() => setHoverSection('')}
                >
                  <span 
                    className="text-sm tracking-wider transition-colors duration-300"
                    style={{ color: hoverSection === `feature-${index}` ? feature.color : 'white' }}
                  >
                    LEARN MORE
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Feature navigation dots */}
      <div className={`flex justify-center mt-12 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-700`}>
        <div className="flex space-x-3">
          {features.map((feature, index) => (
            <button
              key={`dot-${feature.id}`}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeFeature === index 
                  ? 'bg-[#00a2ff]' 
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              onClick={() => setActiveFeature(index)}
              aria-label={`View ${feature.title} feature`}
            ></button>
          ))}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className={`absolute left-8 top-1/2 z-10 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-600`}>
        <div className="h-40 w-px bg-gradient-to-b from-transparent via-[#00a2ff]/20 to-white/10"></div>
      </div>
      
      <div className={`absolute right-8 bottom-20 z-10 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-900`}>
        <div className="h-40 w-px bg-gradient-to-b from-transparent via-white/20 to-[#00a2ff]/20"></div>
      </div>
    </section>
  );
};

export default PoeticRhythm;