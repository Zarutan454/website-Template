import { useState, useEffect, useRef } from 'react';

const Ingredients = () => {
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

  const ingredients = [
    { name: "PURIFIED WATER", percentage: 95, description: "Ultra-filtered through 7 stages" },
    { name: "ELECTROLYTES", percentage: 2, description: "Sodium, potassium, magnesium complex" },
    { name: "ANTIOXIDANTS", percentage: 1.5, description: "Vitamin C, E and selenium" },
    { name: "ENERGY COMPLEX", percentage: 1, description: "Natural caffeine and B vitamins" },
    { name: "NATURAL FLAVORS", percentage: 0.5, description: "Zero sugar, zero calories" },
  ];

  return (
    <section 
      ref={sectionRef} 
      className="py-24 px-6 bg-[#06071F] text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-light tracking-widest text-center mb-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            ADVANCED FORMULA
          </h2>
          <p className={`text-[#8aa0ff] text-center max-w-2xl mx-auto font-mono text-sm md:text-base transition-all duration-700 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            Every component precisely calibrated and lab-verified for optimal performance
          </p>
        </div>

        {/* Lab readout style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {ingredients.map((ingredient, index) => (
            <div 
              key={ingredient.name}
              className={`bg-[#0a0b30]/60 backdrop-blur-sm border border-[#2a3074]/30 p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100 + 300}ms` }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-xl tracking-wider text-[#00a2ff]">{ingredient.name}</h3>
                <span className="text-[#00eaff] font-mono">{ingredient.percentage}%</span>
              </div>
              
              {/* Progress bar with neon effect */}
              <div className="w-full h-1 bg-[#12174d] mb-4 relative overflow-hidden">
                <div 
                  className={`h-full bg-[#00a2ff] absolute left-0 top-0 transition-all duration-1000 ease-out shadow-[0_0_5px_#00eaff]`}
                  style={{ 
                    width: isVisible ? `${ingredient.percentage * 2}%` : '0%',
                    transitionDelay: `${index * 150 + 500}ms`
                  }}
                ></div>
              </div>
              
              <p className="text-[#8aa0ff] font-light text-sm font-mono">{ingredient.description}</p>
            </div>
          ))}
        </div>

        {/* Laboratory schema */}
        <div className={`mt-20 grid grid-cols-1 lg:grid-cols-3 gap-4 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-[#0a0b30]/60 p-6 border border-[#2a3074]/30">
            <h4 className="font-mono text-[#00a2ff] mb-3">LABORATORY CERTIFIED</h4>
            <p className="text-[#8aa0ff] text-sm">Every batch tested for purity and potency</p>
          </div>
          <div className="bg-[#0a0b30]/60 p-6 border border-[#2a3074]/30">
            <h4 className="font-mono text-[#00a2ff] mb-3">NO ARTIFICIAL ADDITIVES</h4>
            <p className="text-[#8aa0ff] text-sm">Free from artificial preservatives and sweeteners</p>
          </div>
          <div className="bg-[#0a0b30]/60 p-6 border border-[#2a3074]/30">
            <h4 className="font-mono text-[#00a2ff] mb-3">SUSTAINABLE CONTAINER</h4>
            <p className="text-[#8aa0ff] text-sm">Recyclable, BPA-free advanced polymer</p>
          </div>
        </div>
      </div>

      {/* Background grid lines */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full border-[0.5px] border-[#00a2ff]" style={{ backgroundImage: 'linear-gradient(to right, #00a2ff 1px, transparent 1px), linear-gradient(to bottom, #00a2ff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>

      {/* Decorative line */}
      <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#00a2ff]/50 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>
    </section>
  );
};

export default Ingredients;