import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  
  // Table of contents items
  const contents = [
    { title: "Opening Spread", description: "More than hydration—it's a moment", page: "01" },
    { title: "The Essence", description: "Cold clarity & Silent strength", page: "02-03" },
    { title: "Product Design", description: "Crafted in 2025. Designed for 2030", page: "04" },
    { title: "Last Word", description: "The future in a bottle", page: "05" }
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
          ? 'bg-[#06071F]/90 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="text-white text-2xl tracking-widest font-light flex items-center">
          <span className="border border-white/20 px-2 py-1">A</span>
          <span className="ml-2">APOXIAZULE</span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <a href="#" className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider">HOME</a>
          <div className="relative group">
            <button 
              className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider flex items-center"
              onMouseEnter={() => setContentsOpen(true)}
              onMouseLeave={() => setContentsOpen(false)}
            >
              IN THIS ISSUE
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div 
              className={`absolute left-0 top-full pt-4 w-96 z-50 transform origin-top ${contentsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} transition-all duration-300`}
              onMouseEnter={() => setContentsOpen(true)}
              onMouseLeave={() => setContentsOpen(false)}
            >
              <div className="bg-[#06071F]/95 backdrop-blur-lg border border-white/10 p-6 shadow-xl shadow-black/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-light tracking-widest text-white/80">IN THIS ISSUE</h3>
                  <div className="flex items-center">
                    <span className="text-white/40 text-xs uppercase tracking-widest font-light">Spring 2025</span>
                  </div>
                </div>
                
                {/* Content items */}
                <div className="space-y-4">
                  {contents.map((item, index) => (
                    <a 
                      key={index}
                      href={`#section-${index+1}`} 
                      className="flex items-start group hover:bg-white/5 p-2 transition-colors duration-200"
                      onClick={() => setContentsOpen(false)}
                    >
                      {/* Content number */}
                      <div className="w-8 shrink-0">
                        <span className="text-sm text-white/40 font-mono group-hover:text-[#00a2ff] transition-all duration-300">{(index + 1).toString().padStart(2, '0')}</span>
                      </div>
                      
                      {/* Article title & description */}
                      <div className="flex-1">
                        <h4 className="text-white group-hover:text-[#00a2ff] text-sm mb-0.5 transition-colors duration-200">{item.title}</h4>
                        <p className="text-white/50 text-xs">{item.description}</p>
                      </div>
                      
                      {/* Page number */}
                      <div className="ml-3">
                        <span className="text-xs text-white/40 border border-white/10 px-1.5 py-0.5 rounded-sm group-hover:border-[#00a2ff]/30 transition-all duration-300">{item.page}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <a href="#" className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider">PRODUCTS</a>
          <a href="#" className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider">SCIENCE</a>
          <a href="#" className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-sm tracking-wider">ABOUT</a>
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
            
            {/* Mobile In This Issue Section */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-white text-xl tracking-wider">IN THIS ISSUE</h3>
              <div className="bg-white/5 p-4 rounded-md w-72 sm:w-80">
                {contents.map((item, index) => (
                  <a 
                    key={index} 
                    href={`#section-${index+1}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-start border-b border-white/10 last:border-0 py-3 group"
                  >
                    <div className="w-8 shrink-0">
                      <span className="text-sm text-white/40 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white group-hover:text-[#00a2ff] text-sm transition-colors duration-200">{item.title}</h4>
                      <p className="text-white/50 text-xs mt-0.5">{item.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            <a href="#" onClick={() => setMenuOpen(false)} className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-xl tracking-wider">PRODUCTS</a>
            <a href="#" onClick={() => setMenuOpen(false)} className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-xl tracking-wider">SCIENCE</a>
            <a href="#" onClick={() => setMenuOpen(false)} className="text-white hover:text-[#00a2ff] transition-colors duration-300 text-xl tracking-wider">ABOUT</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;