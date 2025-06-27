
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Gift, 
  ChevronDown, 
  Check, 
  Clock, 
  Users, 
  Zap,
  Globe,
  Copy,
  ArrowRight
} from 'lucide-react';

const AirdropFeature: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeTab, setActiveTab] = useState<'create' | 'participate'>('create');
  const [selectedToken, setSelectedToken] = useState('TFC');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  const tokens = [
    { symbol: 'TFC', name: 'TokenForge Coin', color: 'bg-primary-500' },
    { symbol: 'ETH', name: 'Ethereum', color: 'bg-blue-500' },
    { symbol: 'BNB', name: 'Binance Coin', color: 'bg-yellow-500' },
    { symbol: 'MATIC', name: 'Polygon', color: 'bg-purple-500' },
    { symbol: 'AVAX', name: 'Avalanche', color: 'bg-red-500' },
  ];

  const handleTokenSelect = (symbol: string) => {
    setSelectedToken(symbol);
    setShowTokenDropdown(false);
  };

  const getTokenColor = (symbol: string) => {
    return tokens.find(t => t.symbol === symbol)?.color || 'bg-primary-500';
  };

  return (
    <div className="bg-gradient-to-b from-dark-200 to-dark-100 py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary-500/10 to-secondary-600/10 rounded-full backdrop-blur-sm border border-primary-500/20">
            <span className="text-primary-400 font-medium">Airdrop-Funktionen</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Erstelle und nimm an Airdrops teil
          </h2>
          <p className="text-gray-300 text-lg">
            Verteile Token an deine Community oder entdecke neue Projekte durch Airdrops. Unser intuitives System macht es einfach, Belohnungen zu verteilen und zu erhalten.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex bg-dark-100/50 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <button
              className={`flex-1 py-3 rounded-lg transition-all ${
                activeTab === 'create' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-medium' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('create')}
            >
              <Gift size={18} className="inline-block mr-2" /> Airdrop erstellen
            </button>
            <button
              className={`flex-1 py-3 rounded-lg transition-all ${
                activeTab === 'participate' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-medium' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('participate')}
            >
              <Users size={18} className="inline-block mr-2" /> An Airdrops teilnehmen
            </button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {activeTab === 'create' && (
            <div className="bg-dark-100/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 relative overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-6">Airdrop erstellen</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token auswählen</label>
                  <div className="relative">
                    <button 
                      className="w-full bg-dark-200 border border-gray-700 rounded-lg p-3 text-white flex items-center justify-between"
                      onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full ${getTokenColor(selectedToken)} mr-2 flex items-center justify-center text-white font-bold text-xs`}>
                          {selectedToken.charAt(0)}
                        </div>
                        <span>{selectedToken}</span>
                        <span className="text-gray-400 ml-2">-</span>
                        <span className="text-gray-400 ml-2">
                          {tokens.find(t => t.symbol === selectedToken)?.name}
                        </span>
                      </div>
                      <ChevronDown size={18} className={`transition-transform ${showTokenDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showTokenDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-dark-200 border border-gray-700 rounded-lg py-2 z-10">
                        {tokens.map((token) => (
                          <div 
                            key={token.symbol}
                            className="px-3 py-2 hover:bg-dark-100 flex items-center cursor-pointer"
                            onClick={() => handleTokenSelect(token.symbol)}
                          >
                            <div className={`w-6 h-6 rounded-full ${token.color} mr-2 flex items-center justify-center text-white font-bold text-xs`}>
                              {token.symbol.charAt(0)}
                            </div>
                            <span className="text-white">{token.symbol}</span>
                            <span className="text-gray-400 ml-2">-</span>
                            <span className="text-gray-400 ml-2">{token.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Airdrop-Menge</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full bg-dark-200 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                      placeholder="z.B. 10000"
                      defaultValue="10000"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {selectedToken}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Airdrop-Titel</label>
                  <input 
                    type="text" 
                    className="w-full bg-dark-200 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                    placeholder="z.B. Community Reward Airdrop"
                    defaultValue="TokenForge Community Airdrop"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Beschreibung</label>
                  <textarea 
                    className="w-full bg-dark-200 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none min-h-[100px]"
                    placeholder="Beschreibe deinen Airdrop..."
                    defaultValue="Belohnung für aktive Community-Mitglieder. Teile diesen Airdrop und kommentiere mit deiner Wallet-Adresse, um teilzunehmen!"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Startdatum</label>
                    <input 
                      type="date" 
                      className="w-full bg-dark-200 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Enddatum</label>
                    <input 
                      type="date" 
                      className="w-full bg-dark-200 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Teilnahmebedingungen</label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="checkbox" id="condition1" className="mr-2" defaultChecked />
                      <label htmlFor="condition1" className="text-gray-300">Beitrag teilen</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="condition2" className="mr-2" defaultChecked />
                      <label htmlFor="condition2" className="text-gray-300">Wallet-Adresse kommentieren</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="condition3" className="mr-2" defaultChecked />
                      <label htmlFor="condition3" className="text-gray-300">Dem Projekt folgen</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="condition4" className="mr-2" />
                      <label htmlFor="condition4" className="text-gray-300">Mindestens 100 $TFC Token halten</label>
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-medium rounded-lg py-3 hover:shadow-lg hover:shadow-primary-500/20 transition-all">
                  Airdrop erstellen
                </button>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl"
                animate={{ 
                  x: [0, 20, 0], 
                  y: [0, -20, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 8,
                  ease: "easeInOut" 
                }}
              />
            </div>
          )}
          
          {activeTab === 'participate' && (
            <div className="space-y-6">
              <div className="bg-dark-100/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">Verfügbare Airdrops</h3>
                
                <div className="space-y-4">
                  {/* Airdrop 1 */}
                  <div className="bg-dark-200/70 rounded-lg p-4 border border-white/5 hover:border-primary-500/20 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                          T
                        </div>
                        <div>
                          <h4 className="text-white font-medium">TokenForge Launch Airdrop</h4>
                          <p className="text-gray-400 text-sm">Von TokenForge Official</p>
                        </div>
                      </div>
                      <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                        10.000 $TFC
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Fortschritt</span>
                        <span className="text-gray-400">65% abgeschlossen</span>
                      </div>
                      <div className="w-full bg-dark-300 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary-500 to-secondary-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Clock size={12} className="mr-1" /> 2 Tage übrig
                      </div>
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Users size={12} className="mr-1" /> 3.250 Teilnehmer
                      </div>
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Zap size={12} className="mr-1" /> Garantierte Belohnung
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs">Teilnahmebedingungen:</span>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Teilen</span>
                          <span className="mx-1 text-gray-500">•</span>
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Kommentieren</span>
                          <span className="mx-1 text-gray-500">•</span>
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Folgen</span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-primary-500 to-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary-500/20 transition-all">
                        Teilnehmen
                      </button>
                    </div>
                  </div>
                  
                  {/* Airdrop 2 */}
                  <div className="bg-dark-200/70 rounded-lg p-4 border border-white/5 hover:border-primary-500/20 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                          C
                        </div>
                        <div>
                          <h4 className="text-white font-medium">CryptoStart Token Airdrop</h4>
                          <p className="text-gray-400 text-sm">Von CryptoStart</p>
                        </div>
                      </div>
                      <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                        5.000 $CST
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Fortschritt</span>
                        <span className="text-gray-400">42% abgeschlossen</span>
                      </div>
                      <div className="w-full bg-dark-300 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Clock size={12} className="mr-1" /> 5 Tage übrig
                      </div>
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Users size={12} className="mr-1" /> 1.845 Teilnehmer
                      </div>
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Globe size={12} className="mr-1" /> Ethereum
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs">Teilnahmebedingungen:</span>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Teilen</span>
                          <span className="mx-1 text-gray-500">•</span>
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Kommentieren</span>
                          <span className="mx-1 text-gray-500">•</span>
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Min. 50 $TFC</span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                        Teilnehmen
                      </button>
                    </div>
                  </div>
                  
                  {/* Airdrop 3 */}
                  <div className="bg-dark-200/70 rounded-lg p-4 border border-white/5 hover:border-primary-500/20 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                          N
                        </div>
                        <div>
                          <h4 className="text-white font-medium">NFT Collective Airdrop</h4>
                          <p className="text-gray-400 text-sm">Von NFT Collective</p>
                        </div>
                      </div>
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        100 NFTs
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Fortschritt</span>
                        <span className="text-gray-400">78% abgeschlossen</span>
                      </div>
                      <div className="w-full bg-dark-300 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Clock size={12} className="mr-1" /> 1 Tag übrig
                      </div>
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Users size={12} className="mr-1" /> 2.340 Teilnehmer
                      </div>
                      <div className="bg-dark-300 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <Globe size={12} className="mr-1" /> Polygon
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs">Teilnahmebedingungen:</span>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Teilen</span>
                          <span className="mx-1 text-gray-500">•</span>
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Folgen</span>
                          <span className="mx-1 text-gray-500">•</span>
                          <span className="text-xs text-green-400 mr-1"><Check size={12} /></span>
                          <span className="text-gray-300 text-xs">Discord beitreten</span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-green-500/20 transition-all">
                        Teilnehmen
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button className="text-primary-400 hover:text-primary-300 transition-colors flex items-center mx-auto">
                    Mehr Airdrops anzeigen <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="bg-dark-100/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">Meine Airdrop-Teilnahmen</h3>
                
                <div className="space-y-4">
                  <div className="bg-dark-200/70 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                          T
                        </div>
                        <div>
                          <h4 className="text-white font-medium">TokenForge Launch Airdrop</h4>
                          <p className="text-gray-400 text-sm">Teilnahme bestätigt</p>
                        </div>
                      </div>
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Check size={14} className="mr-1" /> Teilgenommen
                      </div>
                    </div>
                    
                    <div className="bg-dark-300 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Deine Wallet-Adresse</span>
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm mr-2">0x1a2b...3c4d</span>
                          <button className="text-gray-400 hover:text-primary-400 transition-colors">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Erwartete Belohnung:</span>
                      <span className="text-primary-400 font-medium">~3 $TFC</span>
                    </div>
                  </div>
                  
                  <div className="bg-dark-200/70 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                          C
                        </div>
                        <div>
                          <h4 className="text-white font-medium">CryptoStart Token Airdrop</h4>
                          <p className="text-gray-400 text-sm">Teilnahme bestätigt</p>
                        </div>
                      </div>
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Check size={14} className="mr-1" /> Teilgenommen
                      </div>
                    </div>
                    
                    <div className="bg-dark-300 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Deine Wallet-Adresse</span>
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm mr-2">0x1a2b...3c4d</span>
                          <button className="text-gray-400 hover:text-primary-400 transition-colors">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Erwartete Belohnung:</span>
                      <span className="text-blue-400 font-medium">~2.5 $CST</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AirdropFeature;
