
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { Skeleton } from "@/components/ui/skeleton";

interface StatItem {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}

interface StatisticsCardProps {
  items: StatItem[];
  isLoading?: boolean;
  className?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ items, isLoading = false, className = "" }) => {
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
        <CardContent className="p-4">
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
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <Card className="bg-dark-100/80 border-gray-800/40 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-dark-200/40 transition-colors"
              >
                {item.icon && (
                  <div className="mb-2 text-primary/70">
                    {item.icon}
                  </div>
                )}
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

export default StatisticsCard;
