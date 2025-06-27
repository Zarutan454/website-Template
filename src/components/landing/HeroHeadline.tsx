
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import GlowingButton from './GlowingButton';

const HeroHeadline: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleExplore = () => {
    navigate('/feed');
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="text-left"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Badge */}
      <motion.div variants={itemVariants}>
        <Badge className="mb-4 py-1.5 px-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          <Sparkles className="w-4 h-4 mr-1.5 text-pink-400" /> BSN Netzwerk v2.3
        </Badge>
      </motion.div>
      
      {/* Main headline */}
      <motion.h1 
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight sm:leading-tight md:leading-tight lg:leading-tight"
        variants={itemVariants}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-300">Dezentralisiere</span> deine 
        digitale Identität
      </motion.h1>
      
      {/* Subheadline */}
      <motion.p 
        className="text-base sm:text-lg md:text-xl mb-8 text-gray-300 max-w-2xl"
        variants={itemVariants}
      >
        Entdecke die nächste Generation sozialer Netzwerke mit Web3-Integration. Erstelle eigene Token, verbinde deine Wallet und kontrolliere deine digitalen Assets in einer sicheren und benutzerfreundlichen Umgebung.
      </motion.p>
      
      {/* Feature list */}
      <motion.ul className="mb-8 space-y-3" variants={itemVariants}>
        {[
          "Eigene Token erstellen und verwalten",
          "Soziale Aktivitäten werden belohnt",
          "100% Kontrolle über deine digitalen Assets",
          "Cross-Chain Kompatibilität"
        ].map((feature, index) => (
          <motion.li 
            key={index} 
            className="flex items-center text-gray-300"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 + (index * 0.1) }}
          >
            <Check className="h-5 w-5 mr-2 text-pink-500 flex-shrink-0" />
            <span>{feature}</span>
          </motion.li>
        ))}
      </motion.ul>
      
      {/* Action buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        variants={itemVariants}
      >
        <GlowingButton 
          onClick={handleGetStarted}
          className="px-8 py-4 text-lg"
          primary={true}
          color="primary"
        >
          Jetzt starten
          <ArrowRight className="ml-2 h-5 w-5" />
        </GlowingButton>
        
        <GlowingButton 
          onClick={handleExplore}
          className="px-8 py-4 text-lg"
          primary={false}
        >
          Feed entdecken
        </GlowingButton>
      </motion.div>
    </motion.div>
  );
};

export default HeroHeadline;
