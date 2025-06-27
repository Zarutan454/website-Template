import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedStats } from '../ui/animated-stats';
import { GradientText } from '../ui/gradient-text';

const StatsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-dark-200 relative overflow-hidden">
      {/* Background blur elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <GradientText 
            variant="primary" 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            animate={true}
          >
            Platform Statistics
          </GradientText>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join thousands of users already benefiting from BSN's blockchain social network ecosystem
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          <AnimatedStats variant="glass" />
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
