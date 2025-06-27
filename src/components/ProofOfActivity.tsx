
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Zap, 
  MessageSquare, 
  Share2, 
  ThumbsUp, 
  Award, 
  Users, 
  Gift, 
  TrendingUp,
  Clock
} from 'lucide-react';

const ProofOfActivity: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div id="proof-of-activity" className="bg-gradient-to-b from-dark-100 to-dark-200 py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary-500/10 to-secondary-600/10 rounded-full backdrop-blur-sm border border-primary-500/20">
            <span className="text-primary-400 font-medium">Revolutionäres Konzept</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Verdiene Token durch Proof-of-Activity Mining
          </h2>
          <p className="text-gray-300 text-lg">
            Blockchain Social Network führt ein einzigartiges Proof-of-Activity-System ein, bei dem du BSN Token durch deine Aktivitäten und Engagement auf der Plattform verdienst.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Side - Mining Explanation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="bg-dark-100/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">So funktioniert Proof-of-Activity Mining</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg mb-1">Soziale Aktivitäten</h4>
                    <p className="text-gray-400">
                      Jede Interaktion auf der Plattform - Posten, Kommentieren, Teilen, Liken - generiert Aktivitätspunkte, die in BSN Token umgewandelt werden.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Award size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg mb-1">Qualitäts-Belohnungen</h4>
                    <p className="text-gray-400">
                      Hochwertige Beiträge, die viel Engagement erhalten, werden mit zusätzlichen Token belohnt. Qualität wird über Quantität gestellt.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg mb-1">Tägliche Mining-Limits</h4>
                    <p className="text-gray-400">
                      Ein faires System mit täglichen Mining-Limits stellt sicher, dass alle Nutzer die gleiche Chance haben, Token zu verdienen, unabhängig davon, wann sie der Plattform beitreten.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg mb-1">Staking & Governance</h4>
                    <p className="text-gray-400">
                      Stake deine BSN Token, um zusätzliche Belohnungen zu erhalten und an der Governance der Plattform teilzunehmen. Entscheide mit über zukünftige Features und Entwicklungen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Activity Rewards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:w-1/2"
          >
            <div className="bg-dark-100/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 relative overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-6">Aktivitäts-Belohnungen</h3>
              
              <div className="space-y-4">
                <div className="bg-dark-200/70 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <ThumbsUp size={20} className="text-primary-400 mr-3" />
                    <span className="text-white">Like / Reaktion</span>
                  </div>
                  <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                    +1 BSN
                  </div>
                </div>
                
                <div className="bg-dark-200/70 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare size={20} className="text-primary-400 mr-3" />
                    <span className="text-white">Kommentar</span>
                  </div>
                  <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                    +2 BSN
                  </div>
                </div>
                
                <div className="bg-dark-200/70 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Share2 size={20} className="text-primary-400 mr-3" />
                    <span className="text-white">Teilen / Repost</span>
                  </div>
                  <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                    +3 BSN
                  </div>
                </div>
                
                <div className="bg-dark-200/70 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap size={20} className="text-primary-400 mr-3" />
                    <span className="text-white">Originaler Post</span>
                  </div>
                  <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                    +5 BSN
                  </div>
                </div>
                
                <div className="bg-dark-200/70 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Gift size={20} className="text-primary-400 mr-3" />
                    <span className="text-white">Airdrop Teilnahme</span>
                  </div>
                  <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                    +10 BSN
                  </div>
                </div>
                
                <div className="bg-dark-200/70 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Award size={20} className="text-primary-400 mr-3" />
                    <span className="text-white">Trending Post</span>
                  </div>
                  <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                    +25 BSN
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gradient-to-r from-primary-500/20 to-secondary-600/20 rounded-lg p-4 border border-primary-500/30">
                <h4 className="text-white font-medium mb-2">Tägliches Mining-Limit</h4>
                <div className="w-full bg-dark-200 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-600 h-3 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-400 font-medium">70 / 100 BSN</span>
                  <span className="text-gray-400">Verbleibend heute: 30 BSN</span>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl"
                animate={{ 
                  x: [0, 20, 0], 
                  y: [0, -20, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 8,
                  ease: "easeInOut" 
                }}
              />
            </div>
          </motion.div>
        </div>
        
        {/* Token Utility Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">BSN Token Utility</h3>
            <p className="text-gray-300">
              Der BSN Token ist das Herzstück unseres Ökosystems mit vielfältigen Anwendungsmöglichkeiten.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-dark-100/50 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mb-3">
                <Zap size={20} className="text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Platform-Gebühren</h4>
              <p className="text-gray-400 text-sm">
                Bezahle Token-Erstellungs- und Deployment-Gebühren mit BSN und erhalte Rabatte gegenüber anderen Zahlungsmethoden.
              </p>
            </div>
            
            <div className="bg-dark-100/50 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mb-3">
                <Award size={20} className="text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Premium-Features</h4>
              <p className="text-gray-400 text-sm">
                Schalte exklusive Features, erweiterte Analytics und Premium-Support mit BSN Token frei.
              </p>
            </div>
            
            <div className="bg-dark-100/50 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mb-3">
                <Users size={20} className="text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Governance</h4>
              <p className="text-gray-400 text-sm">
                Stimme über Plattform-Updates, neue Features und Änderungen am Ökosystem ab. Dein Stimmgewicht basiert auf deinem BSN-Bestand.
              </p>
            </div>
            
            <div className="bg-dark-100/50 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mb-3">
                <Gift size={20} className="text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Airdrops & Rewards</h4>
              <p className="text-gray-400 text-sm">
                Erstelle und verteile Airdrops an deine Community. BSN-Inhaber erhalten exklusive Airdrops von Partnerprojekten.
              </p>
            </div>
            
            <div className="bg-dark-100/50 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Staking & Rewards</h4>
              <p className="text-gray-400 text-sm">
                Stake deine BSN Token, um passive Belohnungen zu verdienen und zusätzliche Vorteile auf der Plattform zu erhalten.
              </p>
            </div>
            
            <div className="bg-dark-100/50 backdrop-blur-sm p-5 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Community-Status</h4>
              <p className="text-gray-400 text-sm">
                Dein BSN-Bestand bestimmt deinen Status in der Community, schaltet spezielle Badges frei und erhöht deine Sichtbarkeit.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProofOfActivity;
