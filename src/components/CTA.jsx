import { useState, useEffect, useRef } from 'react';

const CTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Dark, full-screen panel */}
      <div className="absolute inset-0 z-0">
        {/* Star-like particles */}
        <div className="absolute inset-0" style={{ 
          background: 'radial-gradient(circle at center, rgba(0,70,128,0.3) 0%, rgba(0,0,0,0) 70%)',
        }}></div>
        
        {/* Small floating particles */}
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5,
              animation: `float ${Math.random() * 10 + 15}s linear infinite`,
            }}
          ></div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 z-10 space-y-16 md:space-y-0 md:space-x-16">
        {/* The bottle in orbit */}
        <div className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative">
            {/* The orbital ring */}
            <div className={`absolute -inset-8 rounded-full border border-[#00a2ff]/20 transition-all duration-1500 ${isVisible ? 'opacity-30 scale-100' : 'opacity-0 scale-90'}`} style={{ transform: 'rotate(-35deg)' }}></div>
            <div className={`absolute -inset-14 rounded-full border border-[#00a2ff]/15 transition-all duration-1500 delay-300 ${isVisible ? 'opacity-20 scale-100' : 'opacity-0 scale-90'}`} style={{ transform: 'rotate(25deg)' }}></div>
            
            {/* The glow effect */}
            <div className={`absolute inset-0 blur-xl bg-[#00a2ff]/10 rounded-full transition-all duration-1500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}></div>
            
            {/* Product image with floating animation */}
            <div className="animate-float-slow">
              <img 
                src="/assets/images/product-bottle.png" 
                alt="APOXIAZULE Hydration Drink" 
                className="relative z-10 h-[40vh] max-h-[400px] object-contain"
              />
            </div>
          </div>
        </div>
        
        {/* CTA text and button */}
        <div className="text-center md:text-left md:max-w-md">
          <h2 className={`text-4xl md:text-5xl font-light tracking-widest text-white mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            FUEL TOMORROW
          </h2>
          
          <p className={`text-[#8aa0ff] mb-10 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Experience the next evolution in hydration technology. Prepare your body for what's next.
          </p>
          
          {/* Futuristic button with glow effect */}
          <div className={`inline-block transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <button 
              className="group relative px-10 py-4 bg-black text-white border border-[#00a2ff]/50 hover:border-[#00eaff] transition-all duration-300"
            >
              <span className="relative z-10 font-light tracking-wider text-lg">
                TRY IT NOW
              </span>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00a2ff]/0 via-[#00a2ff]/10 to-[#00a2ff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00a2ff]"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00a2ff]"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00a2ff]"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00a2ff]"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;