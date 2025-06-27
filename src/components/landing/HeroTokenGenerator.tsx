import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import GlowingButton from './GlowingButton';

const HeroTokenGenerator: React.FC = () => {
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>('');
  const [symbolError, setSymbolError] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  const controls = useAnimation();
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenName.trim() === '') {
      setNameError('');
    } else if (tokenName.length < 3) {
      setNameError('Token Name muss mindestens 3 Zeichen lang sein');
    } else {
      setNameError('');
    }

    if (tokenSymbol.trim() === '') {
      setSymbolError('');
    } else if (tokenSymbol.length < 2 || tokenSymbol.length > 5) {
      setSymbolError('Symbol muss 2-5 Zeichen lang sein');
    } else if (!/^[A-Z]+$/.test(tokenSymbol)) {
      setSymbolError('Nur Großbuchstaben erlaubt');
    } else {
      setSymbolError('');
    }

    setIsValid(
      tokenName.length >= 3 && 
      tokenSymbol.length >= 2 && 
      tokenSymbol.length <= 5 && 
      /^[A-Z]+$/.test(tokenSymbol)
    );
  }, [tokenName, tokenSymbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValid) {
      setIsAnimating(true);
      
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 }
      }).then(() => {
        navigate(`/token-wizard?name=${encodeURIComponent(tokenName)}&symbol=${encodeURIComponent(tokenSymbol)}`);
      });
    }
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenSymbol(e.target.value.toUpperCase());
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut",
        delay: 0.4
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0.3 },
    animate: { 
      opacity: [0.3, 0.6, 0.3], 
      transition: { 
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="relative"
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-300/20 rounded-2xl blur-xl"
        variants={glowVariants}
        initial="initial"
        animate="animate"
      />
      
      <motion.div animate={controls}>
        <Card className="relative border border-white/10 bg-black/30 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-300/10" />
          <div className="absolute inset-0 bg-gradient-radial from-pink-500/5 to-transparent opacity-70" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-300/5"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="flex items-center mb-6">
              <Sparkles className="h-6 w-6 mr-2 text-pink-400" />
              <h3 className="text-xl font-semibold text-white">Token Generator</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="tokenName" className="text-sm text-gray-300">Token Name</label>
                <Input
                  id="tokenName"
                  placeholder="z.B. My Awesome Token"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-pink-500/50 text-white placeholder:text-gray-500"
                />
                {nameError && <p className="text-xs text-pink-400">{nameError}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="tokenSymbol" className="text-sm text-gray-300">Token Symbol</label>
                <Input
                  id="tokenSymbol"
                  placeholder="z.B. MAT"
                  value={tokenSymbol}
                  onChange={handleSymbolChange}
                  className="bg-white/5 border-white/10 focus:border-pink-500/50 text-white placeholder:text-gray-500"
                  maxLength={5}
                />
                {symbolError ? (
                  <p className="text-xs text-pink-400">{symbolError}</p>
                ) : (
                  <p className="text-xs text-gray-400">3-5 Zeichen, nur Großbuchstaben</p>
                )}
              </div>
              
              <GlowingButton 
                type="submit" 
                className="w-full py-3 mt-2"
                disabled={!isValid}
              >
                {isAnimating ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5 animate-pulse" />
                    Token wird vorbereitet...
                  </>
                ) : (
                  <>
                    Token erstellen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </GlowingButton>
            </form>
            
            <p className="mt-4 text-xs text-center text-gray-400">
              Erstelle deinen eigenen Token in wenigen Minuten
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default HeroTokenGenerator;
