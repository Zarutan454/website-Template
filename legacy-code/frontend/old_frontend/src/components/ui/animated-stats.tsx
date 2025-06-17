import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { Card } from './card';

interface StatItemProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration * 1000 / end;
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl md:text-3xl font-bold overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          {prefix}
          <span className="tabular-nums">{displayValue.toLocaleString()}</span>
          {suffix}
        </motion.div>
      </div>
    </div>
  );
};

interface BarChartItemProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
  delay?: number;
}

const BarChartItem: React.FC<BarChartItemProps> = ({
  label,
  value,
  maxValue,
  color = 'bg-primary-500',
  delay = 0,
}) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay * 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

interface AnimatedStatsProps {
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
}

const AnimatedStats: React.FC<AnimatedStatsProps> = ({
  className,
  variant = 'default',
}) => {
  return (
    <Card variant={variant} className={cn("p-6", className)}>
      <h3 className="text-xl font-semibold mb-6 text-center">Platform Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatItem label="Users" value={15000} suffix="+" />
        <StatItem label="Transactions" value={250000} />
        <StatItem label="Tokens Created" value={3200} />
        <StatItem label="Daily Mining" value={45000} prefix="$" />
      </div>
      
      <div className="mt-8">
        <h4 className="text-lg font-medium mb-4">Activity Distribution</h4>
        <BarChartItem label="Social Posts" value={42500} maxValue={50000} color="bg-primary-500" delay={0} />
        <BarChartItem label="Token Transfers" value={28900} maxValue={50000} color="bg-pink-500" delay={1} />
        <BarChartItem label="NFT Minting" value={12300} maxValue={50000} color="bg-purple-500" delay={2} />
        <BarChartItem label="Mining Rewards" value={35600} maxValue={50000} color="bg-blue-500" delay={3} />
      </div>
    </Card>
  );
};

export { AnimatedStats, StatItem, BarChartItem };
