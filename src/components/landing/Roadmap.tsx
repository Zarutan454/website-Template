
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, CheckCircle, Clock, AlertCircle, Rocket, Smartphone, Palette, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { GradientText } from '@/components/ui/gradient-text';
import { useLanguage } from '@/components/LanguageProvider.utils';

const getRoadmapItems = (language: string) => [
  {
    icon: <Rocket size={24} className="text-pink-400" />,
    title: language === 'de' ? "Plattform-Start 🚀" : "Platform Launch 🚀",
    date: "2023-2024",
    highlights: language === 'de' ? [
      "🏆 Belohnungen für Likes & Beiträge sammeln",
      "💬 Social Feed mit Videos & Memes teilen",
      "👛 Einfache Wallet-Verbindung",
      "🔐 Sichere Anmeldung per E-Mail oder Wallet"
    ] : [
      "🏆 Collect rewards for likes & posts",
      "💬 Share videos & memes in social feed",
      "👛 Easy wallet connection",
      "🔐 Secure login via email or wallet"
    ],
    status: language === 'de' ? "Abgeschlossen" : "Completed",
    userBenefit: language === 'de' 
      ? "Grundlegende Social-Media-Funktionen mit Crypto-Belohnungen" 
      : "Basic social media features with crypto rewards"
  },
  {
    icon: <Smartphone size={24} className="text-yellow-400" />,
    title: language === 'de' ? "Mobile App & Community-Power 📱" : "Mobile App & Community Power 📱",
    date: "2025",
    highlights: language === 'de' ? [
      "📲 Volle Funktionalität auf dem Smartphone",
      "🌟 Achievements & Sammlerabzeichen",
      "🤝 Gruppen erstellen & gemeinsam Projekte starten",
      "🌍 Unterstützung für 15+ Sprachen"
    ] : [
      "📲 Full functionality on smartphones",
      "🌟 Achievements & collectible badges",
      "🤝 Create groups & start projects together",
      "🌍 Support for 15+ languages"
    ],
    status: language === 'de' ? "In Arbeit" : "In Progress",
    userBenefit: language === 'de'
      ? "Überall vernetzt sein und die Community mitgestalten"
      : "Stay connected everywhere and shape the community"
  },
  {
    icon: <Palette size={24} className="text-blue-400" />,
    title: language === 'de' ? "NFT-Kreativwerkstatt 🎨" : "NFT Creative Studio 🎨",
    date: "2026",
    highlights: language === 'de' ? [
      "🖼️ Eigene digitale Kunstwerke erstellen & verkaufen",
      "💎 Exklusive NFT-Kollektionen sammeln",
      "🏛️ Community-Abstimmungen zu neuen Features",
      "🚀 Blitzschnelle Transaktionen"
    ] : [
      "🖼️ Create & sell your own digital artwork",
      "💎 Collect exclusive NFT collections",
      "🏛️ Community voting on new features",
      "🚀 Lightning-fast transactions"
    ],
    status: language === 'de' ? "Geplant" : "Planned",
    userBenefit: language === 'de'
      ? "Kreativ werden und von der Community profitieren"
      : "Get creative and benefit from the community"
  },
  {
    icon: <Coins size={24} className="text-green-400" />,
    title: language === 'de' ? "DeFi-Power für alle 💸" : "DeFi Power for Everyone 💸",
    date: "2027",
    highlights: language === 'de' ? [
      "📈 Token staken & passiv verdienen",
      "🌐 Globale Zahlungsfunktionen",
      "🛡️ Erweiterte Sicherheitsfeatures",
      "🎮 Gamification mit Community-Challenges"
    ] : [
      "📈 Stake tokens & earn passively",
      "🌐 Global payment features",
      "🛡️ Advanced security features",
      "🎮 Gamification with community challenges"
    ],
    status: language === 'de' ? "In Planung" : "In Planning",
    userBenefit: language === 'de'
      ? "Finanzielle Möglichkeiten einfach nutzen"
      : "Easily use financial opportunities"
  }
];

