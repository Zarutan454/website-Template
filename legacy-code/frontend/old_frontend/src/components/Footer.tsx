
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Instagram, Mail, ArrowUp } from 'lucide-react';
import Logo from './Logo';

// Animation variants für Hover-Effekte
const hoverEffect = {
  scale: 1.05,
  y: -2,
  transition: { duration: 0.2 }
};

const socialHoverEffect = {
  scale: 1.1,
  backgroundColor: "rgba(244, 63, 94, 0.2)",
  color: "#f43f5e",
  transition: { duration: 0.2 }
};

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerLinks = [
    {
      title: "Produkt",
      links: [
        { name: "Token Creation", href: "#token-creation" },
        { name: "Social Mining", href: "#social-platform" },
        { name: "Proof-of-Activity", href: "#proof-of-activity" },
        { name: "Airdrops", href: "#airdrops" },
        { name: "Roadmap", href: "#roadmap" }
      ]
    },
    {
      title: "Unternehmen",
      links: [
        { name: "Über uns", href: "/about" },
        { name: "Team", href: "/team" },
        { name: "Karriere", href: "/careers" },
        { name: "Blog", href: "/blog" },
        { name: "Kontakt", href: "/contact" }
      ]
    },
    {
      title: "Rechtliches",
      links: [
        { name: "AGB", href: "/agb" },
        { name: "Datenschutz", href: "/datenschutz" },
        { name: "Impressum", href: "/impressum" },
        { name: "Cookie-Einstellungen", href: "#cookies" }
      ]
    },
    {
      title: "Ressourcen",
      links: [
        { name: "Dokumentation", href: "/docs" },
        { name: "API", href: "/api" },
        { name: "Community", href: "/community" },
        { name: "Support", href: "/support" },
        { name: "FAQ", href: "#faq" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Twitter", icon: <Twitter size={20} />, href: "https://twitter.com" },
    { name: "GitHub", icon: <Github size={20} />, href: "https://github.com" },
    { name: "LinkedIn", icon: <Linkedin size={20} />, href: "https://linkedin.com" },
    { name: "Instagram", icon: <Instagram size={20} />, href: "https://instagram.com" },
    { name: "Mail", icon: <Mail size={20} />, href: "mailto:info@bsn.network" }
  ];

  return (
    <footer className="bg-dark-300 pt-16 pb-8 relative overflow-hidden">
      {/* Verbesserte Hintergrunddekorationen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6 mb-12">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Logo variant="large" withText={true} className="mb-4" animated={true} />
            <motion.p 
              className="text-gray-400 mb-6 max-w-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Blockchain Social Network ermöglicht es Communities, eigene Token zu erstellen 
              und ein Social-Mining-Ökosystem aufzubauen – ohne Programmierkenntnisse.
            </motion.p>
            
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary/20 hover:text-primary-400 transition-colors"
                  whileHover={socialHoverEffect}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  aria-label={link.name}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Links with improved animations */}
          {footerLinks.map((section, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-medium mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <motion.li 
                    key={linkIndex}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a 
                      href={link.href} 
                      className="text-gray-400 hover:text-primary-400 transition-colors inline-block"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        {/* Newsletter with improved design */}
        <motion.div 
          className="border-t border-white/10 pt-8 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-white font-medium mb-2">Newsletter abonnieren</h3>
            <p className="text-gray-400 mb-4">Erhalte regelmäßige Updates zu neuen Features, Events und Community-News.</p>
            
            <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Deine E-Mail-Adresse"
                className="flex-grow bg-dark-200 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-colors"
              />
              <motion.button
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg font-medium transition-all"
                whileHover={hoverEffect}
                whileTap={{ scale: 0.95 }}
              >
                Abonnieren
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* Bottom bar with improved layout */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Blockchain Social Network. Alle Rechte vorbehalten.
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">Cookies</a>
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">Datenschutz</a>
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">AGB</a>
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">Sicherheit</a>
            <select className="bg-dark-200 border border-gray-700 text-gray-400 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500/50 px-2 py-1">
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <motion.button 
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-10 h-10 bg-primary/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary transition-colors z-10"
            whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(244, 63, 94, 0.3)" }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
