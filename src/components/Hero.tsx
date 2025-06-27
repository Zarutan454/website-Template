import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-20 z-10 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6">
              <motion.div 
                className="inline-block px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20 mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <span className="text-primary-400 font-medium">Dezentrales Social Mining Network</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Erstelle <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">eigene Token</span>
                <br /> 
                im Sozialen Netzwerk
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Verdiene durch soziale Aktivitäten, erstelle Token ohne Programmierung und nutze die Kraft des Social Minings in deinem Netzwerk.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/token-wizard">
                <motion.button
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Token erstellen
                  <ArrowRight size={18} className="ml-2" />
                </motion.button>
              </Link>
              
              <Link to="/login">
                <motion.button
                  className="px-8 py-3 rounded-lg font-medium border border-gray-700 text-white hover:bg-dark-100 transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.5)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Mehr erfahren
                </motion.button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-dark-100 border-2 border-dark-300 flex items-center justify-center overflow-hidden">
                    <img src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-gray-300 text-sm">
                <span className="text-primary-400 font-bold">2.500+</span> Nutzer sind bereits dabei
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="bg-dark-100/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl relative z-10">
              <div className="bg-dark-100 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white">Token erstellen</h3>
                  <div className="bg-primary/20 text-primary-400 px-3 py-1 rounded-full text-xs">
                    Beta
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Token Name</label>
                    <input type="text" className="w-full bg-dark-200 border border-gray-700 rounded-lg p-2 text-white" defaultValue="My Community Token" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Symbol</label>
                    <input type="text" className="w-full bg-dark-200 border border-gray-700 rounded-lg p-2 text-white" defaultValue="BSN" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Initial Supply</label>
                    <input type="text" className="w-full bg-dark-200 border border-gray-700 rounded-lg p-2 text-white" defaultValue="1,000,000" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-dark-200 rounded-lg p-3 flex-1 min-w-[120px] border border-white/5">
                  <div className="text-gray-400 text-xs mb-1">Mining Pool</div>
                  <div className="text-white font-bold">500,000 BSN</div>
                </div>
                
                <div className="bg-dark-200 rounded-lg p-3 flex-1 min-w-[120px] border border-white/5">
                  <div className="text-gray-400 text-xs mb-1">Emission</div>
                  <div className="text-white font-bold">2.5% täglich</div>
                </div>
                
                <div className="bg-dark-200 rounded-lg p-3 flex-1 min-w-[120px] border border-white/5">
                  <div className="text-gray-400 text-xs mb-1">Für Aktivität</div>
                  <div className="text-white font-bold">Social Mining</div>
                </div>
              </div>
              
              <Link to="/token-wizard">
                <motion.button
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/20 transition-all"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Token erstellen
                </motion.button>
              </Link>
            </div>
            
            <motion.div 
              className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 8
              }}
            />
            
            <motion.div 
              className="absolute -top-10 -left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 10,
                delay: 1
              }}
            />
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-20 text-dark-200">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-dark-200"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-dark-200"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-dark-200"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
