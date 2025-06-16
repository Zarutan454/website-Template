import { useState, useEffect, useRef } from 'react';

const Benefits = () => {
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

  const benefits = [
    {
      icon: (
        <svg className="w-12 h-12 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      title: "ENHANCED ENERGY",
      description: "Sustained performance without the crash. Advanced energy formula works with your body's natural systems."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      title: "OPTIMIZED HYDRATION",
      description: "Precision electrolyte balance ensures optimal cellular hydration for peak physical and mental performance."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      ),
      title: "MENTAL CLARITY",
      description: "Nootropic compounds enhance cognitive function and focus, clearing the mental fog for sharper thinking."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      ),
      title: "CELLULAR HEALTH",
      description: "Antioxidant complex neutralizes free radicals, supporting long-term cellular integrity and health."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      title: "RAPID RECOVERY",
      description: "Accelerates post-exercise recovery through enhanced nutrient delivery and metabolic optimization."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      ),
      title: "ADVANCED ABSORPTION",
      description: "Proprietary carrier molecules ensure maximum nutrient absorption at the cellular level."
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-24 px-6 bg-[#07091F] text-white relative overflow-hidden"
    >
      {/* Control panel type header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 relative">
          <div className={`w-32 h-1 bg-gradient-to-r from-[#00a2ff] to-transparent mx-auto mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}></div>
          
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-light tracking-widest text-center mb-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            PERFORMANCE SYSTEMS
          </h2>
          
          <p className={`text-[#8aa0ff] text-center max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            Mission control for your body's optimal functioning
          </p>
        </div>

        {/* Mission control panel layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.title}
              className={`bg-[#0d102f]/60 backdrop-blur-sm border border-[#2a3074]/30 p-8 relative transition-all duration-700 hover:border-[#00a2ff]/50 group`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              <div className={`absolute top-0 left-0 w-0 h-1 bg-[#00eaff] transition-all duration-500 group-hover:w-full ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>
              
              {/* Icon */}
              <div className={`transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ transitionDelay: `${index * 100 + 300}ms` }}>
                {benefit.icon}
              </div>
              
              {/* Title */}
              <h3 className={`font-mono text-lg tracking-wider mt-6 mb-3 text-white transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `${index * 100 + 400}ms` }}>
                {benefit.title}
              </h3>
              
              {/* Description */}
              <p className={`text-[#8aa0ff] text-sm leading-relaxed transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `${index * 100 + 500}ms` }}>
                {benefit.description}
              </p>
              
              {/* Decorative element */}
              <div className={`absolute bottom-4 right-4 w-3 h-3 border-b border-r border-[#00a2ff]/40 opacity-50 transition-all duration-300 group-hover:opacity-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Background hexagon pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#00a2ff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>
    </section>
  );
};

export default Benefits;