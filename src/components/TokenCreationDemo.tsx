
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, Copy, ArrowRight, Check, Users, Gift } from 'lucide-react';
import { Progress } from './ui/progress';

const TokenCreationDemo: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [tokenType, setTokenType] = useState('community');
  const [network, setNetwork] = useState('ethereum');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);

  const networks = [
    { id: 'ethereum', name: 'Ethereum', icon: '🔷', color: 'bg-blue-500' },
    { id: 'polygon', name: 'Polygon', icon: '🟣', color: 'bg-purple-600' },
    { id: 'bnbchain', name: 'BNB Chain', icon: '🟡', color: 'bg-yellow-500' },
    { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: 'bg-red-500' },
  ];

  const handleNetworkSelect = (networkId: string) => {
    setNetwork(networkId);
    setShowNetworkDropdown(false);
  };

  const getNetworkData = (networkId: string) => {
    return networks.find(n => n.id === networkId) || networks[0];
  };

  const steps = [
    { number: 1, title: "Token-Typ wählen" },
    { number: 2, title: "Netzwerk auswählen" },
    { number: 3, title: "Token-Einstellungen" },
    { number: 4, title: "Review & Deploy" }
  ];

  return (
    <div id="token-creation" className="bg-dark-100 py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20">
            <span className="text-primary-400 font-medium">Token Creation</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Erstelle deinen eigenen Token <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">ohne Programmierung</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Mit unserem intuitiven Token-Creator kannst du in wenigen Minuten deine eigene Kryptowährung erstellen und verwalten.
          </p>
        </motion.div>

        {/* Demo Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-xl">
            {/* Header with steps */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Token Creator</h3>
                <div className="bg-primary/20 text-primary-400 px-3 py-1 rounded-full text-sm">
                  Beta
                </div>
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    {steps.map((step) => (
                      <div 
                        key={step.number}
                        className={`flex flex-col items-center ${
                          step.number < currentStep 
                            ? 'text-primary-400' 
                            : step.number === currentStep 
                              ? 'text-white' 
                              : 'text-gray-500'
                        }`}
                      >
                        <div 
                          className={`w-8 h-8 flex items-center justify-center rounded-full z-10 ${
                            step.number < currentStep 
                              ? 'bg-primary-400 text-dark-100' 
                              : step.number === currentStep 
                                ? 'bg-white text-dark-100 ring-4 ring-primary/30' 
                                : 'bg-dark-300 text-gray-400'
                          }`}
                        >
                          {step.number < currentStep ? <Check size={16} /> : step.number}
                        </div>
                        <span className="text-xs mt-2 hidden sm:block">{step.title}</span>
                      </div>
                    ))}
                  </div>
                  <Progress value={(currentStep - 1) / (steps.length - 1) * 100} className="h-1 absolute top-4 left-0 right-0 z-0" />
                </div>
              </div>
            </div>
            
            {/* Content area */}
            <div className="p-6">
              {currentStep === 1 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Wähle einen Token-Typ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        tokenType === 'community' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-700 hover:border-primary/50'
                      }`}
                      onClick={() => setTokenType('community')}
                    >
                      <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-3">
                        <Users size={20} className="text-white" />
                      </div>
                      <h5 className="font-medium text-white mb-1">Community Token</h5>
                      <p className="text-gray-400 text-sm">Für Creator und Communities mit Mining-Funktionen</p>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        tokenType === 'utility' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-700 hover:border-primary/50'
                      }`}
                      onClick={() => setTokenType('utility')}
                    >
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
                        <Check size={20} className="text-white" />
                      </div>
                      <h5 className="font-medium text-white mb-1">Utility Token</h5>
                      <p className="text-gray-400 text-sm">Für Anwendungen und Services mit Utility-Fokus</p>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        tokenType === 'reward' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-700 hover:border-primary/50'
                      }`}
                      onClick={() => setTokenType('reward')}
                    >
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-3">
                        <Gift size={20} className="text-white" />
                      </div>
                      <h5 className="font-medium text-white mb-1">Reward Token</h5>
                      <p className="text-gray-400 text-sm">Für Loyalitätsprogramme und Belohnungssysteme</p>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Wähle ein Blockchain-Netzwerk</h4>
                  
                  <div className="relative mb-6">
                    <button 
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg p-4 text-white flex items-center justify-between"
                      onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getNetworkData(network).icon}</span>
                        <div>
                          <div className="font-medium">{getNetworkData(network).name}</div>
                          <div className="text-gray-400 text-sm">
                            {network === 'ethereum' && 'Geeignet für hochwertige Assets, höhere Gebühren'}
                            {network === 'polygon' && 'Schnelle Transaktionen, niedrige Gebühren'}
                            {network === 'bnbchain' && 'Große Nutzerbasis, moderate Gebühren'}
                            {network === 'avalanche' && 'Hohe Geschwindigkeit, wachsendes Ökosystem'}
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={20} className={`transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showNetworkDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-dark-300 border border-gray-700 rounded-lg overflow-hidden z-10">
                        {networks.map((net) => (
                          <div 
                            key={net.id}
                            className="p-4 hover:bg-dark-100 flex items-center cursor-pointer"
                            onClick={() => handleNetworkSelect(net.id)}
                          >
                            <span className="text-2xl mr-3">{net.icon}</span>
                            <div className="font-medium text-white">{net.name}</div>
                            {network === net.id && (
                              <Check size={18} className="ml-auto text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-dark-300 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-white mb-2">Netzwerk-Details</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 block">Durchschn. Gebühren:</span>
                        <span className="text-white">
                          {network === 'ethereum' && '~$15-50'}
                          {network === 'polygon' && '~$0.01-0.10'}
                          {network === 'bnbchain' && '~$0.20-0.50'}
                          {network === 'avalanche' && '~$0.10-0.30'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Transaktionszeit:</span>
                        <span className="text-white">
                          {network === 'ethereum' && '~15 Minuten'}
                          {network === 'polygon' && '~2-5 Sekunden'}
                          {network === 'bnbchain' && '~5-15 Sekunden'}
                          {network === 'avalanche' && '~2-3 Sekunden'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Token-Standard:</span>
                        <span className="text-white">ERC-20 / BEP-20</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Sicherheit:</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i} 
                              className={`w-2 h-3 rounded-sm mr-0.5 ${
                                (network === 'ethereum' && i <= 5) ||
                                (network === 'polygon' && i <= 4) ||
                                (network === 'bnbchain' && i <= 4) ||
                                (network === 'avalanche' && i <= 4)
                                  ? getNetworkData(network).color
                                  : 'bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Token-Einstellungen</h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
                        <input 
                          type="text" 
                          className="w-full bg-dark-300 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                          placeholder="z.B. My Community Token"
                          defaultValue="Community Token"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol</label>
                        <input 
                          type="text" 
                          className="w-full bg-dark-300 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                          placeholder="z.B. MCT"
                          defaultValue="CMT"
                          maxLength={5}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Initial Supply</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full bg-dark-300 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                          placeholder="z.B. 1000000"
                          defaultValue="1000000"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          Tokens
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Token-Beschreibung</label>
                      <textarea 
                        className="w-full bg-dark-300 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none min-h-[80px]"
                        placeholder="Beschreibe den Zweck deines Tokens..."
                        defaultValue="Ein Community-Token für unsere Social-Mining-Plattform."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Mining Pool</label>
                      <div className="relative">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          defaultValue="50"
                          className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mining Rate</label>
                        <select className="w-full bg-dark-300 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none">
                          <option value="low">Niedrig (1% täglich)</option>
                          <option value="medium" selected>Medium (2.5% täglich)</option>
                          <option value="high">Hoch (5% täglich)</option>
                          <option value="custom">Benutzerdefiniert</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Token-Typ</label>
                        <select className="w-full bg-dark-300 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none">
                          <option value="mintable" selected>Prägbar (Mintable)</option>
                          <option value="fixed">Feste Anzahl (Fixed Supply)</option>
                          <option value="burnable">Verbrennbar (Burnable)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 4 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Review & Deploy</h4>
                  
                  <div className="bg-dark-300 rounded-lg p-4 mb-6">
                    <h5 className="font-medium text-white mb-3">Token-Zusammenfassung</h5>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token-Typ:</span>
                        <span className="text-white">Community Token</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Blockchain:</span>
                        <span className="text-white flex items-center">
                          {getNetworkData(network).icon}
                          <span className="ml-2">{getNetworkData(network).name}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">Community Token</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Symbol:</span>
                        <span className="text-white">CMT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Initial Supply:</span>
                        <span className="text-white">1,000,000 CMT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mining Pool:</span>
                        <span className="text-white">500,000 CMT (50%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mining Rate:</span>
                        <span className="text-white">2.5% täglich</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-dark-300 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-white">Deployment-Kosten</h5>
                      <span className="text-primary-400 text-sm">Günstiger als die Konkurrenz</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Base Fee:</span>
                        <span className="text-white">
                          {network === 'ethereum' && '0.02 ETH'}
                          {network === 'polygon' && '10 MATIC'}
                          {network === 'bnbchain' && '0.05 BNB'}
                          {network === 'avalanche' && '0.5 AVAX'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gas Fee (geschätzt):</span>
                        <span className="text-white">
                          {network === 'ethereum' && '~0.01 ETH'}
                          {network === 'polygon' && '~0.5 MATIC'}
                          {network === 'bnbchain' && '~0.01 BNB'}
                          {network === 'avalanche' && '~0.05 AVAX'}
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between font-medium">
                        <span className="text-gray-300">Gesamtkosten:</span>
                        <span className="text-white">
                          {network === 'ethereum' && '0.03 ETH'}
                          {network === 'polygon' && '10.5 MATIC'}
                          {network === 'bnbchain' && '0.06 BNB'}
                          {network === 'avalanche' && '0.55 AVAX'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-dark-300 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <input type="checkbox" id="terms" defaultChecked className="w-4 h-4 accent-primary" />
                      </div>
                      <label htmlFor="terms" className="ml-2 text-gray-300 text-sm">
                        Ich bestätige, dass ich die <a href="#" className="text-primary-400 hover:underline">Nutzungsbedingungen</a> und <a href="#" className="text-primary-400 hover:underline">Datenschutzrichtlinien</a> gelesen habe und damit einverstanden bin.
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/20 transition-all">
                      Token deployen
                    </button>
                  </div>
                  
                  <div className="text-center text-gray-400 text-sm mt-4">
                    Der Token-Deployment-Prozess dauert in der Regel etwa 2-5 Minuten.
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer with navigation */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              <button 
                className={`px-6 py-2 rounded-lg font-medium ${currentStep > 1 ? 'bg-dark-300 text-white' : 'bg-dark-300/50 text-gray-500 cursor-not-allowed'}`}
                onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
              >
                Zurück
              </button>
              
              <button 
                className={`px-6 py-2 rounded-lg font-medium ${currentStep < steps.length ? 'bg-primary text-white' : 'bg-primary/50 text-white'}`}
                onClick={() => currentStep < steps.length && setCurrentStep(currentStep + 1)}
              >
                {currentStep < steps.length ? 'Weiter' : 'Fertig'}
              </button>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-16 text-center">
          <motion.a 
            href="#social-platform"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors"
          >
            Erfahre mehr über unsere Social Platform
            <ArrowRight size={18} className="ml-2" />
          </motion.a>
        </div>
      </div>
    </div>
  );
};

export default TokenCreationDemo;
