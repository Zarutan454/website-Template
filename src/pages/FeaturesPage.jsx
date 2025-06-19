import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { safeT, safeObjectT } from '../utils/i18nUtils';
import PageTemplate from '../components/templates/PageTemplate';
import CTA from '../components/CTA';
import EnhancedBackground from '../components/ui/EnhancedBackground';

const FeaturesPage = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('social');
  const [activeFeature, setActiveFeature] = useState(null);

  // Verwende die safeObjectT-Funktion für Objekt-Übersetzungen mit korrektem Format
  const categories = safeObjectT(t, 'featuresPage.categories', [
    {
      title: "Social Features",
      description: "Discover the social functions of the BSN network",
      id: "social",
      features: [
        {
          title: "Decentralized Profile",
          description: "Your BSN profile belongs to you. All your data is stored decentrally and you maintain full control.",
          icon: "👤",
          details: [
            "Complete data control by the user",
            "Encrypted storage of personal information",
            "Portability between different Web3 applications",
            "Self-sovereign identity"
          ]
        },
        {
          title: "Crypto Messenger",
          description: "Communicate securely and privately with end-to-end encryption. Send messages, cryptocurrencies, and NFTs directly to other users.",
          icon: "💬",
          details: [
            "End-to-end encryption for maximum privacy",
            "Integrated crypto payments in chats",
            "File deletion after time expiration possible",
            "Group conversations with blockchain voting"
          ]
        },
        {
          title: "Community Groups",
          description: "Create and join groups based on common interests. All group decisions are transparently stored on the blockchain.",
          icon: "👥",
          details: [
            "DAO-based group structure",
            "Transparent decision making",
            "Token-controlled access rights",
            "Shared resource management"
          ]
        }
      ]
    },
    {
      title: "Blockchain Features",
      description: "Experience the benefits of blockchain integration",
      id: "blockchain",
      features: [
        {
          title: "Integrated Wallet",
          description: "Manage your cryptocurrencies and NFTs directly in the BSN platform without external wallets.",
          icon: "💼",
          details: [
            "Multi-chain support",
            "Seamless integration with all BSN functions",
            "Simplified transactions within the network",
            "Secure key management with recovery options"
          ]
        },
        {
          title: "Token Mining",
          description: "Earn BSN tokens through active participation in the network. The more value you create for the community, the more you earn.",
          icon: "⛏️",
          details: [
            "Proof-of-contribution mining mechanism",
            "Rewards for quality content and engagement",
            "Daily mining limits to prevent spam",
            "Transparent reward algorithms"
          ]
        },
        {
          title: "NFT Marketplace",
          description: "Create, buy, and sell NFTs directly on the platform. Share your creations with the community and earn from them.",
          icon: "🖼️",
          details: [
            "Easy NFT creation without technical know-how",
            "Low transaction fees through Layer-2 integration",
            "Automatic licensing and rights management",
            "Collections and exhibitions for artists"
          ]
        }
      ]
    },
    {
      title: "Governance Features",
      description: "Participate in platform development",
      id: "governance",
      features: [
        {
          title: "DAO Governance",
          description: "As a BSN token holder, you can vote on platform changes and actively participate in development.",
          icon: "🏛️",
          details: [
            "Quadratic voting for fair decision making",
            "Delegation options for passive participants",
            "Transparent proposal processes",
            "Automatic implementation of accepted proposals"
          ]
        },
        {
          title: "Decentralized Moderation",
          description: "The community moderates content together. No central team decides what is allowed and what is not.",
          icon: "⚖️",
          details: [
            "Stake-based moderation system",
            "Incentives for fair and consistent moderation",
            "Multi-layered review processes",
            "Transparent moderation guidelines"
          ]
        },
        {
          title: "Transparent Finances",
          description: "All platform revenue and expenses are transparently displayed on the blockchain and can be viewed by anyone.",
          icon: "📊",
          details: [
            "Real-time financial reporting on the blockchain",
            "Community votes on budget allocations",
            "Automated profit distribution to token holders",
            "Fully audited smart contracts"
          ]
        }
      ]
    }
  ]);

  // Finde die aktive Kategorie
  const activeFeatures = categories.find(cat => cat.id === activeCategory)?.features || [];

  // Finde das aktive Feature
  const featureDetails = activeFeature ? activeFeatures.find(f => f.title === activeFeature) : null;

  return (
    <PageTemplate>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <EnhancedBackground type="particles" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light text-white mb-6">{safeT(t, 'featuresPage.title', 'Features')}</h1>
            <p className="text-xl text-white/80">{safeT(t, 'featuresPage.subtitle', 'Discover all the powerful features of the BSN platform')}</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-6 py-3 rounded-full transition-all ${
                  activeCategory === category.id
                    ? 'bg-[#00a2ff] text-white'
                    : 'bg-gray-800 text-white/70 hover:bg-gray-700'
                }`}
                onClick={() => {
                  setActiveCategory(category.id);
                  setActiveFeature(null);
                }}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/* Category Description */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-light text-white mb-3">
              {categories.find(cat => cat.id === activeCategory)?.title}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              {categories.find(cat => cat.id === activeCategory)?.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeFeatures.map((feature, index) => (
              <div
                key={index}
                className={`bg-gray-800 border ${
                  activeFeature === feature.title ? 'border-[#00a2ff]' : 'border-gray-700'
                } rounded-xl p-6 cursor-pointer hover:border-[#00a2ff]/50 transition-all`}
                onClick={() => setActiveFeature(feature.title === activeFeature ? null : feature.title)}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
                
                {activeFeature === feature.title && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="text-sm uppercase tracking-wider text-[#00a2ff] mb-3">Details</h4>
                    <ul className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#00a2ff] mr-2">•</span>
                          <span className="text-white/80">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <CTA 
            title={safeT(t, 'featuresPage.ctaTitle', 'Ready to experience these features?')}
            buttonText={t('common.tokenReservation')}
            buttonLink="/token-reservation"
            dark={true}
          />
        </div>
      </section>
    </PageTemplate>
  );
};

export default FeaturesPage;
