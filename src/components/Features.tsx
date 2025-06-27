
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Zap, Users, Shield, Coins, Globe, Gift, Star } from 'lucide-react';

const Features: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <Zap size={24} className="text-primary" />,
      title: "Token Creation",
      description: "Erstelle schnell und einfach deine eigene Kryptowährung ohne Programmierung in nur wenigen Minuten.",
    },
    {
      icon: <Users size={24} className="text-primary" />,
      title: "Social Mining",
      description: "Verdiene Token durch soziale Aktivitäten wie Kommentare, Likes und Beiträge in der Community.",
    },
    {
      icon: <Shield size={24} className="text-primary" />,
      title: "Proof-of-Activity",
      description: "Unser einzigartiger Konsens-Algorithmus belohnt aktive Community-Mitglieder statt Rechenleistung.",
    },
    {
      icon: <Coins size={24} className="text-primary" />,
      title: "Token-Wirtschaft",
      description: "Baue eine nachhaltige Token-Wirtschaft mit Anreizen, die speziell auf deine Community zugeschnitten sind.",
    },
    {
      icon: <Globe size={24} className="text-primary" />,
      title: "Cross-Chain",
      description: "Unterstützung für mehrere Blockchains, um maximale Kompatibilität und Flexibilität zu gewährleisten.",
    },
    {
      icon: <Gift size={24} className="text-primary" />,
      title: "Airdrops",
      description: "Verteile Token an deine Community-Mitglieder und belohne Engagement auf innovative Weise.",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div id="features" className="bg-dark-200 py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
          ref={ref}
        >
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20">
            <span className="text-primary-400 font-medium">Platform Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Alles was du brauchst für dein <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Community Token</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Unsere Plattform bietet dir alle Werkzeuge, um ein erfolgreiches Web3-Ökosystem für deine Community zu schaffen und zu verwalten.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-dark-100/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/30 transition-all group"
            >
              <div className="h-12 w-12 rounded-lg bg-dark-200 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-dark-100/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 inline-block">
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                <span className="text-white font-medium">95% unserer Nutzer</span> empfehlen Blockchain Social Network an Freunde und Kollegen weiter.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
