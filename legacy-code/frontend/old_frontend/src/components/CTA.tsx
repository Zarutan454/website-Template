
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';

const CTA: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div id="beta-signup" className="bg-dark-200 py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20">
            <span className="text-primary-400 font-medium">Limited Beta Access</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Starte <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">jetzt</span> mit deinem eigenen Token
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Werde Teil unserer exklusiven Beta-Phase und erhalte frühzeitigen Zugang zu allen Features. Plus: 500 BSN Token als Willkommensbonus für alle Beta-Tester!
          </p>
          
          <div className="bg-dark-100/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="text-left mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Beta Sign-up</h3>
                <div className="bg-primary/20 text-primary-400 px-3 py-1 rounded-full text-xs">
                  <span className="font-mono">73%</span> belegt
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Nur noch begrenzte Plätze verfügbar. Füllen Sie das Formular aus, um sich für unsere Beta-Phase anzumelden.
              </p>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-300 mb-1">Vorname</label>
                  <input 
                    type="text" 
                    id="firstname" 
                    className="w-full bg-dark-200 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Max"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-300 mb-1">Nachname</label>
                  <input 
                    type="text" 
                    id="lastname" 
                    className="w-full bg-dark-200 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Mustermann"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-Mail-Adresse</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full bg-dark-200 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="max.mustermann@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="interest" className="block text-sm font-medium text-gray-300 mb-1">Was interessiert dich am meisten?</label>
                <select 
                  id="interest" 
                  className="w-full bg-dark-200 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">Bitte auswählen...</option>
                  <option value="token-creation">Token Creation</option>
                  <option value="social-mining">Social Mining</option>
                  <option value="community-building">Community Building</option>
                  <option value="nft">NFT Integration</option>
                  <option value="all">Alles</option>
                </select>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 bg-dark-200 border border-gray-700 rounded focus:ring-primary-500 focus:ring-2 accent-primary-500"
                  />
                </div>
                <label htmlFor="terms" className="ml-2 text-xs text-gray-400">
                  Ich stimme den <a href="#" className="text-primary-400 hover:underline">Nutzungsbedingungen</a> und der <a href="#" className="text-primary-400 hover:underline">Datenschutzerklärung</a> zu.
                </label>
              </div>
              
              <motion.button
                type="button"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg py-3 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center"
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(244, 63, 94, 0.3)" }}
                whileTap={{ scale: 0.97 }}
              >
                Beta-Zugang anfordern
                <ArrowRight size={18} className="ml-2" />
              </motion.button>
            </form>
            
            <div className="flex items-center justify-center mt-6 space-x-6">
              <div className="flex items-center text-gray-400 text-sm">
                <svg className="w-5 h-5 text-primary-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Kein Kreditkarte nötig</span>
              </div>
              
              <div className="flex items-center text-gray-400 text-sm">
                <svg className="w-5 h-5 text-primary-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sofortiger Zugang</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <div className="bg-dark-100/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex items-center space-x-4 max-w-xs">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                </svg>
              </div>
              <div>
                <div className="font-medium text-white">500 BSN</div>
                <div className="text-xs text-gray-400">Token-Bonus für Beta-Tester</div>
              </div>
            </div>
            
            <div className="bg-dark-100/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex items-center space-x-4 max-w-xs">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400">
                  <rect width="18" height="10" x="3" y="11" rx="2"></rect>
                  <circle cx="12" cy="5" r="2"></circle>
                  <path d="M12 7v4"></path>
                  <line x1="8" x2="8" y1="16" y2="16"></line>
                  <line x1="16" x2="16" y1="16" y2="16"></line>
                </svg>
              </div>
              <div>
                <div className="font-medium text-white">Early Access</div>
                <div className="text-xs text-gray-400">Zugriff auf alle Premium-Features</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CTA;