const Roadmap: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const { language } = useLanguage();
  const roadmapItems = getRoadmapItems(language);

  const today = new Date();
  const formattedDate = format(
    today, 
    'd. MMMM yyyy', 
    { locale: language === 'de' ? de : enUS }
  );

  return (
    <section className="py-20 relative bg-dark-200/50 backdrop-blur-md" id="roadmap">
      {/* Background blur elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-pink-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div 
            className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-full backdrop-blur-sm border border-pink-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-pink-400 font-medium">Roadmap</span>
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
              {language === 'de' 
                ? 'Unsere Fortschritte und Zukunftspläne' 
                : 'Our Progress and Future Plans'}
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
              ? 'Unsere Vision für die Zukunft des Blockchain Social Networks. Wir haben bereits wichtige Meilensteine erreicht und arbeiten kontinuierlich an neuen Features, die deinen Token-Erfolg unterstützen.'
              : 'Our vision for the future of the Blockchain Social Network. We have already achieved important milestones and are continuously working on new features to support your token success.'}
          </motion.p>
          
          <motion.div 
            className="inline-flex items-center mt-6 px-4 py-2 bg-dark-300/30 backdrop-blur-md rounded-full border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Calendar size={16} className="text-pink-400 mr-2" />
            <span className="text-white text-sm">
              {language === 'de' ? 'Aktuelles Datum: ' : 'Current Date: '}
              {formattedDate}
            </span>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                variant="glass" 
                className={`p-6 relative overflow-hidden h-full group hover:shadow-lg transition-all duration-300
                  ${item.status === (language === 'de' ? 'Abgeschlossen' : 'Completed') ? 'border-green-500/30 hover:border-green-500/50' : 
                    item.status === (language === 'de' ? 'In Arbeit' : 'In Progress') ? 'border-yellow-500/30 hover:border-yellow-500/50' : 
                    item.status === (language === 'de' ? 'Geplant' : 'Planned') ? 'border-blue-500/30 hover:border-blue-500/50' :
                    'border-pink-500/30 hover:border-pink-500/50'}`}
              >
                {/* Status badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium flex items-center
                  ${item.status === (language === 'de' ? 'Abgeschlossen' : 'Completed') ? 'bg-green-500/20 text-green-400' : 
                    item.status === (language === 'de' ? 'In Arbeit' : 'In Progress') ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : 
                    item.status === (language === 'de' ? 'Geplant' : 'Planned') ? 'bg-blue-500/20 text-blue-400' :
                    'bg-pink-500/20 text-pink-400'}`}
                >
                  {item.status === (language === 'de' ? 'Abgeschlossen' : 'Completed') ? (
                    <><CheckCircle size={14} className="mr-1" /> {item.status}</>
                  ) : item.status === (language === 'de' ? 'In Arbeit' : 'In Progress') ? (
                    <><Clock size={14} className="mr-1" /> {item.status}</>
                  ) : (
                    <><AlertCircle size={14} className="mr-1" /> {item.status}</>
                  )}
                </div>

                {/* Icon and title */}
                <div className="flex items-start mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300
                    ${item.status === (language === 'de' ? 'Abgeschlossen' : 'Completed') ? 'bg-green-500/20 border border-green-500/30' : 
                      item.status === (language === 'de' ? 'In Arbeit' : 'In Progress') ? 'bg-yellow-500/20 border border-yellow-500/30' : 
                      item.status === (language === 'de' ? 'Geplant' : 'Planned') ? 'bg-blue-500/20 border border-blue-500/30' :
                      'bg-pink-500/20 border border-pink-500/30'}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-pink-400 font-medium">{item.date}</p>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-2 mb-4">
                  {item.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start text-gray-300 hover:text-white transition-colors">
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* User benefit */}
                <div className="mt-auto pt-4 border-t border-white/10">
                  <p className="text-white font-medium">
                    {language === 'de' ? 'Dein Vorteil:' : 'Your Benefit:'}
                  </p>
                  <p className="text-gray-400">{item.userBenefit}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
