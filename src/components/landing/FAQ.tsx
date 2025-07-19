
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { GradientText } from '@/components/ui/gradient-text';
import { useLanguage } from '@/components/LanguageProvider.utils';

const getFaqItems = (language: string) => [
  {
    question: language === 'de' 
      ? 'Was ist das Blockchain Social Network?' 
      : 'What is the Blockchain Social Network?',
    answer: language === 'de'
      ? 'Das Blockchain Social Network ist eine dezentrale Social-Media-Plattform, die auf Blockchain-Technologie basiert. Es ermöglicht Nutzern, Inhalte zu teilen, mit anderen zu interagieren und dabei Krypto-Token zu verdienen.'
      : 'The Blockchain Social Network is a decentralized social media platform based on blockchain technology. It allows users to share content, interact with others, and earn crypto tokens in the process.'
  },
  {
    question: language === 'de'
      ? 'Wie verdiene ich Token auf der Plattform?'
      : 'How do I earn tokens on the platform?',
    answer: language === 'de'
      ? 'Du verdienst Token durch Proof-of-Activity Mining. Das bedeutet, dass du für Aktivitäten wie das Erstellen von Beiträgen, Kommentieren, Teilen und andere Interaktionen belohnt wirst. Je aktiver du bist, desto mehr Token erhältst du.'
      : 'You earn tokens through Proof-of-Activity Mining. This means you are rewarded for activities such as creating posts, commenting, sharing, and other interactions. The more active you are, the more tokens you receive.'
  },
  {
    question: language === 'de'
      ? 'Was sind BSN Token?'
      : 'What are BSN Tokens?',
    answer: language === 'de'
      ? 'BSN Token sind die nativen Token des Blockchain Social Networks. Sie können für verschiedene Funktionen innerhalb der Plattform verwendet werden, wie z.B. das Erstellen eigener Token, Zugang zu Premium-Funktionen oder als Belohnung für Aktivitäten.'
      : 'BSN Tokens are the native tokens of the Blockchain Social Network. They can be used for various functions within the platform, such as creating your own tokens, accessing premium features, or as rewards for activities.'
  },
  {
    question: language === 'de'
      ? 'Wie funktioniert das Proof-of-Activity Mining?'
      : 'How does Proof-of-Activity Mining work?',
    answer: language === 'de'
      ? 'Beim Proof-of-Activity Mining werden deine Aktivitäten auf der Plattform protokolliert und als Mining-Leistung gewertet. Das System bewertet die Qualität und Häufigkeit deiner Interaktionen und vergibt entsprechend Token als Belohnung.'
      : 'With Proof-of-Activity Mining, your activities on the platform are logged and counted as mining performance. The system evaluates the quality and frequency of your interactions and awards tokens as rewards accordingly.'
  },
  {
    question: language === 'de'
      ? 'Kann ich meine Token in andere Kryptowährungen umtauschen?'
      : 'Can I exchange my tokens for other cryptocurrencies?',
    answer: language === 'de'
      ? 'Ja, BSN Token können auf unterstützten Kryptobörsen in andere Kryptowährungen wie Bitcoin oder Ethereum umgetauscht werden, sobald sie auf diese Börsen gelistet sind.'
      : 'Yes, BSN Tokens can be exchanged for other cryptocurrencies such as Bitcoin or Ethereum on supported crypto exchanges, once they are listed on these exchanges.'
  },
  {
    question: language === 'de'
      ? 'Ist mein Account und meine Daten sicher?'
      : 'Are my account and data secure?',
    answer: language === 'de'
      ? 'Wir setzen modernste Sicherheitsmaßnahmen ein, um deine Daten und Assets zu schützen. Die Blockchain-Technologie bietet zusätzliche Sicherheit durch ihre dezentrale Natur und Verschlüsselungstechniken.'
      : 'We employ state-of-the-art security measures to protect your data and assets. Blockchain technology provides additional security through its decentralized nature and encryption techniques.'
  }
];

const FAQ: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<number[]>([0]);
  const { language } = useLanguage();
  const faqItems = getFaqItems(language);

  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <section className="py-20 relative bg-dark-100/50 backdrop-blur-md" id="faq">
      {/* Background blur elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-500/10 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div 
            className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-full backdrop-blur-sm border border-purple-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-purple-400 font-medium">FAQ</span>
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
                ? 'Häufig gestellte Fragen' 
                : 'Frequently Asked Questions'}
            </GradientText>
          </motion.div>
          
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {language === 'de'
              ? 'Hier findest du Antworten auf die häufigsten Fragen zum Blockchain Social Network.'
              : 'Here you can find answers to the most common questions about the Blockchain Social Network.'}
          </motion.p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <motion.div 
              key={index}
              className={`mb-4 bg-dark-300/30 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 ${
                expandedItems.includes(index) ? 'border-purple-500/30' : 'hover:border-purple-500/20'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button 
                className="flex justify-between items-center w-full px-6 py-4 text-left group"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors duration-300 ${
                    expandedItems.includes(index) ? 'bg-purple-500/20 text-purple-400' : 'bg-dark-400/30 text-gray-400 group-hover:bg-purple-500/10 group-hover:text-purple-300'
                  }`}>
                    <HelpCircle size={16} />
                  </div>
                  <span className="text-white font-medium">{item.question}</span>
                </div>
                <span className={`ml-4 transition-colors duration-300 ${
                  expandedItems.includes(index) ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-300'
                }`}>
                  {expandedItems.includes(index) ? (
                    <Minus size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                </span>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ${
                  expandedItems.includes(index) ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-gray-400 pl-11">{item.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
