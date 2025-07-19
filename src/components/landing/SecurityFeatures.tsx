
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, Lock, CheckSquare, Server } from 'lucide-react';
import { GradientText } from '@/components/ui/gradient-text';
import { useLanguage } from '@/components/LanguageProvider.utils';

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-dark-100/30 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-primary-500/30 transition-all duration-300 group"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-500/10 rounded-lg flex items-center justify-center mb-4 border border-primary-500/30 shadow-lg shadow-primary-500/10 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
};

const SecurityFeatures: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { t, language } = useLanguage();

  const securityFeatures = [
    {
      icon: <Shield size={24} className="text-primary-400" />,
      title: language === 'de' ? "Smart Contract Audits" : "Smart Contract Audits",
      description: language === 'de' 
        ? "Unsere Smart Contracts werden von führenden Sicherheitsunternehmen regelmäßig geprüft und auditiert."
        : "Our smart contracts are regularly reviewed and audited by leading security companies."
    },
    {
      icon: <Lock size={24} className="text-primary-400" />,
      title: language === 'de' ? "End-to-End Verschlüsselung" : "End-to-End Encryption",
      description: language === 'de'
        ? "Alle Nachrichten und Daten werden mit modernster Verschlüsselungstechnologie gesichert."
        : "All messages and data are secured with state-of-the-art encryption technology."
    },
    {
      icon: <CheckSquare size={24} className="text-primary-400" />,
      title: language === 'de' ? "2-Faktor-Authentifizierung" : "2-Factor Authentication",
      description: language === 'de'
        ? "Schütze dein Konto mit zusätzlichen Sicherheitsmaßnahmen und erhöhe den Schutz deiner Assets."
        : "Protect your account with additional security measures and enhance the protection of your assets."
    },
    {
      icon: <Server size={24} className="text-primary-400" />,
      title: language === 'de' ? "Dezentrale Datenspeicherung" : "Decentralized Data Storage",
      description: language === 'de'
        ? "Deine Daten werden über dezentrale Netzwerke gespeichert, was mehr Sicherheit und Kontrolle bietet."
        : "Your data is stored across decentralized networks, providing greater security and control."
    }
  ];

  return (
    <div className="bg-dark-100 py-20 md:py-32" id="security">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div 
            className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary-500/10 to-secondary-600/10 rounded-full backdrop-blur-sm border border-primary-500/20"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px rgba(244, 63, 94, 0.3)"
            }}
          >
            <span className="text-primary-400 font-medium">{language === 'de' ? 'Sicherheit' : 'Security'}</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GradientText 
              variant="secondary" 
              className="text-3xl md:text-4xl font-bold mb-6"
              animate={true}
            >
              {language === 'de' 
                ? 'Deine Daten und Assets sind bei uns sicher' 
                : 'Your data and assets are secure with us'}
            </GradientText>
          </motion.div>
          
          <p className="text-gray-300 text-lg">
            {language === 'de'
              ? 'Wir setzen auf modernste Sicherheitsstandards und Technologien, um deine Daten und Assets zu schützen.'
              : 'We use the latest security standards and technologies to protect your data and assets.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {securityFeatures.map((feature, index) => (
            <SecurityFeature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-3xl mx-auto mt-12 p-6 bg-dark-200/30 backdrop-blur-md rounded-xl border border-primary-500/20 text-center hover:border-primary-500/40 transition-all duration-300 group"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield size={32} className="text-primary-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {language === 'de' ? 'Unser Sicherheitsversprechen' : 'Our Security Promise'}
          </h3>
          <p className="text-gray-300">
            {language === 'de'
              ? 'Die Sicherheit deiner Daten und Assets hat für uns höchste Priorität. Wir investieren kontinuierlich in modernste Sicherheitstechnologien und arbeiten mit führenden Experten zusammen, um die höchsten Standards zu gewährleisten.'
              : 'The security of your data and assets is our highest priority. We continuously invest in cutting-edge security technologies and work with leading experts to ensure the highest standards.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SecurityFeatures;
