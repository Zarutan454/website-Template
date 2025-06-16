import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  
  // Navigation features
  const features = [
    { title: "Decentralized Identity", description: "Own your digital identity completely", page: "01" },
    { title: "Blockchain Security", description: "Military-grade encryption & transparency", page: "02-03" },
    { title: "Social Mining", description: "Earn tokens through authentic engagement", page: "04" },
    { title: "Privacy First", description: "Your data, your control, always", page: "05" }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${
        isScrolled 
          ? 'bg-[#06071F]/90 backdrop-blur-md shadow-lg border-b border-[#00a2ff]/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="text-white text-2xl tracking-widest font-light flex items-center group">
          <div className="relative">
            <span className="border border-[#00a2ff]/40 px-2 py-1 group-hover:border-[#00a2ff] transition-colors duration-300">B</span>
            <div className="absolute inset-0 bg-[#00a2ff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="ml-2 group-hover:text-[#00a2ff] transition-colors duration-300">BSN</span>
          <span className="ml-2 text-sm text-[#8aa0ff] font-mono">NETWORK</span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <a href="#" className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider">HOME</a>
          <div className="relative group">
            <button 
              className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider flex items-center"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              FEATURES
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div 
              className={`absolute left-0 top-full pt-4 w-96 z-50 transform origin-top ${featuresOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} transition-all duration-300`}
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <div className="bg-[#06071F]/95 backdrop-blur-lg border border-[#00a2ff]/20 p-6 shadow-xl shadow-black/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-light tracking-widest text-white/80">BLOCKCHAIN FEATURES</h3>
                  <div className="flex items-center">
                    <span className="text-[#00a2ff]/60 text-xs uppercase tracking-widest font-light">Web3 Ready</span>
                  </div>
                </div>
                
                {/* Feature items */}
                <div className="space-y-4">
                  {features.map((item, index) => (
                    <a 
                      key={index}
                      href={`#section-${index+1}`} 
                      className="flex items-start group hover:bg-[#00a2ff]/5 p-2 transition-colors duration-200"
                      onClick={() => setFeaturesOpen(false)}
                    >
                      {/* Feature icon */}
                      <div className="w-8 shrink-0 flex justify-center">
                        <div className="w-2 h-2 bg-[#00a2ff]/60 rounded-full group-hover:bg-[#00a2ff] transition-colors duration-300"></div>
                      </div>
                      
                      {/* Feature title & description */}
                      <div className="flex-1">
                        <h4 className="text-white group-hover:text-[#00a2ff] text-sm mb-0.5 transition-colors duration-200">{item.title}</h4>
                        <p className="text-white/50 text-xs">{item.description}</p>
                      </div>
                      
                      {/* Blockchain indicator */}
                      <div className="ml-3">
                        <div className="w-3 h-3 border border-[#00a2ff]/30 rotate-45 group-hover:border-[#00a2ff]/60 transition-all duration-300"></div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <a href="#" className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider">TOKENOMICS</a>
          <a href="#" className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider">ROADMAP</a>
          <a href="#" className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider">COMMUNITY</a>
        </div>
        
        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden flex flex-col space-y-1.5 z-30"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span 
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              menuOpen ? 'transform rotate-45 translate-y-2' : ''
            }`}
          ></span>
          <span 
            className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          ></span>
          <span 
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              menuOpen ? 'transform -rotate-45 -translate-y-2' : ''
            }`}
          ></span>
        </button>
        
        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-[#06071F]/95 backdrop-blur-lg flex flex-col items-center justify-center transition-all duration-500 ${
            menuOpen 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col items-center space-y-8 max-h-[80vh] overflow-y-auto py-8">
            <a href="#" onClick={() => setMenuOpen(false)} className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-xl tracking-wider">HOME</a>
            
            {/* Mobile Features Section */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-white text-xl tracking-wider">FEATURES</h3>
              <div className="bg-white/5 p-4 rounded-md w-72 sm:w-80">
                {features.map((item, index) => (
                  <a 
                    key={index} 
                    href={`#section-${index+1}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-start border-b border-white/10 last:border-0 py-3 group"
                  >
                    <div className="w-8 shrink-0 flex justify-center">
                      <div className="w-2 h-2 bg-[#00a2ff]/60 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white group-hover:text-[#00a2ff] text-sm transition-colors duration-200">{item.title}</h4>
                      <p className="text-white/50 text-xs mt-0.5">{item.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            <a href="#" onClick={() => setMenuOpen(false)} className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-xl tracking-wider">TOKENOMICS</a>
            <a href="#" onClick={() => setMenuOpen(false)} className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-xl tracking-wider">ROADMAP</a>
            <a href="#" onClick={() => setMenuOpen(false)} className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-xl tracking-wider">COMMUNITY</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;