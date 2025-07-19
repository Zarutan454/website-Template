import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Search, Filter, Users, Clock, Check, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAirdrops } from '@/hooks/useAirdrops';
import { useAuth } from '@/context/AuthContext.utils';
import { toast } from 'sonner';

const AirdropsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState({
    active: true,
    upcoming: true,
    ended: false,
    bsn: true,
    eth: true,
    other: true
  });
  
  const { user: profile } = useAuth();
  const { 
    airdrops, 
    isLoading, 
    error, 
    participateInAirdrop 
  } = useAirdrops(searchQuery, filterOptions);
  
  const handleFilterChange = (key: string, value: boolean) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleParticipate = async (airdropId: string) => {
    if (!profile?.id) {
      toast.error('Du musst angemeldet sein, um an Airdrops teilzunehmen');
      return;
    }
    
    const result = await participateInAirdrop(airdropId, profile.id);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white mr-4">
              <Gift size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Airdrops</h1>
              <p className="text-gray-400">Entdecke und nimm an Token-Airdrops teil</p>
            </div>
          </div>
          
          <Link 
            to="/feed/create-airdrop"
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/20 transition-all flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Airdrop erstellen
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Airdrops durchsuchen..."
              className="w-full bg-dark-100 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button 
            className="px-4 py-2 bg-dark-100 rounded-lg text-white flex items-center hover:bg-dark-300 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} className="mr-2" />
            Filter
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="mt-4 p-4 bg-dark-100 rounded-lg border border-gray-800"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-white font-medium mb-3">Status</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={filterOptions.active}
                        onChange={(e) => handleFilterChange('active', e.target.checked)}
                      />
                      <span className="text-gray-300">Aktiv</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={filterOptions.upcoming}
                        onChange={(e) => handleFilterChange('upcoming', e.target.checked)}
                      />
                      <span className="text-gray-300">Kommend</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={filterOptions.ended}
                        onChange={(e) => handleFilterChange('ended', e.target.checked)}
                      />
                      <span className="text-gray-300">Beendet</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-3">Token</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={filterOptions.bsn}
                        onChange={(e) => handleFilterChange('bsn', e.target.checked)}
                      />
                      <span className="text-gray-300">BSN</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={filterOptions.eth}
                        onChange={(e) => handleFilterChange('eth', e.target.checked)}
                      />
                      <span className="text-gray-300">ETH</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={filterOptions.other}
                        onChange={(e) => handleFilterChange('other', e.target.checked)}
                      />
                      <span className="text-gray-300">Andere</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-3">Anforderungen</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-gray-300">Social Tasks</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-gray-300">Token Holding</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-gray-300">Community</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Airdrops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <p className="text-gray-400">Airdrops werden geladen...</p>
          </div>
        ) : error ? (
          <div className="col-span-3 text-center py-20">
            <div className="text-red-400 mb-2">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-dark-300 rounded-lg text-white hover:bg-dark-400 transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        ) : airdrops.length === 0 ? (
          <div className="col-span-3 text-center py-20">
            <p className="text-gray-400 mb-4">Keine Airdrops gefunden</p>
            <Link 
              to="/feed/create-airdrop"
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/20 transition-all"
            >
              Erstelle den ersten Airdrop
            </Link>
          </div>
        ) : (
          airdrops.map((airdrop, index) => (
          <motion.div
            key={airdrop.id}
            className="bg-dark-200 rounded-xl border border-gray-800 overflow-hidden hover:border-primary-500/30 transition-all"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{airdrop.title}</h3>
                <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                  {airdrop.amount} {airdrop.token}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-400">
                    <Users size={14} className="mr-1" />
                    {airdrop.participants} Teilnehmer
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock size={14} className="mr-1" />
                    Noch 7 Tage
                  </div>
                </div>
                
                <div className="w-full bg-dark-300 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-600 h-2 rounded-full" 
                    style={{ width: '65%' }}
                    initial={{ width: '0%' }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-white font-medium">Anforderungen:</h4>
                  {airdrop.requirements.map((req, i) => (
                    <div key={i} className="flex items-center text-gray-300 text-sm">
                      <Check size={14} className="text-primary-400 mr-2" />
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <button 
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-medium py-2 rounded-lg hover:shadow-lg hover:shadow-primary-500/20 transition-all"
                onClick={() => handleParticipate(airdrop.id)}
              >
                Teilnehmen
              </button>
            </div>
          </motion.div>
        )))}
      </div>
    </div>
  );
};

export default AirdropsPage;

