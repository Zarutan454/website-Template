
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Zap, 
  Users, 
  Layers, 
  PieChart, 
  Shield, 
  Coins, 
  BarChart3, 
  Gift, 
  Globe 
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const Features: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Users size={24} />,
      title: 'Community',
      description: 'Verbinde dich mit Gleichgesinnten, teile Inhalte und bilde wertvolle Netzwerke in der Blockchain-Welt.',
      detail: 'Nutze unsere fortschrittlichen Community-Features wie Gruppen, Direkt-Messaging und Follower-System, um dein Netzwerk zu erweitern und die Reichweite deiner Token zu erhöhen.'
    },
    {
      icon: <Zap size={24} />,
      title: 'Mining',
      description: 'Verdiene BSN Token durch deine Aktivität. Unser einzigartiger Proof-of-Activity Algorithmus belohnt soziale Interaktionen.',
      detail: 'Je aktiver du in der Community bist, desto mehr Token erhältst du. Das Mining basiert auf einem Punktesystem, das Qualität und Engagement berücksichtigt, nicht auf Rechenleistung.'
    },
    {
      icon: <Layers size={24} />,
      title: 'Token-Erstellung',
      description: 'Erstelle eigene Tokens und NFTs für deine Community oder Projekte mit wenigen Klicks ohne Programmierkenntnisse.',
      detail: 'Multi-Chain Unterstützung für Ethereum, Binance Smart Chain, Polygon und weitere Netzwerke. Anpassbare Parameter wie Angebot, Name, Symbol und Tokenomics.'
    },
    {
      icon: <PieChart size={24} />,
      title: 'Analytics',
      description: 'Verfolge deine Belohnungen, Token-Werte und Community-Metriken in Echtzeit mit detaillierten Dashboards.',
      detail: 'Fortschrittliche Visualisierungen für Preisentwicklung, Handelsvolumen, Liquiditätspools und Marktkapitalisierung. Export-Funktionen für steuerliche Dokumentation.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Sicherheit',
      description: 'Deine Daten und Tokens sind durch moderne Blockchain-Technologie und mehrschichtige Sicherheitsmaßnahmen geschützt.',
      detail: 'Regelmäßige Smart Contract Audits, 2-Faktor-Authentifizierung und sichere Wallet-Verbindungsprotokolle. Schutz vor gängigen Angriffen wie Rug Pulls und Flash Loan Exploits.'
    },
    {
      icon: <Coins size={24} />,
      title: 'Airdrops',
      description: 'Erstelle und verwalte Airdrops für deine Community direkt über unsere Plattform mit nur wenigen Klicks.',
      detail: 'Definiere Kriterien für Teilnehmer, setze Zeitpläne und überwache die Verteilung in Echtzeit. Mehrere Verteilungsmethoden wie gleichmäßig, gewichtet oder basierend auf Aktivitäten.'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Tokenomics',
      description: 'Gestalte eine nachhaltige Tokenomics-Struktur mit flexiblen Verteilungsmodellen und Anreizmechanismen.',
      detail: 'Implementiere Vesting-Zeitpläne, Staking-Belohnungen und Governance-Rechte. Analysiere Tokenomics erfolgreicher Projekte als Vorlagen.'
    },
    {
      icon: <Gift size={24} />,
      title: 'Belohnungen',
      description: 'Motiviere deine Community durch automatisierte Belohnungssysteme und Gamification-Elemente.',
      detail: 'Punktesysteme, Abzeichen für Achievements und Ranglisten schaffen Anreize für aktive Teilnahme. Tägliche und wöchentliche Belohnungs-Challenges.'
    },
    {
      icon: <Globe size={24} />,
      title: 'Cross-Chain',
      description: 'Nahtlose Integration mehrerer Blockchain-Netzwerke für maximale Flexibilität und Reichweite.',
      detail: 'Bridge-Funktionalität für Token-Transfers zwischen verschiedenen Blockchains. Unterstützung für Ethereum, BSC, Polygon, Solana und mehr mit einheitlicher Benutzeroberfläche.'
    }
  ];

  return (
    <section className="py-20 relative" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div 
            className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-full backdrop-blur-sm border border-pink-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-pink-400 font-medium">Premium Features</span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-pink-600 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Alles, was du für deine Web3-Community brauchst
          </motion.h2>
          
          <motion.p 
            className="text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            BSN kombiniert Social Media mit Blockchain-Technologie und bietet dir innovative Features, 
            die traditionelle Plattformen nicht haben. Entdecke die Tools, die dein Projekt zum Erfolg führen.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              <Card className="bg-dark-300/70 backdrop-blur-sm border border-white/5 rounded-xl p-6 h-full hover:border-pink-500/30 transition-all duration-300 relative z-10 overflow-hidden">
                {/* Gradient background that shows on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                
                {/* Feature content */}
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-pink-300 transition-colors">{feature.title}</h3>
                  
                  <div className="min-h-[80px]">
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {hoveredFeature === index ? feature.detail : feature.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 h-1.5 w-1/3 bg-pink-500/30 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-pink-500 to-pink-600"
                      initial={{ width: 0 }}
                      animate={hoveredFeature === index ? { width: '100%' } : { width: '30%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="inline-flex items-center justify-center">
            <div className="px-6 py-3 bg-dark-300/80 backdrop-blur-sm rounded-xl border border-pink-500/20 inline-flex items-center">
              <div className="flex space-x-1 mr-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <span className="text-white">
                <span className="font-medium">98% unserer Nutzer</span> empfehlen BSN weiter
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
