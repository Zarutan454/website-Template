import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  glowColor: string;
}

const Features3D: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  const features: Feature[] = [
    {
      icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path></svg>,
      title: "Token Mining",
      description: "Earn BSN tokens through social interactions, content creation, and daily platform activity.",
      color: "from-pink-500 to-purple-500",
      glowColor: "rgba(236, 72, 153, 0.5)"
    },
    {
      icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>,
      title: "Social Networking",
      description: "Connect with like-minded individuals in the blockchain and crypto community.",
      color: "from-blue-500 to-cyan-500",
      glowColor: "rgba(59, 130, 246, 0.5)"
    },
    {
      icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>,
      title: "Decentralized Identity",
      description: "Own your data with blockchain-based identity and reputation system.",
      color: "from-green-500 to-emerald-500",
      glowColor: "rgba(16, 185, 129, 0.5)"
    },
    {
      icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>,
      title: "Token Analytics",
      description: "Track your earnings and monitor token performance with real-time analytics.",
      color: "from-orange-500 to-amber-500",
      glowColor: "rgba(249, 115, 22, 0.5)"
    },
    {
      icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd"></path></svg>,
      title: "Token Creation",
      description: "Launch your own custom tokens with our easy-to-use token creation wizard.",
      color: "from-red-500 to-pink-500",
      glowColor: "rgba(239, 68, 68, 0.5)"
    },
    {
      icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>,
      title: "Secure Wallet",
      description: "Manage your crypto assets with our integrated secure wallet system.",
      color: "from-indigo-500 to-purple-500",
      glowColor: "rgba(99, 102, 241, 0.5)"
    }
  ];
  
  return (
    <section ref={sectionRef} className="py-20 bg-dark-100 relative overflow-hidden" id="features">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-dark-100 to-dark-100" />
        
        {/* 3D Grid pattern */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(1000px) rotateX(5deg)',
          transformOrigin: 'center top'
        }} />
        
        {/* Animated circles with glow */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(236,72,153,0) 70%)`,
              width: `${100 + i * 100}px`,
              height: `${100 + i * 100}px`,
              left: '50%',
              top: '50%',
              x: '-50%',
              y: '-50%',
              filter: 'blur(8px)',
              boxShadow: '0 0 30px rgba(236,72,153,0.3)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
        
        {/* Floating 3D decorative elements */}
        <motion.div 
          className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-xl"
          style={{ 
            top: '15%', 
            right: '10%',
            boxShadow: '0 0 30px rgba(236,72,153,0.2) inset',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div 
          className="absolute w-24 h-24 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl"
          style={{ 
            bottom: '20%', 
            left: '10%',
            boxShadow: '0 0 30px rgba(59,130,246,0.2) inset',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <motion.div 
        className="container mx-auto px-4 relative z-10"
        style={{ y }}
      >
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 drop-shadow-lg">
            Revolutionary Features
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            BSN combines the best of social networking with blockchain technology to create a unique platform where your social activity has real value.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`relative bg-dark-200/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-gray-700 transition-all duration-300 group ${activeFeature === index ? 'scale-105 z-10' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -5,
                boxShadow: `0 10px 30px -10px ${feature.glowColor}`
              }}
              onClick={() => setActiveFeature(activeFeature === index ? null : index)}
            >
              {/* Glass reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 rounded-xl pointer-events-none" />
              
              {/* Feature Card Glow Effect */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 blur-xl -z-10 ${activeFeature === index ? 'opacity-20' : 'group-hover:opacity-10'}`} />
              
              {/* Icon Container with glow */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br ${feature.color} text-white relative group-hover:animate-pulse-slow`}
                style={{
                  boxShadow: `0 0 20px ${feature.glowColor}`
                }}
              >
                <div className="absolute inset-0 rounded-full bg-white/10" />
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-white group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white to-gray-300 transition-all duration-300">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
              
              {/* Expanded Content (shown when active) */}
              {activeFeature === index && (
                <motion.div 
                  className="mt-4 pt-4 border-t border-gray-800/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-300 mb-3">
                    Experience the future of social networking with our {feature.title.toLowerCase()} feature.
                  </p>
                  <a 
                    href={`#${feature.title.toLowerCase().replace(/\s+/g, '-')}`} 
                    className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent hover:text-white font-medium flex items-center group cursor-pointer`}
                    onClick={(e) => {
                      e.preventDefault();
                      const sectionMap = {
                        'token mining': 'mining',
                        'social networking': 'social-features',
                        'decentralized identity': 'security-features',
                        'token analytics': 'live-demo',
                        'token creation': 'token-creation',
                        'secure wallet': 'security-features'
                      };
                      const sectionId = sectionMap[feature.title.toLowerCase()] || feature.title.toLowerCase().replace(/\s+/g, '-');
                      const targetSection = document.getElementById(sectionId);
                      if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <span className="group-hover:underline">Learn more</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Features3D;
