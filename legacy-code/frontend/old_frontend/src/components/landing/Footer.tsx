import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Github, Facebook, Mail, Phone } from 'lucide-react';
import Logo from '../Logo';
import { useLanguage } from '@/components/LanguageProvider';
import { GradientText } from '@/components/ui/gradient-text';

const Footer: React.FC = () => {
  const { language } = useLanguage();
  
  return (
    <footer className="bg-dark-200/80 backdrop-blur-md border-t border-white/10 py-16 relative">
      {/* Background blur elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center mb-4"
            >
              <Logo variant="default" withText={true} />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-400 mb-4"
            >
              {language === 'de'
                ? 'Die erste Blockchain-Social-Network Plattform mit Proof-of-Activity Mining.'
                : 'The first Blockchain Social Network platform with Proof-of-Activity Mining.'}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex space-x-4"
            >
              <a href="#" className="w-8 h-8 rounded-full bg-dark-300/50 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-dark-300/80 transition-all duration-300">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-dark-300/50 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-dark-300/80 transition-all duration-300">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-dark-300/50 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-dark-300/80 transition-all duration-300">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-dark-300/50 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-dark-300/80 transition-all duration-300">
                <Linkedin size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-dark-300/50 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-dark-300/80 transition-all duration-300">
                <Github size={16} />
              </a>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-4">
              {language === 'de' ? 'Links' : 'Links'}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                  <span>{language === 'de' ? 'Features' : 'Features'}</span>
                </a>
              </li>
              <li>
                <a href="#mining" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                  <span>Mining</span>
                </a>
              </li>
              <li>
                <a href="#roadmap" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                  <span>Roadmap</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                  <span>FAQ</span>
                </a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-white font-semibold mb-4">
              {language === 'de' ? 'Rechtliches' : 'Legal'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/impressum" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                  <span>{language === 'de' ? 'Impressum' : 'Imprint'}</span>
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                  <span>{language === 'de' ? 'Datenschutz' : 'Privacy Policy'}</span>
                </Link>
              </li>
              <li>
                <Link to="/agb" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                  <span>{language === 'de' ? 'AGB' : 'Terms & Conditions'}</span>
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-white font-semibold mb-4">
              {language === 'de' ? 'Kontakt' : 'Contact'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 group">
                <div className="w-8 h-8 rounded-full bg-dark-300/50 flex items-center justify-center group-hover:bg-primary-500/20 transition-all duration-300">
                  <Mail size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <span className="group-hover:text-primary-500 transition-colors">info@blockchain-social.network</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 group">
                <div className="w-8 h-8 rounded-full bg-dark-300/50 flex items-center justify-center group-hover:bg-primary-500/20 transition-all duration-300">
                  <Phone size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <span className="group-hover:text-primary-500 transition-colors">+49 123 456789</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-white/10 pt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Blockchain Social Network. 
            {language === 'de' ? ' Alle Rechte vorbehalten.' : ' All rights reserved.'}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
