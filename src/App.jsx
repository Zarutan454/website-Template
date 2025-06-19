import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLanguageFromURL } from './translations/i18n';

// Page components
import HomePage from './pages/HomePage';
import FaucetPage from './pages/FaucetPage';
import ReferralPage from './pages/ReferralPage';
import TokenReservationPage from './pages/TokenReservationPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import TokenomicsPage from './pages/TokenomicsPage';
import RoadmapPage from './pages/RoadmapPage';
import CommunityPage from './pages/CommunityPage';
import DocumentationPage from './pages/DocumentationPage';
import TranslationCheckerPage from './pages/TranslationCheckerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Import der Animationen
import { addExtendedAnimations } from './utils/animations';
import './blockchain-styles.css';

// Components
import Navbar from './components/Navbar';

// Wallet Context
import { WalletProvider } from './context/WalletContext';

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

function App() {
  const { i18n } = useTranslation();
  const location = useLocation();

  // Überprüfe, ob die URL einen Sprachcode enthält und aktualisiere die Sprache entsprechend
  useEffect(() => {
    const urlLang = getLanguageFromURL();
    if (urlLang && urlLang !== i18n.language) {
      i18n.changeLanguage(urlLang);
    }
  }, [location.pathname, i18n]);

  // Extrahiere den Sprachcode aus der URL
  const getPathWithoutLang = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const urlLang = getLanguageFromURL();
    
    // Wenn der erste Pfadteil ein Sprachcode ist, entferne ihn
    if (urlLang && pathSegments[0] === urlLang) {
      return `/${pathSegments.slice(1).join('/')}`;
    }
    
    return location.pathname;
  };

  // Pfad ohne Sprachcode
  const pathWithoutLang = getPathWithoutLang();

  React.useEffect(() => {
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
    <WalletProvider>
      <Navbar />
      <Routes>
        <Route path="/:lang" element={<Navigate to={`/${i18n.language}`} />} />
        <Route path="/:lang/home" element={<HomePage />} />
        <Route path="/:lang/about" element={<AboutPage />} />
        <Route path="/:lang/features" element={<FeaturesPage />} />
        <Route path="/:lang/roadmap" element={<RoadmapPage />} />
        <Route path="/:lang/tokenomics" element={<TokenomicsPage />} />
        <Route path="/:lang/community" element={<CommunityPage />} />
        <Route path="/:lang/documentation" element={<DocumentationPage />} />
        <Route path="/:lang/token-reservation" element={<TokenReservationPage />} />
        <Route path="/:lang/faucet" element={<FaucetPage />} />
        <Route path="/:lang/referral" element={<ReferralPage />} />
        <Route path="/:lang/login" element={<LoginPage />} />
        <Route path="/:lang/register" element={<RegisterPage />} />
        
        {/* Fallback-Routen ohne Sprachcode */}
        <Route path="/home" element={<Navigate to={`/${i18n.language}/home`} />} />
        <Route path="/about" element={<Navigate to={`/${i18n.language}/about`} />} />
        <Route path="/features" element={<Navigate to={`/${i18n.language}/features`} />} />
        <Route path="/roadmap" element={<Navigate to={`/${i18n.language}/roadmap`} />} />
        <Route path="/tokenomics" element={<Navigate to={`/${i18n.language}/tokenomics`} />} />
        <Route path="/community" element={<Navigate to={`/${i18n.language}/community`} />} />
        <Route path="/documentation" element={<Navigate to={`/${i18n.language}/documentation`} />} />
        <Route path="/token-reservation" element={<Navigate to={`/${i18n.language}/token-reservation`} />} />
        <Route path="/faucet" element={<Navigate to={`/${i18n.language}/faucet`} />} />
        <Route path="/referral" element={<Navigate to={`/${i18n.language}/referral`} />} />
        <Route path="/login" element={<Navigate to={`/${i18n.language}/login`} />} />
        <Route path="/register" element={<Navigate to={`/${i18n.language}/register`} />} />
        
        {/* Root-Route */}
        <Route path="/" element={<Navigate to={`/${i18n.language}/home`} />} />
      </Routes>
    </WalletProvider>
  );
}

export default App;