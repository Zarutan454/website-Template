// src/components/ProductShowcase.jsx
import { useEffect, useState, useRef } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const ProductShowcase = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoverState, setHoverState] = useState('');
  const productRef = useRef(null);
  
  // Subtle rotation animation on mouse move
  const handleMouseMove = (e) => {
    if (productRef.current) {
      const bounds = productRef.current.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      
      const rotateX = (mouseY - centerY) / 30;
      const rotateY = (centerX - mouseX) / 30;
      
      productRef.current.style.transform = `rotate3d(1, 0, 0, ${rotateX}deg) rotate3d(0, 1, 0, ${rotateY}deg) rotate(12deg)`;
    }
  };
  
  const handleMouseLeave = () => {
    if (productRef.current) {
      productRef.current.style.transform = 'rotate(12deg)';
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
      {/* Decorative geometric patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className={`absolute top-0 left-0 w-full h-full ${animationStarted ? 'animate-subtle-rotate' : ''}`} style={{ animationDuration: '120s' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 162, 255, 0.3)" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      {/* Magazine Style Header with enhanced styling */}
      <div 
        className={`absolute top-8 left-8 z-20 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700 delay-300`}
        onMouseEnter={() => setHoverState('header')}
        onMouseLeave={() => setHoverState('')}
      >
        <div className="flex items-center">
          <div className={`h-4 w-4 border border-[#00a2ff]/30 transition-all duration-300 ${hoverState === 'header' ? 'rotate-45 bg-[#00a2ff]/10' : ''}`}></div>
          <span className="ml-3 text-white/70 text-sm font-mono tracking-widest">FEATURE <span className="text-[#00a2ff]/70">|</span> PRODUCT DESIGN</span>
        </div>
      </div>
      
      {/* Magazine Page Number with decorative elements */}
      <div className={`absolute bottom-8 right-8 z-20 text-white/50 text-sm ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-500`}>
        <div className="flex items-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#00a2ff]/30 mr-2"></div>
          <span className="font-mono tracking-widest">04</span>
        </div>
      </div>
      
      {/* Multiple decorative elements for depth */}
      <div className={`absolute top-0 right-24 h-32 w-px bg-gradient-to-b from-transparent via-[#00a2ff]/30 to-transparent transform rotate-45 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-700`}></div>
      <div className={`absolute bottom-0 left-1/4 h-40 w-px bg-gradient-to-t from-transparent via-white/10 to-transparent transform -rotate-45 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-900`}></div>
      <div className={`absolute top-1/4 right-1/3 w-24 h-24 border border-white/5 rounded-full ${animationStarted ? 'animate-spin-slow opacity-20' : 'opacity-0'} transition-opacity duration-700 delay-1100`} style={{ animationDuration: '30s' }}></div>
      
      {/* Background with enhanced gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050520] to-black opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,162,255,0.1),transparent_70%)] opacity-60"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="flex flex-col items-center">
          {/* Enhanced bottle imagery with interactive elements - Now bigger and above text */}
          <div 
            className={`w-full mb-8 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-1500 ease-out`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative perspective-1000">
              {/* Multiple layered glow effects */}
              <div className="absolute inset-0 -top-10 -left-10 -right-10 -bottom-10 bg-[#00a2ff]/10 blur-3xl rounded-full animate-pulse-slow" style={{ animationDuration: '8s' }}></div>
              <div className="absolute inset-0 -top-12 -left-12 -right-12 -bottom-12 bg-[#00a2ff]/5 blur-2xl rounded-full animate-pulse-slow" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
              
              {/* Main product image with interactive 3D effect - Now bigger */}
              <div 
                className="relative z-10 mx-auto flex justify-center"
                onMouseEnter={() => setHoverState('product')}
                onMouseLeave={() => setHoverState('')}
              >
                <img 
                  ref={productRef}
                  src="/assets/images/product-bottle.png" 
                  alt="APOXIAZULE Hydration Drink" 
                  className="relative z-10 h-[70vh] max-h-[600px] object-contain transform hover:scale-105 transition-transform duration-700"
                  style={{ transformStyle: 'preserve-3d' }}
                />
                
                {/* Reflections and highlights that follow mouse */}
                <div 
                  className={`absolute inset-0 bg-gradient-radial from-white/20 to-transparent rounded-full blur-md transition-opacity duration-300 ${hoverState === 'product' ? 'opacity-30' : 'opacity-0'}`} 
                  style={{
                    width: '20%',
                    height: '20%',
                    left: '40%',
                    top: '40%'
                  }}
                ></div>
              </div>
              
              {/* Dynamic textural overlays */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent opacity-20 mix-blend-overlay pointer-events-none"></div>
              
              {/* Label elements that appear on hover - Adjusted positions */}
              <div 
                className={`absolute left-1/4 top-1/2 transform -translate-y-1/2 transition-all duration-500 ${hoverState === 'product' ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-10'}`}
              >
                <div className="h-[1px] w-12 bg-[#00a2ff]/40"></div>
                <p className="mt-2 text-xs uppercase tracking-widest text-[#00a2ff]/80 font-light rotate-90 origin-left transform translate-y-6">PREMIUM FORMULA</p>
              </div>
              
              <div 
                className={`absolute right-1/4 bottom-1/3 transform transition-all duration-500 ${hoverState === 'product' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
              >
                <div className="h-[1px] w-12 bg-[#00a2ff]/40"></div>
                <p className="mt-2 text-xs uppercase tracking-widest text-[#00a2ff]/80 font-light -rotate-90 origin-right transform translate-y-6">SIGNATURE DESIGN</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced fashion manifesto text with interactive elements - Now below image */}
          <div className={`w-full md:w-3/4 mx-auto text-center ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-1500 delay-300 ease-out`}>
            <div 
              className="relative"
              onMouseEnter={() => setHoverState('text')}
              onMouseLeave={() => setHoverState('')}
            >
              {/* Subtle decorative elements - Adjusted for new layout */}
              <div className={`absolute -left-8 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[#00a2ff]/20 to-transparent transition-all duration-500 ${hoverState === 'text' ? 'opacity-100 scale-y-100' : 'opacity-30 scale-y-50'}`}></div>
              <div className={`absolute -right-8 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[#00a2ff]/20 to-transparent transition-all duration-500 ${hoverState === 'text' ? 'opacity-100 scale-y-100' : 'opacity-30 scale-y-50'}`}></div>
              
              <h2 className="relative text-4xl md:text-6xl font-extralight tracking-tight mb-8 leading-none">
                <span className="block text-white">Crafted in 2025.</span>
                <span 
                  className="block relative"
                  style={{
                    background: 'linear-gradient(135deg, #00a2ff 0%, #0077ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Designed for 2030.
                  <div className={`absolute -right-12 top-1/2 transform -translate-y-1/2 transition-all duration-500 ${hoverState === 'text' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}>
                    <div className="h-[1px] w-8 bg-[#00a2ff]"></div>
                  </div>
                </span>
              </h2>
              
              <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-8 mx-auto max-w-2xl">
                We don't just follow trends. We <span className="text-white font-normal">create</span> them. APOXIAZULE embodies a vision that's both immediate and prescient. A design language that speaks to tomorrow.
              </p>
              
              <div className={`w-24 h-[1px] bg-gradient-to-r from-[#00a2ff]/80 to-transparent mb-8 mx-auto transition-all duration-700 ${hoverState === 'text' ? 'w-40' : 'w-24'}`}></div>
              
              <div className="flex justify-center items-center">
                <p className="text-sm uppercase tracking-widest text-[#00a2ff]/70 font-light">
                  Molecular Precision Design
                </p>
                
                <div 
                  className={`ml-4 opacity-0 transition-all duration-500 ${hoverState === 'text' ? 'opacity-100 translate-x-0' : 'translate-x-5'}`}
                >
                  <div className="w-8 h-8 rounded-full border border-[#00a2ff]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#00a2ff]/70"></div>
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