import React from 'react';
import { Link } from 'react-router-dom';

const CTA = ({ title, description, buttonText, buttonLink, dark = false }) => {
  return (
    <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-gray-900' : 'bg-black/40 backdrop-blur-md'}`}>
      <div className="relative z-10 px-6 py-12 md:py-16 text-center">
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-[#00a2ff]/20 blur-[100px] rounded-full"></div>
        
        <h2 className="text-3xl md:text-4xl font-light text-white mb-6">{title || 'Bereit für BSN?'}</h2>
        
        {description && (
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            {description}
          </p>
        )}
        
        <Link 
          to={buttonLink || '/token-reservation'} 
          className="inline-block bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 text-lg"
        >
          {buttonText || 'Token reservieren'}
        </Link>
      </div>
    </div>
  );
};

export default CTA;