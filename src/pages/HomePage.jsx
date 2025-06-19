import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import EnhancedBackground from '../components/ui/EnhancedBackground';
import SectionTitle from '../components/ui/SectionTitle';
import PageTemplate from '../components/templates/PageTemplate';

const HomePage = () => {
  const { t } = useTranslation();
  
  // Feature-Highlights für die Startseite
  const featureHighlights = [
    {
      title: t('homepage.features.dezentralesProfilTitle', 'Dezentrales Profil'),
      description: t('homepage.features.dezentralesProfilDesc', 'Dein BSN-Profil gehört dir. Alle deine Daten werden dezentral gespeichert und du behältst die volle Kontrolle.'),
      icon: "👤",
      link: "/features#social"
    },
    {
      title: t('homepage.features.tokenMiningTitle', 'Token-Mining'),
      description: t('homepage.features.tokenMiningDesc', 'Verdiene BSN-Token durch aktive Teilnahme am Netzwerk. Je mehr Wert du für die Community schaffst, desto mehr verdienst du.'),
      icon: "⛏️",
      link: "/features#blockchain"
    },
    {
      title: t('homepage.features.daoGovernanceTitle', 'DAO-Governance'),
      description: t('homepage.features.daoGovernanceDesc', 'Als BSN-Token-Inhaber kannst du über Plattformänderungen abstimmen und aktiv an der Entwicklung teilnehmen.'),
      icon: "🏛️",
      link: "/features#governance"
    }
  ];

  return (
    <PageTemplate>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Feature Highlights Section */}
      <section className="py-20 relative overflow-hidden">
        <EnhancedBackground type="hexagons" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle
            title={t('homepage.features.title')}
            subtitle={t('homepage.features.subtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {featureHighlights.map((feature, index) => (
              <div 
                key={index} 
                className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-8 hover:border-[#00a2ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00a2ff]/10 group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-light text-white mb-3 group-hover:text-[#00a2ff] transition-colors">{feature.title}</h3>
                <p className="text-white/70 mb-6">{feature.description}</p>
                <Link 
                  to={feature.link} 
                  className="text-[#00a2ff] hover:underline"
                >
                  {t('common.learnMore')} →
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/features" 
              className="bg-transparent border border-[#00a2ff] text-[#00a2ff] px-8 py-3 rounded-full hover:bg-[#00a2ff]/10 transition duration-300 text-lg"
            >
              {t('homepage.features.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* 3. About/Über uns Section (Kurzversion) */}
      <section id="about" className="py-20 relative overflow-hidden bg-black/30">
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle
            title={t('homepage.about.title')}
            subtitle={t('homepage.about.subtitle')}
          />

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white/80 leading-relaxed text-lg mb-8">
              {t('homepage.about.description')}
            </p>
            <Link 
              to="/about" 
              className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 text-lg"
            >
              {t('common.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Tokenomics Preview */}
      <section className="py-20 relative overflow-hidden">
        <EnhancedBackground type="dataFlow" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle
            title={t('homepage.tokenomics.title')}
            subtitle={t('homepage.tokenomics.subtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 text-center">
              <h3 className="text-xl font-light text-[#00a2ff] mb-2">{t('homepage.tokenomics.governance')}</h3>
              <p className="text-white/70">{t('homepage.tokenomics.governanceDesc', 'Stimme über Plattformänderungen ab und gestalte die Zukunft von BSN mit')}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 text-center">
              <h3 className="text-xl font-light text-[#00a2ff] mb-2">{t('homepage.tokenomics.staking')}</h3>
              <p className="text-white/70">{t('homepage.tokenomics.stakingDesc', 'Verdiene passive Einnahmen durch das Staken deiner BSN-Tokens')}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 text-center">
              <h3 className="text-xl font-light text-[#00a2ff] mb-2">{t('homepage.tokenomics.rewards')}</h3>
              <p className="text-white/70">{t('homepage.tokenomics.rewardsDesc', 'Erhalte Tokens für wertvolle Beiträge zum Netzwerk')}</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/tokenomics" 
              className="bg-transparent border border-[#00a2ff] text-[#00a2ff] px-8 py-3 rounded-full hover:bg-[#00a2ff]/10 transition duration-300 text-lg mr-4"
            >
              {t('homepage.tokenomics.explore')}
            </Link>
            <Link 
              to="/token-reservation" 
              className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 text-lg"
            >
              {t('common.tokenReservation')}
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Community Preview */}
      <section className="py-20 relative overflow-hidden bg-black/30">
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle
            title={t('homepage.community.title')}
            subtitle={t('homepage.community.subtitle')}
          />

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white/80 leading-relaxed text-lg mb-8">
              {t('homepage.community.description')}
            </p>
            <Link 
              to="/community" 
              className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 text-lg"
            >
              {t('common.joinCommunity')}
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Roadmap Preview */}
      <section className="py-20 relative overflow-hidden">
        <EnhancedBackground type="particles" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle
            title={t('homepage.roadmap.title')}
            subtitle={t('homepage.roadmap.subtitle')}
          />

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white/80 leading-relaxed text-lg mb-8">
              {t('homepage.roadmap.description')}
            </p>
            <Link 
              to="/roadmap" 
              className="bg-transparent border border-[#00a2ff] text-[#00a2ff] px-8 py-3 rounded-full hover:bg-[#00a2ff]/10 transition duration-300 text-lg"
            >
              {t('homepage.roadmap.viewRoadmap', 'Roadmap ansehen')}
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-black/60 to-black">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl font-light text-white mb-6">{t('homepage.cta.title')}</h2>
          <p className="text-white/80 leading-relaxed text-lg mb-8 max-w-2xl mx-auto">
            {t('homepage.cta.description')}
          </p>
          <Link 
            to="/token-reservation" 
            className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 text-lg"
          >
            {t('common.tokenReservation')}
          </Link>
        </div>
      </section>
    </PageTemplate>
  );
};

export default HomePage;