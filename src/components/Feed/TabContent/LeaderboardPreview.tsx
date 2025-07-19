
import React from 'react';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Crown, Award } from 'lucide-react';

const LeaderboardPreview: React.FC = () => {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  // TODO: Django-API-Migration: LeaderboardPreview auf Django-API umstellen
  // Die gesamte Logik für das Laden der Leaderboard-Daten muss auf die Django-API migriert werden.
  // Aktuell ist keine Funktionalität vorhanden, da Supabase entfernt wurde.

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 bg-gradient-to-br from-muted/10 to-muted/5 backdrop-blur-sm rounded-lg text-center shadow-sm border border-muted/20"
    >
      <motion.div 
        className="flex justify-center mb-4"
        variants={itemVariants}
      >
        <motion.div
          className="bg-gradient-to-br from-yellow-400 to-amber-600 p-3 rounded-full shadow-md"
          whileHover={{ 
            rotate: [0, 5, -5, 0],
            transition: { duration: 0.5 }
          }}
        >
          <Trophy size={36} className="text-white" />
        </motion.div>
      </motion.div>
      
      <motion.h2 
        className="text-2xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-secondary bg-clip-text text-transparent mb-2"
        variants={itemVariants}
      >
        Leaderboard
      </motion.h2>
      
      <motion.p 
        className="text-muted-foreground mb-6"
        variants={itemVariants}
      >
        Vergleiche Mining-Aktivitäten mit anderen Nutzern und erklimme die Rangliste!
      </motion.p>
      
      <motion.div
        className="grid grid-cols-3 gap-4 mb-6"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        <motion.div 
          className="flex flex-col items-center"
          variants={itemVariants}
        >
          <div className="bg-secondary/20 p-2 rounded-full mb-2">
            <Medal size={24} className="text-secondary" />
          </div>
          <span className="text-sm text-muted-foreground">Top Miner</span>
        </motion.div>
        
        <motion.div 
          className="flex flex-col items-center"
          variants={itemVariants}
        >
          <div className="bg-primary/20 p-2 rounded-full mb-2">
            <Crown size={24} className="text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Top Creator</span>
        </motion.div>
        
        <motion.div 
          className="flex flex-col items-center"
          variants={itemVariants}
        >
          <div className="bg-accent/20 p-2 rounded-full mb-2">
            <Award size={24} className="text-accent" />
          </div>
          <span className="text-sm text-muted-foreground">Top Engager</span>
        </motion.div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Button 
          onClick={() => navigate('/feed/leaderboard')}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-6 py-2"
          size="lg"
        >
          Zum vollständigen Leaderboard
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default LeaderboardPreview;
