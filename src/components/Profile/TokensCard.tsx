
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Coins, TrendingUp, History, Award } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Skeleton } from "@/components/ui/skeleton";

interface TokensCardProps {
  minedTokens: number;
  dailyRate?: number;
  totalDays?: number;
  streak?: number;
  isLoading?: boolean;
  className?: string;
}

const TokensCard: React.FC<TokensCardProps> = ({ 
  minedTokens = 0, 
  dailyRate = 0, 
  totalDays = 0, 
  streak = 0,
  isLoading = false,
  className = ""
}) => {
  const { theme } = useTheme();
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-dark-100/80 border-gray-800/40 backdrop-blur-sm overflow-hidden ${className}`}>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-3">
                <Skeleton className="h-10 w-10 rounded-full mb-2" />
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const items = [
    {
      label: "Gesamte Tokens",
      value: minedTokens.toLocaleString('de-DE'),
      icon: <Coins size={24} />
    },
    {
      label: "Tagesrate",
      value: dailyRate.toLocaleString('de-DE'),
      icon: <TrendingUp size={24} />
    },
    {
      label: "Mining-Tage",
      value: totalDays,
      icon: <History size={24} />
    },
    {
      label: "Streak",
      value: streak,
      icon: <Award size={24} />
    }
  ];
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <Card className="bg-dark-100/80 border-gray-800/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <Coins className="mr-2 h-5 w-5 text-primary/70" />
            BSN Token Statistik
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-dark-200/40 transition-colors"
              >
                <div className="mb-2 text-primary/70">
                  {item.icon}
                </div>
                <p className="text-xl font-bold text-center">{item.value}</p>
                <p className="text-xs text-gray-400 text-center">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TokensCard;
