import React, { useState, useEffect, useRef } from 'react';
import { AnimatedSection } from '../utils/animations.jsx';

// Importiere die Feature-Demo-Komponenten
import SocialFeedDemo from './demos/SocialFeedDemo';
import WalletDemo from './demos/WalletDemo';
import MiningRewardsDemo from './demos/MiningRewardsDemo';
import ProfileDemo from './demos/ProfileDemo';
import GroupsDemo from './demos/GroupsDemo';
import NftTokensDemo from './demos/NftTokensDemo';
import DaoDemo from './demos/DaoDemo';
import GamificationDemo from './demos/GamificationDemo';
import SdkDemo from './demos/SdkDemo';
import SecurityDemo from './demos/SecurityDemo';

const FeatureSection = () => {
  const [activeFeature, setActiveFeature] = useState('social-feed');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Features data
  const features = [
    {
      id: 'social-feed',
      title: 'Social Feed',
      description: 'Ein dezentraler Feed, der dir volle Kontrolle über deine Inhalte gibt',
      image: '/images/features/social-feed.png',
      component: <SocialFeedDemo />
    },
    {
      id: 'wallet',
      title: 'Integrierte Wallet',
      description: 'Verwalte deine Krypto-Assets direkt in der App',
      image: '/images/features/wallet.png',
      component: <WalletDemo />
    },
    {
      id: 'mining-rewards',
      title: 'Mining Rewards',
      description: 'Verdiene Token durch Interaktionen und Content-Erstellung',
      image: '/images/features/mining-rewards.png',
      component: <MiningRewardsDemo />
    },
    {
      id: 'nft-tokens',
      title: 'NFT Integration',
      description: 'Erstelle, teile und handle mit NFTs direkt in der Plattform',
      image: '/images/features/nft-tokens.png',
      component: <NftTokensDemo />
    },
    {
      id: 'profiles',
      title: 'Dezentrale Profile',
      description: 'Deine Identität gehört dir - nicht uns',
      image: '/images/features/profiles.png',
      component: <ProfileDemo />
    },
    {
      id: 'security',
      title: 'Blockchain Security',
      description: 'Höchste Sicherheitsstandards durch Blockchain-Technologie',
      image: '/images/features/security.png',
      component: <SecurityDemo />
    },
    {
      id: 'groups',
      title: 'Gemeinschaften',
      description: 'Erstelle und verwalte dezentrale Gruppen mit eigenen Token',
      image: '/images/features/groups.png',
      component: <GroupsDemo />
    },
    {
      id: 'gamification',
      title: 'Gamification',
      description: 'Sammle Achievements und steige in Levels auf',
      image: '/images/features/gamification.png',
      component: <GamificationDemo />
    },
    {
      id: 'dao',
      title: 'DAO Governance',
      description: 'Stimme über die Zukunft der Plattform ab',
      image: '/images/features/dao.png',
      component: <DaoDemo />
    },
    {
      id: 'sdk',
      title: 'Developer SDK',
      description: 'Baue eigene Apps auf unserer Plattform',
      image: '/images/features/sdk.png',
      component: <SdkDemo />
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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

  // Get active feature object
  const activeFeatureObj = features.find(feature => feature.id === activeFeature);

  return (
    <section id="features" ref={sectionRef} className="py-20 relative overflow-hidden bg-[#06071F]">
      {/* Background elements */}
      <div className="absolute inset-0">
        {/* Blockchain grid */}
        <div className="absolute inset-0 blockchain-grid opacity-10"></div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-radial from-[#00a2ff]/5 to-transparent"></div>
        
        {/* Animated particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-[#00a2ff]/30 rounded-full animate-float-slow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${6 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section title */}
        <AnimatedSection delay={200}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-4">
              <span className="relative">
                <span 
                  style={{
                    background: 'linear-gradient(to right, #ffffff, #00a2ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Features
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent animate-shimmer"></span>
              </span>
            </h2>
            <p className="text-[#a0e4ff]/70 max-w-2xl mx-auto text-lg">
              Entdecke die innovativen Funktionen unseres dezentralen sozialen Netzwerks
            </p>
          </div>
        </AnimatedSection>
        
        {/* Features grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
          {features.map((feature, index) => (
            <AnimatedSection key={feature.id} delay={300 + index * 100} className="col-span-1">
              <button
                onClick={() => setActiveFeature(feature.id)}
                className={`w-full aspect-square p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-300 group ${
                  activeFeature === feature.id 
                    ? 'bg-[#00a2ff]/20 border border-[#00a2ff]/50 shadow-lg shadow-[#00a2ff]/10' 
                    : 'bg-[#0d0e2c]/50 border border-[#00a2ff]/10 hover:bg-[#0d0e2c] hover:border-[#00a2ff]/30'
                }`}
              >
                <div className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeFeature === feature.id 
                    ? 'bg-[#00a2ff]/30' 
                    : 'bg-[#00a2ff]/10 group-hover:bg-[#00a2ff]/20'
                }`}>
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <h3 className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                  activeFeature === feature.id 
                    ? 'text-[#00a2ff]' 
                    : 'text-white group-hover:text-[#00a2ff]'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-xs text-[#8aa0ff]/70 text-center hidden sm:block">
                  {feature.description}
                </p>
                
                {/* Active indicator */}
                {activeFeature === feature.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-[#00a2ff]/20 border-b border-r border-[#00a2ff]/50"></div>
                )}
              </button>
            </AnimatedSection>
          ))}
        </div>
        
        {/* Feature detail */}
        <AnimatedSection delay={800}>
          <div className="bg-[#0d0e2c]/70 backdrop-blur-lg border border-[#00a2ff]/20 rounded-xl p-6 md:p-8 shadow-lg shadow-black/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-light text-[#00a2ff] mb-2">{activeFeatureObj.title}</h3>
                <p className="text-[#8aa0ff]/90 max-w-2xl">{activeFeatureObj.description}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white px-5 py-2 rounded-full text-sm font-medium tracking-wider transition-all duration-300 shadow-lg shadow-[#00a2ff]/20 hover:shadow-[#00a2ff]/40 transform hover:translate-y-[-2px] flex items-center">
                  <span>Mehr erfahren</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Feature demo component */}
            <div className="bg-[#06071F]/70 border border-[#00a2ff]/10 rounded-lg p-4 md:p-6 min-h-[300px] flex items-center justify-center">
              {activeFeatureObj.component}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FeatureSection; 