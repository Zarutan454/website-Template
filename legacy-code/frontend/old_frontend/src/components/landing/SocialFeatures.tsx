import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MessageSquare, Users, Share2, Zap, Activity, Bell, Heart, Award, Shield, Coins as CoinsIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { useLanguage } from '@/components/LanguageProvider';

const SocialFeatures: React.FC = () => {
  const id = "social-networking";
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const [activeTab, setActiveTab] = useState<string>('community');
  const { t, language } = useLanguage();
  
  const tabs = [{
    id: 'community',
    name: language === 'de' ? 'Community' : 'Community',
    icon: <Users size={20} />
  }, {
    id: 'engagement',
    name: language === 'de' ? 'Engagement' : 'Engagement',
    icon: <Activity size={20} />
  }, {
    id: 'rewards',
    name: language === 'de' ? 'Belohnungen' : 'Rewards',
    icon: <Award size={20} />
  }];
  interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
  const features: Record<string, Feature[]> = {
    community: [{
      icon: <Users size={24} />,
      title: 'Gruppen',
      description: 'Erstelle thematische Gruppen für deine Community und verbinde Mitglieder mit ähnlichen Interessen.'
    }, {
      icon: <MessageSquare size={24} />,
      title: 'Messenger',
      description: 'Direkte verschlüsselte Kommunikation zwischen Mitgliedern mit Unterstützung für Medienanhänge und Emojis.'
    }, {
      icon: <Bell size={24} />,
      title: 'Benachrichtigungen',
      description: 'Personalisiertes Benachrichtigungssystem, das dich über wichtige Aktivitäten und Token-Ereignisse informiert.'
    }, {
      icon: <Shield size={24} />,
      title: 'Privatsphäre',
      description: 'Erweiterte Privatsphäre-Einstellungen mit mehrschichtiger Kontrolle darüber, wer deine Inhalte sehen kann.'
    }],
    engagement: [{
      icon: <Share2 size={24} />,
      title: 'Content Sharing',
      description: 'Teile Beiträge, Bilder und Videos mit deiner Community und verbreite Inhalte auf anderen Plattformen.'
    }, {
      icon: <Heart size={24} />,
      title: 'Likes & Reaktionen',
      description: 'Interaktives Reaktionssystem mit Belohnungen für aktive Nutzer und qualitativ hochwertige Beiträge.'
    }, {
      icon: <Zap size={24} />,
      title: 'Aktivitätsstreaks',
      description: 'Behalte deinen Aktivitätsstreak bei und erhalte Bonusbelohnungen für konsistente Teilnahme.'
    }, {
      icon: <Award size={24} />,
      title: 'Badges & Auszeichnungen',
      description: 'Verdiene Badges für besondere Leistungen und hebe dein Profil in der Community hervor.'
    }],
    rewards: [{
      icon: <CoinsIcon size={24} />,
      title: 'Token Rewards',
      description: 'Verdiene BSN-Token für wertvolle Beiträge, Kommentare und soziale Interaktionen.'
    }, {
      icon: <Activity size={24} />,
      title: 'Proof of Activity',
      description: 'Unser einzigartiger Mining-Algorithmus belohnt qualitativ hochwertige Aktivitäten statt Rechenleistung.'
    }, {
      icon: <Award size={24} />,
      title: 'Leaderboards',
      description: 'Wöchentliche und monatliche Ranglisten mit Sonderprämien für die aktivsten Community-Mitglieder.'
    }, {
      icon: <Shield size={24} />,
      title: 'Sybil-Schutz',
      description: 'Fortschrittliche Anti-Betrugs-Mechanismen schützen das Belohnungssystem vor Manipulation.'
    }]
  };
  
  const hideScrollbarStyle = `
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;
  
  return (
    <>
      <style>{hideScrollbarStyle}</style>
      <section className="py-20 relative hide-scrollbar bg-dark-200/50 backdrop-blur-sm" id="social-features">
        {/* Background gradient elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div 
              className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-full backdrop-blur-sm border border-pink-500/20" 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5 }}
            >
              <span className="text-pink-400 font-medium">
                {language === 'de' ? 'Soziale Features' : 'Social Features'}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GradientText 
                variant="primary" 
                className="text-3xl md:text-4xl font-bold mb-6"
                animate={true}
              >
                {language === 'de' ? 'Mehr als nur ein Blockchain-Projekt' : 'More than just a Blockchain Project'}
              </GradientText>
            </motion.div>
            
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto" 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {language === 'de' 
                ? 'BSN kombiniert das Beste aus sozialen Netzwerken mit den Vorteilen der Blockchain-Technologie. Baue deine Community auf, belohne aktive Mitglieder und schaffe ein florierendes Ökosystem.'
                : 'BSN combines the best of social networks with the advantages of blockchain technology. Build your community, reward active members, and create a thriving ecosystem.'}
            </motion.p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-dark-300/50 backdrop-blur-lg p-1 rounded-lg flex border border-white/5 shadow-lg">
              {tabs.map(tab => (
                <motion.button 
                  key={tab.id} 
                  className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-dark-300/70'
                  }`} 
                  onClick={() => setActiveTab(tab.id)} 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.3 }} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 hide-scrollbar"
          >
            {features[activeTab]?.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: index * 0.1 }} 
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <Card 
                  variant="glass" 
                  className="rounded-xl p-6 h-full hover:border-pink-500/30 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-all duration-300">
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-pink-300 transition-colors duration-300">{feature.title}</h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default SocialFeatures;
