
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X, Facebook, Instagram } from 'lucide-react';

const PlatformComparison: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      name: "Dezentrales Netzwerk",
      bsn: true,
      facebook: false,
      instagram: false,
      tiktok: false,
      description: "Nutzer besitzen ihre Daten und Inhalte"
    },
    {
      name: "Werbefreie Erfahrung",
      bsn: true,
      facebook: false,
      instagram: false,
      tiktok: false,
      description: "Keine störenden Werbeanzeigen"
    },
    {
      name: "Token-Belohnungen",
      bsn: true,
      facebook: false,
      instagram: false,
      tiktok: false,
      description: "Verdiene Token durch soziale Aktivitäten"
    },
    {
      name: "Eigene Token erstellen",
      bsn: true,
      facebook: false,
      instagram: false,
      tiktok: false,
      description: "Eigene Token ohne Programmierkenntnisse"
    },
    {
      name: "Ende-zu-Ende Verschlüsselung",
      bsn: true,
      facebook: true,
      instagram: true,
      tiktok: false,
      description: "Sichere verschlüsselte Kommunikation"
    },
    {
      name: "Monetarisierung für Creator",
      bsn: true,
      facebook: true,
      instagram: true,
      tiktok: true,
      description: "Verschiedene Einnahmequellen für Content-Ersteller"
    }
  ];

  // Platform icon components
  const PlatformIcon = ({ platform }: { platform: string }) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-6 w-6" />;
      case 'instagram':
        return <Instagram className="h-6 w-6" />;
      case 'tiktok':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        );
      default:
        return <div className="h-6 w-6 flex items-center justify-center font-bold text-primary-400">BSN</div>;
    }
  };

  return (
    <div className="bg-dark-300 py-20 md:py-32" id="comparison">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div 
            className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary-500/10 to-secondary-600/10 rounded-full backdrop-blur-sm border border-primary-500/20"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px rgba(244, 63, 94, 0.3)"
            }}
          >
            <span className="text-primary-400 font-medium">Vergleich</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-500">BSN</span> vs. Traditionelle Soziale Netzwerke
          </h2>
          <p className="text-gray-300 text-lg">
            Entdecke die Vorteile unserer dezentralen Plattform im Vergleich zu herkömmlichen sozialen Netzwerken.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto bg-dark-200/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 text-center p-4 border-b border-white/10 bg-dark-200">
            <div className="col-span-1 text-left font-medium text-gray-300">Feature</div>
            <div className="font-bold text-primary-400 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mb-1">
                <span className="font-bold text-primary-400">BSN</span>
              </div>
              <span>BSN</span>
            </div>
            <div className="font-medium text-gray-300 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                <Facebook className="text-blue-400" />
              </div>
              <span>Facebook</span>
            </div>
            <div className="font-medium text-gray-300 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mb-1">
                <Instagram className="text-pink-400" />
              </div>
              <span>Instagram</span>
            </div>
            <div className="font-medium text-gray-300 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-dark-100 flex items-center justify-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
              <span>TikTok</span>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className={`grid grid-cols-5 text-center p-4 ${
                  index % 2 === 0 ? 'bg-dark-300/30' : 'bg-dark-200/30'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.1 * index }
                } : { opacity: 0, y: 10 }}
              >
                <div className="col-span-1 text-left">
                  <div className="font-medium text-white">{feature.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{feature.description}</div>
                </div>
                <div>
                  {feature.bsn ? (
                    <Check className="mx-auto text-green-500" />
                  ) : (
                    <X className="mx-auto text-red-500" />
                  )}
                </div>
                <div>
                  {feature.facebook ? (
                    <Check className="mx-auto text-green-500" />
                  ) : (
                    <X className="mx-auto text-red-500" />
                  )}
                </div>
                <div>
                  {feature.instagram ? (
                    <Check className="mx-auto text-green-500" />
                  ) : (
                    <X className="mx-auto text-red-500" />
                  )}
                </div>
                <div>
                  {feature.tiktok ? (
                    <Check className="mx-auto text-green-500" />
                  ) : (
                    <X className="mx-auto text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 text-gray-400 text-sm max-w-2xl mx-auto">
          <p>* Dieser Vergleich basiert auf öffentlich verfügbaren Informationen zum Zeitpunkt der Veröffentlichung und kann sich ändern.</p>
        </div>
      </div>
    </div>
  );
};

export default PlatformComparison;
