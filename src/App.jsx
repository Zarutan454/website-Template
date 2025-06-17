// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import FaucetWidget from './components/FaucetWidget';
import ReferralWidget from './components/ReferralWidget';
import TokenReservationWidget from './components/TokenReservationWidget';
import NewsletterForm from './components/NewsletterForm';
import RegistrationForm from './components/RegistrationForm';
import Tokenomics from './components/Tokenomics';
import Roadmap from './components/Roadmap';
import FAQ from './components/FAQ';
import TeamSection from './components/TeamSection';
import Footer from './components/Footer';

// Import der Animationen
import { addExtendedAnimations } from './utils/animations';
import BlockchainParticlesEffect from './components/animations/BlockchainParticlesEffect';
import DataFlowAnimation from './components/animations/DataFlowAnimation';
import HexagonGrid from './components/animations/HexagonGrid';
import GlowingParticles from './components/animations/GlowingParticles';

// Add custom blockchain-themed effects and animation styles
const addCustomStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(0, 162, 255, 0.3); }
      50% { box-shadow: 0 0 40px rgba(0, 162, 255, 0.6); }
    }
    
    @keyframes blockchain-flow {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100vw); }
    }
    
    .animate-pulse-glow {
      animation: pulse-glow 3s ease-in-out infinite;
    }
    
    .animate-blockchain-flow {
      animation: blockchain-flow 15s linear infinite;
    }
    
    .glass {
      background: rgba(10, 10, 40, 0.25);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .vertical-text {
      writing-mode: vertical-lr;
      text-orientation: mixed;
      transform: rotate(180deg);
    }
    
    .bg-gradient-radial {
      background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
    }
    
    .blockchain-grid {
      background-image: 
        linear-gradient(rgba(0, 162, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 162, 255, 0.1) 1px, transparent 1px);
      background-size: 50px 50px;
    }
    
    .hexagon {
      clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
    }
  `;
  document.head.appendChild(style);
};

// Blockchain-Hintergrund-Komponente
const BlockchainBackground = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <BlockchainParticlesEffect particleCount={25} connectionCount={8} />
      <div className="absolute inset-0 blockchain-grid opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00a2ff]/5 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00a2ff]/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Animated hexagons */}
      <div className="absolute top-1/3 right-[20%] w-20 h-20 hexagon border border-[#00a2ff]/20 animate-spin-slow"></div>
      <div className="absolute bottom-1/3 left-[20%] w-16 h-16 hexagon border border-[#00a2ff]/10 animate-spin-very-slow"></div>
    </div>
  );
};

// Enhanced background with different animation types
const EnhancedBackground = ({ type = 'default', className = '' }) => {
  switch (type) {
    case 'dataFlow':
      return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
          <DataFlowAnimation nodeCount={12} packetCount={4} speed={0.8} />
          <div className="absolute inset-0 blockchain-grid opacity-5"></div>
        </div>
      );
    case 'hexagons':
      return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
          <HexagonGrid columns={15} rows={10} size={40} gap={10} opacity={0.2} />
          <div className="absolute inset-0 blockchain-grid opacity-5"></div>
        </div>
      );
    case 'particles':
      return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
          <GlowingParticles particleCount={30} minSize={2} maxSize={6} glowIntensity={15} />
          <div className="absolute inset-0 blockchain-grid opacity-5"></div>
        </div>
      );
    default:
      return <BlockchainBackground className={className} />;
  }
};

// Wiederverwendbare Sektion für Überschriften
const SectionTitle = ({ 
  title, 
  subtitle, 
  align = 'center',
  className = ''
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const alignClass = alignmentClasses[align] || alignmentClasses.center;
  const subtitleMaxWidth = align === 'center' ? 'max-w-2xl mx-auto' : '';

  return (
    <div className={`${alignClass} mb-16 ${className}`}>
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
            {title}
          </span>
          <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent animate-shimmer"></span>
        </span>
      </h2>
      {subtitle && (
        <p className={`text-[#a0e4ff]/70 ${subtitleMaxWidth} text-lg`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

function App() {
  const [referralCode, setReferralCode] = useState(null);
  const sectionRefs = useRef({});
  
  // Check for referral code in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const refCode = queryParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, []);

  useEffect(() => {
    // Füge beide Arten von Animationen hinzu
    addCustomStyles();
    addExtendedAnimations();
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Prevent body scrolling when mobile menu is open
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* 1. Hero Section */}
      <Hero />
      
      {/* 2. Feature Section */}
      <FeatureSection />
      
      {/* 3. About/Über uns Section */}
      <section id="about" className="py-20 relative overflow-hidden">
        {/* Background elements */}
        <EnhancedBackground type="dataFlow" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title="Über BSN" 
            subtitle="Erfahre mehr über unsere Mission und Vision für die Zukunft des sozialen Netzwerks"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-2xl font-light text-[#00a2ff]">Unsere Mission</h3>
              <p className="text-white/80 leading-relaxed">
                BSN wurde mit dem Ziel gegründet, ein dezentrales soziales Netzwerk zu schaffen, das die Kontrolle zurück in die Hände der Nutzer legt. Wir glauben an eine Zukunft, in der Daten den Menschen gehören, die sie erstellen, und in der Privatsphäre und Sicherheit an erster Stelle stehen.
              </p>
              <p className="text-white/80 leading-relaxed">
                Unsere Plattform nutzt Blockchain-Technologie, um ein transparentes, sicheres und dezentrales soziales Netzwerk zu schaffen, das die Nutzer für ihre Beiträge und Interaktionen belohnt.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-light text-[#00a2ff]">Unsere Vision</h3>
              <p className="text-white/80 leading-relaxed">
                Wir streben danach, das erste wirklich nutzerorientierte soziale Netzwerk zu werden, in dem die Gemeinschaft die Plattform besitzt und steuert. Unsere Vision ist eine Welt, in der soziale Medien Menschen verbinden, ohne ihre Privatsphäre zu verletzen oder ihre Daten zu monetarisieren.
              </p>
              <p className="text-white/80 leading-relaxed">
                Mit BSN schaffen wir eine Plattform, die Innovation fördert, Kreativität belohnt und echte Verbindungen zwischen Menschen ermöglicht - alles auf der Grundlage von Blockchain-Technologie und dezentraler Governance.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 4. Tokenomics Section */}
      <Tokenomics />
      
      {/* 5. Roadmap Section */}
      <Roadmap />
      
      {/* 6. Token Reservation Widget */}
      <section id="token" className="py-20 relative overflow-hidden">
        <EnhancedBackground type="hexagons" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title="Token Reservation" 
            subtitle="Sichere dir jetzt deine BSN-Token und sei Teil der Revolution"
          />
          
          <div className="max-w-4xl mx-auto">
            <TokenReservationWidget referralCode={referralCode} />
          </div>
        </div>
      </section>
      
      {/* 7. Faucet Widget */}
      <section id="faucet" className="py-20 relative overflow-hidden">
        <EnhancedBackground type="particles" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title="BSN Faucet" 
            subtitle="Erhalte kostenlose Test-Token für das BSN-Testnetzwerk"
          />
          
          <div className="max-w-4xl mx-auto">
            <FaucetWidget />
          </div>
        </div>
      </section>
      
      {/* 8. Referral Program */}
      <section id="referral" className="py-20 relative overflow-hidden">
        <EnhancedBackground />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title="Referral Programm" 
            subtitle="Lade Freunde ein und erhalte Belohnungen"
          />
          
          <div className="max-w-4xl mx-auto">
            <ReferralWidget />
          </div>
        </div>
      </section>
      
      {/* 9. Registration Form */}
      <section id="register" className="py-20 relative overflow-hidden">
        <EnhancedBackground type="dataFlow" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title="Registrierung" 
            subtitle="Erstelle dein BSN-Konto und starte in die Zukunft sozialer Netzwerke"
          />
          
          <div className="max-w-4xl mx-auto">
            <RegistrationForm referralCode={referralCode} />
          </div>
        </div>
      </section>
      
      {/* 10. Team Section */}
      <TeamSection />
      
      {/* 11. FAQ Section */}
      <FAQ />
      
      {/* 12. Newsletter Section */}
      <section id="newsletter" className="py-20 relative overflow-hidden">
        <EnhancedBackground type="particles" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title="Newsletter" 
            subtitle="Bleibe auf dem Laufenden über die neuesten Entwicklungen und Updates"
          />
          
          <div className="max-w-3xl mx-auto">
            <NewsletterForm />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;