import React, { useRef, useEffect, useState } from 'react';

const Footer = () => {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [hoverLink, setHoverLink] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    
    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() !== '' && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => {
        setSubscribed(false);
      }, 5000);
    }
  };

  // Social icons with blockchain theme
  const socialLinks = [
    { name: 'Twitter', icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' },
    { name: 'Discord', icon: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' },
    { name: 'Telegram', icon: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' },
    { name: 'GitHub', icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' },
    { name: 'Medium', icon: 'M0 0v24h24V0H0zm19.938 5.686L18.651 6.92a.376.376 0 0 0-.143.362v9.067a.376.376 0 0 0 .143.361l1.257 1.234v.271h-6.322v-.27l1.302-1.265c.128-.128.128-.165.128-.36V8.99l-3.62 9.195h-.49L6.69 8.99v6.163a.85.85 0 0 0 .233.707l1.694 2.054v.271H3.815v-.27L5.51 15.86a.82.82 0 0 0 .218-.707V8.027a.624.624 0 0 0-.203-.527L4.019 5.686v-.27h4.674l3.613 7.924 3.176-7.924h4.456v.27z' },
  ];

  return (
    <footer 
      ref={footerRef}
      className="bg-[#06071F] text-white py-20 px-6 border-t border-[#00a2ff]/10 relative overflow-hidden"
    >
      {/* Decorative blockchain elements */}
      <div className="absolute inset-0 blockchain-grid opacity-10"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00a2ff]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter Section */}
        <div className={`mb-16 pb-16 border-b border-[#00a2ff]/10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8 md:max-w-lg">
              <h2 className="text-2xl font-light mb-4">
                <span className="relative">
                  <span 
                    className="text-white"
                    style={{
                      background: 'linear-gradient(to right, #ffffff, #00a2ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Join the Revolution
                  </span>
                  <span className="absolute -bottom-1 left-0 w-1/2 h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
                </span>
              </h2>
              <p className="text-[#8aa0ff]/80 mb-4">
                Subscribe to our newsletter and be the first to know about platform updates, token events, and exclusive community offers.
              </p>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs text-[#8aa0ff]">Join 25,000+ blockchain enthusiasts</span>
              </div>
            </div>
            
            <form onSubmit={handleSubscribe} className="w-full md:w-auto">
              <div className="relative flex">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address" 
                  className="bg-[#0d0e2c] border border-[#00a2ff]/20 rounded-l-full py-3 px-5 w-full md:w-80 focus:outline-none focus:border-[#00a2ff]/50 text-white placeholder-white/30"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white px-6 rounded-r-full font-medium transition-all duration-300 flex items-center justify-center"
                >
                  {subscribed ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Subscribed
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
              <p className="text-xs text-[#8aa0ff]/50 mt-2">We respect your privacy. Unsubscribe at any time.</p>
            </form>
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo and Tagline */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center">
              {/* Updated BSN Logo to match Navbar */}
              <div className="relative flex items-center group">
                {/* Animated logo container */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  {/* Outer hexagon with pulsing glow */}
                  <div className="absolute inset-0 hexagon border-2 border-[#00a2ff]/40 group-hover:border-[#00a2ff] transition-all duration-500"></div>
                  
                  {/* Inner hexagon with gradient */}
                  <div className="absolute inset-1 hexagon bg-gradient-to-br from-[#00a2ff]/20 to-[#0077ff]/10 group-hover:from-[#00a2ff]/30 group-hover:to-[#0077ff]/20 transition-all duration-500"></div>
                  
                  {/* BSN Text */}
                  <div className="relative z-10 flex items-center justify-center">
                    <span className="text-[#00a2ff] font-light tracking-widest group-hover:text-white transition-colors duration-300">BSN</span>
                  </div>
                </div>
                
                {/* Network text with animation - now positioned next to BSN */}
                <div className="ml-2 hidden sm:flex items-center">
                  <span className="text-sm text-[#8aa0ff] font-mono relative inline-block">
                    NETWORK
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent group-hover:w-full transition-all duration-500"></span>
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[#8aa0ff] font-light text-lg border-t border-[#00a2ff]/20 pt-3 mt-3">Blockchain Social Network</p>
            <p className="text-[#8aa0ff]/70 text-sm max-w-sm">
              Decentralized social networking platform built on blockchain technology, 
              empowering users with full control over their data, identity, and digital interactions.
            </p>
            
            {/* Social Links - Mobile Only */}
            <div className="flex space-x-4 mt-6 lg:hidden">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href="#" 
                  className="w-10 h-10 border border-[#00a2ff]/30 flex items-center justify-center rounded-sm hover:border-[#00a2ff] hover:bg-[#00a2ff]/10 transition-all duration-300 group"
                  aria-label={social.name}
                  onMouseEnter={() => setHoverLink(social.name)}
                  onMouseLeave={() => setHoverLink('')}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className={`w-5 h-5 transition-colors duration-300 ${hoverLink === social.name ? 'text-[#00a2ff]' : 'text-[#8aa0ff]'}`}
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          {/* Platform Links */}
          <div>
            <h3 className="text-sm tracking-wider text-[#8aa0ff] mb-4 font-mono relative inline-block">
              PLATFORM
              <span className="absolute -bottom-1 left-0 w-8 h-[1px] bg-[#00a2ff]/50"></span>
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Dashboard</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Social Feed</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Token Wallet</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Privacy Settings</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>NFT Gallery</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Marketplace</a></li>
            </ul>
          </div>
          
          {/* Blockchain Features */}
          <div>
            <h3 className="text-sm tracking-wider text-[#8aa0ff] mb-4 font-mono relative inline-block">
              BLOCKCHAIN
              <span className="absolute -bottom-1 left-0 w-8 h-[1px] bg-[#00a2ff]/50"></span>
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Tokenomics</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Staking</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Governance</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Whitepaper</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Technical Docs</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Smart Contracts</a></li>
            </ul>
          </div>
          
          {/* Community Links */}
          <div>
            <h3 className="text-sm tracking-wider text-[#8aa0ff] mb-4 font-mono relative inline-block">
              COMMUNITY
              <span className="absolute -bottom-1 left-0 w-8 h-[1px] bg-[#00a2ff]/50"></span>
            </h3>
            <ul className="space-y-3 mb-6">
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Blog</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Forum</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Events</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Support</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 flex items-center"><span className="w-1 h-1 bg-[#00a2ff]/50 mr-2"></span>Careers</a></li>
            </ul>
            
            {/* Social Links - Desktop Only */}
            <div className="hidden lg:flex space-x-3">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href="#" 
                  className="w-8 h-8 border border-[#00a2ff]/30 flex items-center justify-center rounded-sm hover:border-[#00a2ff] hover:bg-[#00a2ff]/10 transition-all duration-300 group"
                  aria-label={social.name}
                  onMouseEnter={() => setHoverLink(social.name)}
                  onMouseLeave={() => setHoverLink('')}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className={`w-4 h-4 transition-colors duration-300 ${hoverLink === social.name ? 'text-[#00a2ff]' : 'text-[#8aa0ff]'}`}
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legal and Copyright */}
        <div className={`mt-16 pt-8 border-t border-[#1a1a2f] text-[#8aa0ff]/50 text-sm flex flex-col md:flex-row justify-between transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center">
            <div className="w-2 h-2 hexagon bg-[#00a2ff]/30 mr-2"></div>
            <span>© 2025 BSN Network. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap md:space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 mr-6 md:mr-0 mb-2 md:mb-0">Privacy Policy</a>
            <a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 mr-6 md:mr-0 mb-2 md:mb-0">Terms of Service</a>
            <a href="#" className="hover:text-[#00a2ff] transition-colors duration-300 mr-6 md:mr-0 mb-2 md:mb-0">Audit Report</a>
            <a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Cookie Policy</a>
          </div>
        </div>
        
        {/* Blockchain network status */}
        <div className={`mt-8 pt-6 border-t border-[#00a2ff]/10 flex justify-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-wrap justify-center items-center space-x-2 md:space-x-6 text-xs text-[#8aa0ff]/60">
            <div className="flex items-center mb-2 md:mb-0">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span>Network Status: Online</span>
            </div>
            <div className="flex items-center mb-2 md:mb-0">
              <div className="w-2 h-2 bg-[#00a2ff]/50 rounded-full mr-2"></div>
              <span>Block Height: 15,432,982</span>
            </div>
            <div className="flex items-center mb-2 md:mb-0">
              <div className="w-2 h-2 bg-[#00a2ff]/50 rounded-full mr-2"></div>
              <span>Nodes: 1,245</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#00a2ff]/50 rounded-full mr-2"></div>
              <span>Gas: 12 Gwei</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;