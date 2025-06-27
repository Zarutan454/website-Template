
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Clock } from 'lucide-react';

const Roadmap: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const roadmapItems = [
    {
      phase: "Q1 2023",
      title: "Projektstart",
      description: "Konzeptentwicklung und Teamaufbau für Blockchain Social Network.",
      items: [
        "Whitepaper Veröffentlichung",
        "Core Team Aufbau",
        "Initiales Funding",
        "Marktanalyse & Positionierung"
      ],
      status: "completed"
    },
    {
      phase: "Q2 2023",
      title: "Alpha Phase",
      description: "Erste Testversion der Plattform für ausgewählte Partner.",
      items: [
        "Token Creator MVP",
        "Smart Contract Entwicklung",
        "Security Audits",
        "Closed Alpha mit 100 Testern"
      ],
      status: "completed"
    },
    {
      phase: "Q4 2023",
      title: "Beta Launch",
      description: "Öffentliche Beta mit ersten Community-Features.",
      items: [
        "Social Mining Implementation",
        "Feed und Beitragssystem",
        "Benachrichtigungssystem",
        "Dark/Light Modus"
      ],
      status: "completed"
    },
    {
      phase: "Q1 2024",
      title: "Community Growth",
      description: "Erweiterung mit Community-Features und Token-Integration.",
      items: [
        "Follow-System",
        "Chat und Nachrichten-System",
        "Erweiterte Mining-Features",
        "Leaderboard-System"
      ],
      status: "completed"
    },
    {
      phase: "Q2 2024",
      title: "BSN v1.0",
      description: "Vollständiger Launch der Plattform mit allen Kernfunktionen.",
      items: [
        "Mobile App Release",
        "Token Analytics Dashboard",
        "Token Creator Wizard",
        "Governance Features"
      ],
      status: "in-progress"
    },
    {
      phase: "Q4 2024",
      title: "Ecosystem Growth",
      description: "Erweiterung des Ökosystems um neue Funktionen und Integrationen.",
      items: [
        "DAO Creation Tools",
        "Cross-Platform Integrations",
        "Developer API",
        "Marketplace für Community-Tools"
      ],
      status: "upcoming"
    }
  ];

  return (
    <div id="roadmap" className="bg-dark-200 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20">
            <span className="text-primary-400 font-medium">Roadmap</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Unsere <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Vision</span> und Meilensteine
          </h2>
          <p className="text-gray-300 text-lg">
            Unser Entwicklungsplan zeigt, wie wir die Zukunft von Community-basierten Token-Ökosystemen gestalten werden.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 left-[15px] md:left-1/2 md:transform md:-translate-x-1/2 w-0.5 bg-gradient-to-b from-primary-500/80 via-secondary-500/80 to-accent-500/80"></div>
          
          <div className="space-y-12 relative">
            {roadmapItems.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="ml-10 md:ml-0 md:w-1/2 md:px-8 relative">
                  {/* Timeline node */}
                  <div className={`absolute top-0 left-[-30px] md:left-auto ${index % 2 === 0 ? 'md:right-[-8px]' : 'md:left-[-8px]'} w-6 h-6 rounded-full flex items-center justify-center z-10 
                    ${item.status === 'completed' ? 'bg-primary-500' : item.status === 'in-progress' ? 'bg-secondary-500' : 'bg-dark-300 border border-primary-500/30'}`}>
                    {item.status === 'completed' ? (
                      <Check size={14} className="text-white" />
                    ) : item.status === 'in-progress' ? (
                      <Clock size={14} className="text-white animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 bg-primary-500/50 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className={`bg-dark-100/50 backdrop-blur-sm p-6 rounded-xl border ${
                    item.status === 'completed' ? 'border-primary-500/30' : 
                    item.status === 'in-progress' ? 'border-secondary-500/30' : 
                    'border-white/10'
                  }`}>
                    <div className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${
                      item.status === 'completed' ? 'bg-primary-500/20 text-primary-400' : 
                      item.status === 'in-progress' ? 'bg-secondary-500/20 text-secondary-400 animate-pulse' : 
                      'bg-dark-200 text-gray-400'
                    }`}>
                      {item.phase}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300 mb-4">{item.description}</p>
                    
                    <ul className="space-y-2">
                      {item.items.map((listItem, listIndex) => (
                        <li key={listIndex} className="flex items-start">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                            item.status === 'completed' ? 'bg-primary-500/20 text-primary-400' : 
                            item.status === 'in-progress' && listIndex <= 1 ? 'bg-secondary-500/20 text-secondary-400' : 
                            'bg-dark-200/50 text-gray-500'
                          }`}>
                            {item.status === 'completed' || (item.status === 'in-progress' && listIndex <= 1) ? (
                              <Check size={12} />
                            ) : (
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                            )}
                          </div>
                          <span className={
                            item.status === 'completed' ? 'text-gray-200' : 
                            item.status === 'in-progress' && listIndex <= 1 ? 'text-gray-200' : 
                            'text-gray-400'
                          }>
                            {listItem}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Empty div for layout in desktop */}
                <div className="hidden md:block md:w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
