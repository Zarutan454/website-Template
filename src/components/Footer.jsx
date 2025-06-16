import React, { useRef, useEffect } from 'react';

const Footer = () => {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

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

  // Social icons with blockchain theme
  const socialLinks = [
    { name: 'Twitter', icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' },
    { name: 'Discord', icon: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' },
    { name: 'Telegram', icon: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' },
  ];

  return (
    <footer 
      ref={footerRef}
      className="bg-black text-white py-16 px-6 border-t border-[#00a2ff]/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo and Tagline */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="border border-[#00a2ff]/40 px-2 py-1 text-2xl tracking-widest font-light">B</span>
              <span className="ml-3 text-3xl tracking-widest font-light">BSN</span>
            </div>
            <p className="text-[#8aa0ff] font-light text-lg border-t border-[#00a2ff]/20 pt-3 mt-3">Blockchain Social Network</p>
            <p className="text-[#8aa0ff]/70 text-sm">Decentralized. Secure. Yours.</p>
          </div>
          
          {/* Platform Links */}
          <div>
            <h3 className="text-sm tracking-wider text-[#8aa0ff] mb-4 font-mono">PLATFORM</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Dashboard</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Social Feed</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Token Wallet</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Privacy Settings</a></li>
            </ul>
          </div>
          
          {/* Blockchain Features */}
          <div>
            <h3 className="text-sm tracking-wider text-[#8aa0ff] mb-4 font-mono">BLOCKCHAIN</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Tokenomics</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Staking</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Governance</a></li>
              <li><a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Whitepaper</a></li>
            </ul>
          </div>
          
          {/* Community Links */}
          <div>
            <h3 className="text-sm tracking-wider text-[#8aa0ff] mb-4 font-mono">COMMUNITY</h3>
            <div className="flex space-x-4 mb-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={social.name}
                  href="#" 
                  className="w-10 h-10 border border-[#00a2ff]/30 flex items-center justify-center rounded-sm hover:border-[#00a2ff] hover:bg-[#00a2ff]/10 transition-all duration-300 group"
                  aria-label={social.name}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-5 h-5 text-[#8aa0ff] group-hover:text-[#00a2ff] transition-colors duration-300"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[#8aa0ff]/70">Join our community</p>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs text-[#8aa0ff]">25,000+ Members</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`mt-16 pt-8 border-t border-[#1a1a2f] text-[#8aa0ff]/50 text-sm flex flex-col md:flex-row justify-between transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center">
            <div className="w-2 h-2 hexagon bg-[#00a2ff]/30 mr-2"></div>
            <span>© 2025 BSN Network. All rights reserved.</span>
          </div>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-[#00a2ff] transition-colors duration-300">Audit Report</a>
          </div>
        </div>
        
        {/* Blockchain network status */}
        <div className={`mt-8 pt-6 border-t border-[#00a2ff]/10 flex justify-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center space-x-6 text-xs text-[#8aa0ff]/60">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span>Network Status: Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 hexagon bg-[#00a2ff]/40 mr-2"></div>
              <span>Block Height: 2,847,392</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
              <span>Active Nodes: 1,247</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;