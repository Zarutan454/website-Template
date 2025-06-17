
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Apple, Smartphone, Download, AlertCircle } from 'lucide-react';
import { GradientText } from '@/components/ui/gradient-text';
import { useLanguage } from '@/components/LanguageProvider';

const AppDownload: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { t, language } = useLanguage();

  return (
    <section className="py-20 relative bg-gradient-to-b from-dark-100 to-dark-200" id="app-download">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mobile App Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="relative z-10 mx-auto"
              >
                <div className="relative w-[280px] h-[570px] bg-dark-100 rounded-[36px] border-[8px] border-dark-300 shadow-xl overflow-hidden mx-auto">
                  <div className="absolute top-0 left-0 right-0 h-6 bg-dark-300 flex justify-center items-end pb-1">
                    <div className="w-20 h-1.5 bg-dark-400 rounded-full"></div>
                  </div>
                  <div className="pt-6 h-full bg-dark-200">
                    {/* Mock App Interface */}
                    <div className="px-3 py-2">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-white font-bold">BSN App</div>
                        <div className="w-8 h-8 rounded-full bg-dark-300 flex items-center justify-center">
                          <Download size={16} className="text-pink-400" />
                        </div>
                      </div>
                      
                      <div className="bg-dark-300 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-semibold">Wallet</div>
                          <div className="text-pink-400 text-sm">Ansehen</div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">2,542.25 BSN</div>
                        <div className="text-green-400 text-sm">+15.4% (24h)</div>
                      </div>
                      
                      <div className="bg-dark-300 rounded-xl p-4 mb-4">
                        <div className="text-white font-semibold mb-3">Mining Status</div>
                        <div className="flex justify-between text-sm mb-2">
                          <div className="text-gray-400">Heutige Rate</div>
                          <div className="text-white">6.2 BSN/Stunde</div>
                        </div>
                        <div className="h-2 bg-dark-200 rounded-full mb-3">
                          <div className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full w-[65%]"></div>
                        </div>
                        <div className="px-3 py-1.5 bg-pink-500/20 text-pink-400 text-sm rounded-lg inline-flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Aktiv
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-dark-300 rounded-xl p-3 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                            <MessageIcon size={16} className="text-pink-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm">Community Feed</div>
                          </div>
                        </div>
                        
                        <div className="bg-dark-300 rounded-xl p-3 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                            <CoinIcon size={16} className="text-pink-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm">Token Creator</div>
                          </div>
                        </div>
                        
                        <div className="bg-dark-300 rounded-xl p-3 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                            <UsersIcon size={16} className="text-pink-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm">Freunde</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Coming Soon Label */}
            <div className="absolute top-5 right-0 md:right-20 transform rotate-12 bg-yellow-400 text-yellow-900 font-bold py-1 px-4 rounded-lg shadow-lg z-20">
              Coming Soon
            </div>
          </motion.div>
          
          {/* Download Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-full backdrop-blur-sm border border-pink-500/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-pink-400 font-medium">{language === 'de' ? 'Mobile Apps' : 'Mobile Apps'}</span>
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
                  ? 'BSN in deiner Tasche' 
                  : 'BSN in your pocket'}
              </GradientText>
            </motion.div>
            
            <p className="text-gray-400 mb-8">
              {language === 'de'
                ? 'Nimm BSN überall mit hin. Unsere mobilen Apps bieten dir alle Funktionen der Web-Plattform, optimiert für unterwegs. Mine Token, interagiere mit deiner Community und verwalte deine Assets, egal wo du bist.'
                : 'Take BSN everywhere. Our mobile apps offer all the features of the web platform, optimized for on-the-go. Mine tokens, interact with your community, and manage your assets, no matter where you are.'}
            </p>
            
            <div className="bg-dark-300/30 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8 hover:border-pink-500/20 transition-all duration-300">
              <div className="flex items-start">
                <AlertCircle size={24} className="text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold mb-2">
                    {language === 'de' ? 'Noch nicht verfügbar' : 'Not yet available'}
                  </h3>
                  <p className="text-gray-400">
                    {language === 'de'
                      ? 'Unsere mobilen Apps befinden sich derzeit in der Entwicklung und werden bald für iOS und Android verfügbar sein. Registriere dich für die Benachrichtigung, sobald sie verfügbar sind.'
                      : 'Our mobile apps are currently in development and will soon be available for iOS and Android. Register for notification as soon as they are available.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center group">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckIcon size={20} className="text-green-400" />
                </div>
                <span className="text-white">
                  {language === 'de' 
                    ? 'Nahtlose Synchronisation mit der Web-Plattform' 
                    : 'Seamless synchronization with the web platform'}
                </span>
              </div>
              
              <div className="flex items-center group">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckIcon size={20} className="text-green-400" />
                </div>
                <span className="text-white">
                  {language === 'de' 
                    ? 'Push-Benachrichtigungen für wichtige Events' 
                    : 'Push notifications for important events'}
                </span>
              </div>
              
              <div className="flex items-center group">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckIcon size={20} className="text-green-400" />
                </div>
                <span className="text-white">
                  {language === 'de' 
                    ? 'Mobile Mining mit Energiespar-Modus' 
                    : 'Mobile mining with energy-saving mode'}
                </span>
              </div>
              
              <div className="flex items-center group">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckIcon size={20} className="text-green-400" />
                </div>
                <span className="text-white">
                  {language === 'de' 
                    ? 'Integrierte Wallet mit Biometrie-Sicherung' 
                    : 'Integrated wallet with biometric security'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <motion.button
                  className="w-full py-3 px-6 bg-dark-300/50 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center hover:bg-dark-200/70 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled
                >
                  <Apple size={20} className="mr-2 text-white" />
                  <span className="text-white font-medium">
                    {language === 'de' ? 'iOS (Demnächst)' : 'iOS (Coming Soon)'}
                  </span>
                </motion.button>
              </div>
              
              <div className="flex-1">
                <motion.button
                  className="w-full py-3 px-6 bg-dark-300/50 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center hover:bg-dark-200/70 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled
                >
                  <Smartphone size={20} className="mr-2 text-white" />
                  <span className="text-white font-medium">
                    {language === 'de' ? 'Android (Demnächst)' : 'Android (Coming Soon)'}
                  </span>
                </motion.button>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center px-4 py-3 bg-dark-300/30 backdrop-blur-md rounded-lg border border-white/10 hover:border-pink-500/20 transition-all duration-300">
                <input
                  type="email"
                  placeholder={language === 'de' ? 'Deine E-Mail für Updates' : 'Your email for updates'}
                  className="flex-1 bg-transparent border-none text-white focus:outline-none"
                />
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg shadow-lg shadow-pink-500/20"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === 'de' ? 'Benachrichtige mich' : 'Notify me'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Kleine Icon-Komponenten für die App-Mockup
const MessageIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CoinIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="8"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const UsersIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CheckIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default AppDownload;
