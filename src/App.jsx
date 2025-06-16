// src/App.jsx
import { useEffect } from 'react';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MagazineSpread from './components/MagazineSpread';
import PoeticRhythm from './components/PoeticRhythm';
import ProductShowcase from './components/ProductShowcase';
import UpdatedCTA from './components/UpdatedCTA';

// Add custom blockchain-themed effects and animation styles
const addCustomStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes float-slow {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-8px) rotate(1deg); }
      75% { transform: translateY(8px) rotate(-1deg); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(0, 162, 255, 0.3); }
      50% { box-shadow: 0 0 40px rgba(0, 162, 255, 0.6); }
    }
    
    @keyframes blockchain-flow {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100vw); }
    }
    
    .animate-float {
      animation: float 4s ease-in-out infinite;
    }
    
    .animate-float-slow {
      animation: float-slow 8s ease-in-out infinite;
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

function App() {
  useEffect(() => {
    addCustomStyles();
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Prevent body scrolling when mobile menu is open
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="bg-black text-white font-sans">
      <Navbar />
      <Hero />
      <MagazineSpread />
      <PoeticRhythm />
      <ProductShowcase />
      <UpdatedCTA />
      <Footer />
    </div>
  );
}

export default App;