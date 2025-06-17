
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, Search } from 'lucide-react';

const FAQ: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "Was ist Blockchain Social Network?",
      answer: "Blockchain Social Network ist eine Plattform, die es Communities und Creators ermöglicht, eigene Token zu erstellen und ein Social-Mining-Ökosystem aufzubauen, ohne Programmierkenntnisse zu benötigen. Wir kombinieren Token-Erstellung, Social Mining und Community-Tools in einer benutzerfreundlichen Plattform."
    },
    {
      question: "Was ist Social Mining?",
      answer: "Social Mining ist ein Konzept, bei dem Nutzer für ihre sozialen Aktivitäten und Beiträge in einer Community mit Token belohnt werden. Anstatt Rechenleistung (wie beim traditionellen Mining) werden wertvolle Beiträge, Interaktionen und Engagement belohnt."
    },
    {
      question: "Welche Blockchain-Netzwerke werden unterstützt?",
      answer: "Blockchain Social Network unterstützt derzeit Ethereum, Polygon, BNB Chain und Avalanche. Wir planen, in Zukunft weitere Netzwerke hinzuzufügen, um maximale Flexibilität zu bieten."
    },
    {
      question: "Wie viel kostet die Nutzung von Blockchain Social Network?",
      answer: "Die Basisnutzung von Blockchain Social Network ist kostenlos. Für das Erstellen von Token fallen nur die üblichen Blockchain-Transaktionsgebühren (Gas-Gebühren) an. Premium-Features wie erweiterte Analytics und spezielle Community-Tools sind im Rahmen unseres Abonnementmodells verfügbar."
    },
    {
      question: "Welche Art von Token kann ich erstellen?",
      answer: "Du kannst verschiedene Arten von Token erstellen, darunter Community-Token, Utility-Token und Reward-Token. Alle Token folgen dem ERC-20/BEP-20 Standard und sind vollständig kompatibel mit gängigen Wallets und Börsen."
    },
    {
      question: "Benötige ich technisches Wissen, um Blockchain Social Network zu nutzen?",
      answer: "Nein, Blockchain Social Network wurde speziell für Nicht-Techniker entwickelt. Unsere benutzerfreundliche Oberfläche führt dich Schritt für Schritt durch den Prozess, ohne dass Programmierkenntnisse erforderlich sind."
    },
    {
      question: "Wie sicher ist Blockchain Social Network?",
      answer: "Sicherheit ist unsere oberste Priorität. Alle Smart Contracts werden von führenden Sicherheitsunternehmen auditiert, und wir verwenden moderne Sicherheitsprotokolle zum Schutz der Plattform und der Nutzerdaten."
    },
    {
      question: "Kann ich meinen Token an eine bestehende Community anbinden?",
      answer: "Ja, Blockchain Social Network bietet Integrationen mit gängigen Social-Media-Plattformen und Community-Tools. Du kannst deinen Token nahtlos in deine bestehende Community einbinden und Social Mining für verschiedene Plattformen aktivieren."
    }
  ];

  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div id="faq" className="bg-dark-100 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20">
            <span className="text-primary-400 font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Häufig gestellte <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Fragen</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Antworten auf die wichtigsten Fragen zu Blockchain Social Network und unserer Plattform.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Suche in FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-200/50 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <motion.div 
          className="max-w-3xl mx-auto"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <motion.div 
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                className="mb-4"
              >
                <motion.div
                  className={`bg-dark-200/50 backdrop-blur-sm border ${activeIndex === index ? 'border-primary/30 rounded-t-xl' : 'border-white/10 rounded-xl'} overflow-hidden`}
                  whileHover={{ borderColor: activeIndex === index ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.2)' }}
                >
                  <button
                    className="w-full px-6 py-4 flex justify-between items-center text-left"
                    onClick={() => handleToggle(index)}
                  >
                    <span className="text-white font-medium">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: activeIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="text-gray-400" size={20} />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-4"
                      >
                        <div className="border-t border-white/10 pt-4 text-gray-300">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">Keine Ergebnisse gefunden</div>
              <div className="text-sm text-gray-500">Versuche es mit einem anderen Suchbegriff oder kontaktiere uns direkt.</div>
            </div>
          )}
        </motion.div>

        <div className="text-center mt-12">
          <p className="text-gray-400">Noch Fragen? Kontaktiere unser Support-Team</p>
          <motion.button
            className="mt-4 bg-primary/10 text-primary-400 px-6 py-3 rounded-lg font-medium hover:bg-primary/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Kontakt aufnehmen
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
