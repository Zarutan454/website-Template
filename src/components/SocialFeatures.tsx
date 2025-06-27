
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  MessageSquare, 
  Heart, 
  Award, 
  TrendingUp, 
  Share2, 
  ThumbsUp, 
  Users,
  Zap
} from 'lucide-react';

const SocialFeatures: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const socialFeatures = [
    {
      icon: <MessageSquare size={20} className="text-primary-400" />,
      title: "Kommentare",
      description: "Belohnungen für die Teilnahme an Diskussionen und Kommentare zu Beiträgen.",
      value: "+3 Token"
    },
    {
      icon: <Heart size={20} className="text-pink-400" />,
      title: "Likes",
      description: "Erhalte Token für Likes an deinen Beiträgen und vergebe diese auch an andere.",
      value: "+1 Token"
    },
    {
      icon: <Award size={20} className="text-yellow-400" />,
      title: "Auszeichnungen",
      description: "Spezielle Belohnungen für besonders wertvolle Beiträge in der Community.",
      value: "+10 Token"
    },
    {
      icon: <TrendingUp size={20} className="text-green-400" />,
      title: "Trending-Beiträge",
      description: "Bonustoken für Beiträge, die in den Trending-Themen erscheinen.",
      value: "+15 Token"
    },
    {
      icon: <Share2 size={20} className="text-blue-400" />,
      title: "Teilen",
      description: "Teile Beiträge mit deinem Netzwerk und erhalte Belohnungen.",
      value: "+5 Token"
    },
    {
      icon: <ThumbsUp size={20} className="text-purple-400" />,
      title: "Wertvolle Beiträge",
      description: "Erhalte Token, wenn deine Beiträge von der Community als wertvoll eingestuft werden.",
      value: "+8 Token"
    }
  ];

  return (
    <div id="social-platform" className="bg-dark-200 py-20 md:py-32 overflow-hidden relative">
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60"
        animate={{ 
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 15,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-50"
        animate={{ 
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 18,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20">
            <span className="text-primary-400 font-medium">Social Mining</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Verdiene durch <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">soziale Aktivitäten</span> Token
          </h2>
          <p className="text-gray-300 text-lg">
            Unser einzigartiges Social-Mining-System belohnt Engagement und Aktivität in deiner Community - ohne Rechenleistung oder Hardware.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-2"
          >
            <div className="bg-dark-100/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-6">Social Activity Feed</h3>
              
              <div className="space-y-4">
                {/* Post 1 */}
                <motion.div 
                  className="bg-dark-200/70 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold">J</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">Julia Schmidt</h4>
                          <p className="text-gray-400 text-sm">Vor 2 Stunden</p>
                        </div>
                        <div className="bg-primary/20 text-primary-400 px-2 py-1 rounded-full text-xs flex items-center">
                          <Zap size={12} className="mr-1" /> +8 CMT erhalten
                        </div>
                      </div>
                      <p className="text-gray-300 mt-2 mb-3">
                        Ich finde das neue Social-Mining-Konzept wirklich interessant. Es motiviert mich, mehr qualitative Inhalte zu teilen und mit der Community zu interagieren! 🚀
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <Heart size={16} className="mr-1" /> 24
                        </button>
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <MessageSquare size={16} className="mr-1" /> 8
                        </button>
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <Share2 size={16} className="mr-1" /> Teilen
                        </button>
                        <div className="text-gray-400 ml-auto flex items-center">
                          <Award size={16} className="text-yellow-400 mr-1" /> Top Beitrag
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Post 2 */}
                <motion.div 
                  className="bg-dark-200/70 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                        <span className="text-white font-bold">M</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">Max Weber</h4>
                          <p className="text-gray-400 text-sm">Vor 5 Stunden</p>
                        </div>
                        <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs flex items-center">
                          <Zap size={12} className="mr-1" /> +5 CMT erhalten
                        </div>
                      </div>
                      <p className="text-gray-300 mt-2 mb-3">
                        Habe gerade meinen ersten Community-Token erstellt! Der Prozess war super einfach. Hat jemand schon Erfahrungen mit den Mining-Rates gemacht? Welche Einstellungen verwendet ihr? 🤔
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <Heart size={16} className="mr-1" /> 16
                        </button>
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <MessageSquare size={16} className="mr-1" /> 12
                        </button>
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <Share2 size={16} className="mr-1" /> Teilen
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Post 3 */}
                <motion.div 
                  className="bg-dark-200/70 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold">L</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">Lisa Müller</h4>
                          <p className="text-gray-400 text-sm">Gestern</p>
                        </div>
                        <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs flex items-center">
                          <Zap size={12} className="mr-1" /> +15 CMT erhalten
                        </div>
                      </div>
                      <p className="text-gray-300 mt-2 mb-3">
                        Tutorial: So nutzt ihr Proof-of-Activity optimal für eure Community 📝

Ich habe einen ausführlichen Guide erstellt, wie ihr mit dem PoA-System die Aktivität in eurer Community steigern könnt. Link in den Kommentaren! #TokenForge #Community #Tutorial
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <Heart size={16} className="mr-1" /> 42
                        </button>
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <MessageSquare size={16} className="mr-1" /> 15
                        </button>
                        <button className="flex items-center text-gray-400 hover:text-primary-400">
                          <Share2 size={16} className="mr-1" /> Teilen
                        </button>
                        <div className="text-gray-400 ml-auto flex items-center">
                          <TrendingUp size={16} className="text-green-400 mr-1" /> Trending
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-primary-400 hover:text-primary-300 transition-colors">
                  Mehr Beiträge laden
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Social Mining Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="bg-dark-100/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Mining-Aktivitäten</h3>
              
              <div className="space-y-4">
                {socialFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-dark-200/70 p-3 rounded-lg flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-dark-300 flex items-center justify-center mr-3">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">{feature.title}</h4>
                        <p className="text-gray-400 text-xs">{feature.description}</p>
                      </div>
                    </div>
                    <div className="text-primary-400 font-medium text-sm">
                      {feature.value}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-dark-200/70 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users size={18} className="text-primary-400 mr-2" />
                    <h4 className="font-medium text-white">Community-Aktivität</h4>
                  </div>
                  <div className="text-green-400 text-sm font-medium flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    +24%
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Tägliche Aktivität</span>
                      <span className="text-primary-400">85%</span>
                    </div>
                    <div className="w-full bg-dark-300 rounded-full h-1.5">
                      <motion.div 
                        className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={inView ? { width: "85%" } : { width: "0%" }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Neue Beiträge</span>
                      <span className="text-primary-400">68%</span>
                    </div>
                    <div className="w-full bg-dark-300 rounded-full h-1.5">
                      <motion.div 
                        className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={inView ? { width: "68%" } : { width: "0%" }}
                        transition={{ duration: 1, delay: 0.6 }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Kommentare</span>
                      <span className="text-primary-400">92%</span>
                    </div>
                    <div className="w-full bg-dark-300 rounded-full h-1.5">
                      <motion.div 
                        className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={inView ? { width: "92%" } : { width: "0%" }}
                        transition={{ duration: 1, delay: 0.8 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeatures;
