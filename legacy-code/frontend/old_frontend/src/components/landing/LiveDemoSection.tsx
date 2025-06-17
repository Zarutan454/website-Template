
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BarChart3, LineChart, Activity, Wallet, Zap, Users, Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GradientText } from '@/components/ui/gradient-text';
import GlowingButton from './GlowingButton';

const currentYear = new Date().getFullYear();
const mockTokenAnalytics = {
  priceHistory: Array(30).fill(0).map((_, i) => ({
    date: new Date(currentYear, 2, i + 1).toISOString().split('T')[0],
    price: 0.5 + Math.random() * 0.5 + i * 0.03
  })),
  volumeHistory: Array(30).fill(0).map((_, i) => ({
    date: new Date(currentYear, 2, i + 1).toISOString().split('T')[0],
    volume: 10000 + Math.random() * 25000 + i * 1000
  })),
  metrics: {
    price: 1.23,
    priceChange: 5.6,
    volume: 156400,
    volumeChange: 12.3,
    marketCap: 12345000,
    marketCapChange: 8.7,
    holders: 3456,
    holdersChange: 2.8
  }
};
const mockTransactions = [{
  from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  to: '0x8f5b2b7c2dcab5db3022f74a05d90f71d917eaeb',
  amount: 1250,
  time: '2 min ago',
  status: 'completed'
}, {
  from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  amount: 875,
  time: '15 min ago',
  status: 'completed'
}, {
  from: '0x388c818ca8b9251b393131c08a736a67ccb19297',
  to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  amount: 3100,
  time: '34 min ago',
  status: 'completed'
}, {
  from: '0x8f5b2b7c2dcab5db3022f74a05d90f71d917eaeb',
  to: '0x388c818ca8b9251b393131c08a736a67ccb19297',
  amount: 2500,
  time: '1 hour ago',
  status: 'completed'
}];
const mockSocialActivity = [{
  user: {
    name: 'Thomas',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  action: 'posted',
  content: 'Gerade meinen neuen BSN Token erstellt! Super einfach mit der Plattform!',
  time: '5 min ago',
  likes: 12,
  comments: 3,
  reward: 25
}, {
  user: {
    name: 'Sophie',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  action: 'shared',
  content: 'Das Feature zur Erstellung von NFTs auf BSN ist fantastisch! Hier ist meine erste Kollektion:',
  time: '17 min ago',
  likes: 32,
  comments: 8,
  reward: 40
}, {
  user: {
    name: 'Michael',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  action: 'commented',
  content: 'Die Mining-Funktion durch soziale Aktivitäten ist revolutionär! Habe gestern 200 Token verdient.',
  time: '45 min ago',
  likes: 18,
  comments: 5,
  reward: 15
}];

const LiveDemoSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const [activeDemo, setActiveDemo] = useState<string>('analytics');
  const EnhancedChart = ({
    data,
    dataKey = 'price',
    height = 200,
    color = '#8B5CF6',
    gradientId = 'chartGradient',
    showGridLines = true
  }) => {
    const max = Math.max(...data.map(item => item[dataKey])) * 1.1;
    const min = Math.min(...data.map(item => item[dataKey])) * 0.9;
    const range = max - min;
    return <div className="w-full h-full relative">
        <svg width="100%" height={height} viewBox={`0 0 ${data.length} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {showGridLines && Array.from({
          length: 5
        }).map((_, i) => <line key={i} x1="0" y1={height / 5 * i} x2={data.length} y2={height / 5 * i} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />)}
          
          <path d={data.map((point, i) => {
          const x = i;
          const y = height - (point[dataKey] - min) / range * height;
          return i === 0 ? `M ${x},${y} L ${x},${height}` : ` L ${x},${y}`;
        }).join('') + ` L ${data.length - 1},${height} Z`} fill={`url(#${gradientId})`} />
          
          <path d={data.map((point, i) => {
          const x = i;
          const y = height - (point[dataKey] - min) / range * height;
          return i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
        }).join('')} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {data.map((point, i) => {
          if (i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null;
          const dateStr = formatChartDate(point.date);
          return (
            <div key={`date-label-${i}`} className="text-center">
              {dateStr}
            </div>
          );
        })}
        </svg>
      </div>;
  };
  const EnhancedBarChart = ({
    data,
    dataKey = 'volume',
    height = 200,
    color = '#8B5CF6',
    gradientId = 'barChartGradient',
    showGridLines = true
  }) => {
    const max = Math.max(...data.map(item => item[dataKey])) * 1.1;
    const barWidth = 0.6;
    return <div className="w-full h-full relative">
        <svg width="100%" height={height} viewBox={`0 0 ${data.length} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          
          {showGridLines && Array.from({
          length: 5
        }).map((_, i) => <line key={i} x1="0" y1={height / 5 * i} x2={data.length} y2={height / 5 * i} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />)}
          
          {data.map((point, i) => {
          const barHeight = point[dataKey] / max * height;
          const x = i + (1 - barWidth) / 2;
          const y = height - barHeight;
          return <rect key={i} x={x} y={y} width={barWidth} height={barHeight} rx="2" fill={`url(#${gradientId})`} className="hover:opacity-90 transition-opacity cursor-pointer" />;
        })}
          
          <line x1="0" y1={height} x2={data.length} y2={height} stroke="rgba(255,255,255,0.2)" />
        </svg>
      </div>;
  };
  const formatChartDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short'
    });
  };
  return <section id="live-demo" ref={ref} className="py-20 md:py-32 relative overflow-hidden bg-dark-100">
      <div className="absolute inset-0 overflow-hidden">
        {/* Enhanced background effects to match hero section */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-200/60 via-dark-100/40 to-dark-100/80 z-1"></div>
        <motion.div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" animate={{
        x: [0, 30, 0],
        y: [0, -30, 0]
      }} transition={{
        repeat: Infinity,
        duration: 8,
        ease: "easeInOut"
      }} />
        <motion.div className="absolute top-1/3 right-1/3 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" animate={{
        x: [0, -20, 0],
        y: [0, 20, 0]
      }} transition={{
        repeat: Infinity,
        duration: 10,
        ease: "easeInOut",
        delay: 1
      }} />
        <motion.div className="absolute top-1/2 left-2/3 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl" animate={{
        x: [0, 25, 0],
        y: [0, 15, 0]
      }} transition={{
        repeat: Infinity,
        duration: 12,
        ease: "easeInOut",
        delay: 2
      }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {
        opacity: 0,
        y: 20
      }} transition={{
        duration: 0.5
      }} className="text-center max-w-3xl mx-auto mb-16">
          <motion.div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20" whileHover={{
          scale: 1.05,
          boxShadow: "0 0 20px rgba(244, 63, 94, 0.3)"
        }}>
            <span className="text-primary font-medium">Live Demo</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Testen Sie die <GradientText variant="primary" animate={true}>Plattform</GradientText> im Demomodus
          </h2>
          <p className="text-gray-300 text-lg">
            Erhalten Sie einen Einblick in die verschiedenen Features unserer Plattform mit interaktiven Demos.
          </p>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {
        opacity: 0,
        y: 30
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }} className="mb-10">
          <div className="flex justify-center flex-wrap gap-4 mb-8">
            <button onClick={() => setActiveDemo('analytics')} className={`flex items-center px-5 py-3 rounded-lg transition-all ${activeDemo === 'analytics' ? 'bg-primary text-white' : 'bg-dark-400/50 text-gray-300 hover:bg-dark-400'}`}>
              <BarChart3 size={18} className="mr-2" />
              <span>Token Analysen</span>
            </button>
            <button onClick={() => setActiveDemo('transactions')} className={`flex items-center px-5 py-3 rounded-lg transition-all ${activeDemo === 'transactions' ? 'bg-primary text-white' : 'bg-dark-400/50 text-gray-300 hover:bg-dark-400'}`}>
              <Activity size={18} className="mr-2" />
              <span>Transaktionen</span>
            </button>
            <button onClick={() => setActiveDemo('social')} className={`flex items-center px-5 py-3 rounded-lg transition-all ${activeDemo === 'social' ? 'bg-primary text-white' : 'bg-dark-400/50 text-gray-300 hover:bg-dark-400'}`}>
              <Users size={18} className="mr-2" />
              <span>Social Mining</span>
            </button>
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={inView ? {
        opacity: 1,
        scale: 1
      } : {
        opacity: 0,
        scale: 0.95
      }} transition={{
        duration: 0.6,
        delay: 0.3
      }} className="max-w-6xl mx-auto relative">
          {activeDemo === 'analytics' && <div className="bg-dark-300/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl relative transform perspective-1000 rotate-x-1 hover:rotate-x-0 transition-transform duration-700">
              {/* Enhanced 3D Glow effects */}
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
              
              {/* 3D Border Effect */}
              <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none"></div>
              <div className="absolute inset-0 rounded-xl border-t border-l border-white/10 pointer-events-none transform translate-x-0.5 -translate-y-0.5"></div>
              
              <div className="bg-dark-400/80 px-4 py-3 flex items-center justify-between backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-gray-300 text-sm ml-2 font-medium">Token Analytics Dashboard</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Community Token (CMT)</h3>
                    <p className="text-gray-400">Live Dashboard</p>
                  </div>
                  <div className="bg-green-500/10 text-green-400 py-1 px-3 rounded-full text-sm">
                    +5.6% heute
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card variant="glass" className="group hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-gray-400 text-sm">Preis (USD)</p>
                          <h4 className="text-white text-xl font-bold">
                            <motion.span
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className="inline-block"
                            >
                              ${mockTokenAnalytics.metrics.price.toFixed(2)}
                            </motion.span>
                          </h4>
                          <p className="text-green-400 text-sm">+{mockTokenAnalytics.metrics.priceChange}%</p>
                        </div>
                        <div className="p-2 bg-dark-300/50 backdrop-blur-sm rounded-lg border border-white/5">
                          <LineChart size={20} className="text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card variant="glass" className="group hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-gray-400 text-sm">Volumen (24h)</p>
                          <h4 className="text-white text-xl font-bold">
                            <motion.span
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="inline-block"
                            >
                              ${mockTokenAnalytics.metrics.volume.toLocaleString()}
                            </motion.span>
                          </h4>
                          <p className="text-green-400 text-sm">+{mockTokenAnalytics.metrics.volumeChange}%</p>
                        </div>
                        <div className="p-2 bg-dark-300/50 backdrop-blur-sm rounded-lg border border-white/5">
                          <BarChart3 size={20} className="text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card variant="glass" className="group hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-gray-400 text-sm">Marktkapitalisierung</p>
                          <h4 className="text-white text-xl font-bold">
                            <motion.span
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                              className="inline-block"
                            >
                              ${(mockTokenAnalytics.metrics.marketCap / 1000000).toFixed(2)}M
                            </motion.span>
                          </h4>
                          <p className="text-green-400 text-sm">+{mockTokenAnalytics.metrics.marketCapChange}%</p>
                        </div>
                        <div className="p-2 bg-dark-300/50 backdrop-blur-sm rounded-lg border border-white/5">
                          <Coins size={20} className="text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card variant="glass" className="group hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-gray-400 text-sm">Halter</p>
                          <h4 className="text-white text-xl font-bold">
                            <motion.span
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              className="inline-block"
                            >
                              {mockTokenAnalytics.metrics.holders.toLocaleString()}
                            </motion.span>
                          </h4>
                          <p className="text-green-400 text-sm">+{mockTokenAnalytics.metrics.holdersChange}%</p>
                        </div>
                        <div className="p-2 bg-dark-300/50 backdrop-blur-sm rounded-lg border border-white/5">
                          <Users size={20} className="text-pink-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mb-6">
                  <Tabs defaultValue="price">
                    <TabsList className="mb-4 bg-dark-400/70">
                      <TabsTrigger value="price">Preisverlauf</TabsTrigger>
                      <TabsTrigger value="volume">Volumen</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="price" className="h-80 border border-white/10 rounded-lg p-6 bg-dark-400/30 backdrop-blur-md shadow-inner relative overflow-hidden">
                      {/* Background glow effect */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-between items-center mb-6 relative z-10"
                      >
                        <div className="text-gray-300 text-sm font-medium">
                          <GradientText variant="primary" className="font-medium">Preisverlauf - Letzte 30 Tage</GradientText>
                        </div>
                        <div className="flex items-center bg-dark-300/50 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs border border-white/5 shadow-lg">
                          <BarChart3 size={14} className="mr-2 text-primary" />
                          <span className="text-primary">+{mockTokenAnalytics.metrics.priceChange}% im Vergleich zum Vormonat</span>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="h-48 relative z-10"
                      >
                        <EnhancedBarChart data={mockTokenAnalytics.priceHistory} dataKey="price" height={150} color="#EC4899" gradientId="priceGradient" />
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-4 grid grid-cols-5 gap-1 text-xs text-gray-400 relative z-10"
                      >
                        {mockTokenAnalytics.priceHistory.filter((_, i) => i % 6 === 0 || i === mockTokenAnalytics.priceHistory.length - 1).map((item, i) => (
                          <div key={i} className="text-center">
                            {formatChartDate(item.date)}
                          </div>
                        ))}
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="volume" className="h-80 border border-white/10 rounded-lg p-6 bg-dark-400/30 backdrop-blur-md shadow-inner relative overflow-hidden">
                      {/* Background glow effect */}
                      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-between items-center mb-6 relative z-10"
                      >
                        <div className="text-gray-300 text-sm font-medium">
                          <GradientText variant="secondary" className="font-medium">Handelsvolumen - Letzte 30 Tage</GradientText>
                        </div>
                        <div className="flex items-center bg-dark-300/50 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs border border-white/5 shadow-lg">
                          <BarChart3 size={14} className="mr-2 text-blue-400" />
                          <span className="text-blue-400">+{mockTokenAnalytics.metrics.volumeChange}% im Vergleich zum Vormonat</span>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="h-48 relative z-10"
                      >
                        <EnhancedBarChart data={mockTokenAnalytics.volumeHistory} dataKey="volume" height={150} color="#8B5CF6" gradientId="volumeGradient" />
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-4 grid grid-cols-5 gap-1 text-xs text-gray-400 relative z-10"
                      >
                        {mockTokenAnalytics.volumeHistory.filter((_, i) => i % 6 === 0 || i === mockTokenAnalytics.volumeHistory.length - 1).map((item, i) => (
                          <div key={i} className="text-center">
                            {formatChartDate(item.date)}
                          </div>
                        ))}
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>}
          
          {activeDemo === 'transactions' && <div className="bg-dark-300/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl relative transform perspective-1000 rotate-x-1 hover:rotate-x-0 transition-transform duration-700">
              {/* Enhanced 3D Glow effects */}
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
              
              {/* 3D Border Effect */}
              <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none"></div>
              <div className="absolute inset-0 rounded-xl border-t border-l border-white/10 pointer-events-none transform translate-x-0.5 -translate-y-0.5"></div>
              
              <div className="bg-dark-400/80 px-4 py-3 flex items-center justify-between backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-gray-300 text-sm ml-2 font-medium">Live Transaktionen</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-between mb-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      <GradientText variant="secondary" animate={true}>Transaktions-Monitor</GradientText>
                    </h3>
                    <p className="text-gray-400">Community Token (CMT)</p>
                  </div>
                  <div className="bg-dark-400/50 backdrop-blur-sm py-1.5 px-4 rounded-full text-sm flex items-center text-gray-300 border border-white/5 shadow-lg">
                    <Wallet size={14} className="mr-2 text-blue-400" />
                    <span>Echtzeit-Überwachung</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  {mockTransactions.map((tx, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 bg-dark-400/30 backdrop-blur-md rounded-lg border border-white/10 hover:bg-dark-400/50 transition-all duration-300 hover:scale-[1.02] group"
                    >
                      <div className="flex items-center justify-between relative overflow-hidden">
                        {/* Subtle glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="flex items-center relative z-10">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-white flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20">
                            <Activity size={18} />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-400">Von: <span className="text-white font-medium">{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</span></p>
                            <p className="text-sm text-gray-400">An: <span className="text-white font-medium">{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span></p>
                          </div>
                        </div>
                        <div className="text-right relative z-10">
                          <p className="text-white font-medium">{tx.amount.toLocaleString()} <span className="text-blue-400">CMT</span></p>
                          <p className="text-gray-400 text-sm">{tx.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 backdrop-blur-sm border border-primary/20 rounded-lg shadow-lg"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 text-white flex items-center justify-center mr-3 shadow-lg">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-white font-medium">Live-Monitoring aktiv</p>
                      <p className="text-gray-400 text-sm">Neue Transaktionen werden automatisch angezeigt</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>}
          
          {activeDemo === 'social' && <div className="bg-dark-300/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl relative transform perspective-1000 rotate-x-1 hover:rotate-x-0 transition-transform duration-700">
              {/* Enhanced 3D Glow effects */}
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
              
              {/* 3D Border Effect */}
              <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none"></div>
              <div className="absolute inset-0 rounded-xl border-t border-l border-white/10 pointer-events-none transform translate-x-0.5 -translate-y-0.5"></div>
              
              <div className="bg-dark-400/80 px-4 py-3 flex items-center justify-between backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-gray-300 text-sm ml-2 font-medium">Social Mining Feed</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-between mb-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      <GradientText variant="accent" animate={true}>Social Mining Aktivitäten</GradientText>
                    </h3>
                    <p className="text-gray-400">Verdiene Token durch soziale Interaktionen</p>
                  </div>
                  <div className="bg-dark-400/50 backdrop-blur-sm py-1.5 px-4 rounded-full text-sm flex items-center text-gray-300 border border-white/5 shadow-lg">
                    <Zap size={14} className="mr-2 text-amber-400" />
                    <span>Mining aktiv</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-8 p-4 bg-dark-400/30 backdrop-blur-md rounded-lg border border-white/10 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg border border-white/10">
                      <img src="https://randomuser.me/api/portraits/men/43.jpg" alt="Your avatar" className="w-full h-full object-cover" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Was gibt es Neues? Teile es mit der Community..." 
                      className="flex-1 bg-dark-300/50 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 text-white shadow-inner focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all" 
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-dark-400/50 backdrop-blur-sm hover:bg-dark-300/70 transition-all duration-300 py-1.5 px-3 rounded-lg text-sm text-gray-300 flex items-center border border-white/5 hover:border-white/10 hover:scale-105 shadow-sm">
                      <span className="mr-2">📷</span> Foto
                    </button>
                    <button className="bg-dark-400/50 backdrop-blur-sm hover:bg-dark-300/70 transition-all duration-300 py-1.5 px-3 rounded-lg text-sm text-gray-300 flex items-center border border-white/5 hover:border-white/10 hover:scale-105 shadow-sm">
                      <span className="mr-2">🎬</span> Video
                    </button>
                    <button className="bg-dark-400/50 backdrop-blur-sm hover:bg-dark-300/70 transition-all duration-300 py-1.5 px-3 rounded-lg text-sm text-gray-300 flex items-center border border-white/5 hover:border-white/10 hover:scale-105 shadow-sm">
                      <span className="mr-2">📊</span> Umfrage
                    </button>
                    <button className="bg-dark-400/50 backdrop-blur-sm hover:bg-dark-300/70 transition-all duration-300 py-1.5 px-3 rounded-lg text-sm text-gray-300 flex items-center border border-white/5 hover:border-white/10 hover:scale-105 shadow-sm">
                      <span className="mr-2">🔗</span> Link
                    </button>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-6"
                >
                  {mockSocialActivity.map((activity, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                      className="p-4 bg-dark-400/30 backdrop-blur-md rounded-lg border border-white/10 hover:bg-dark-400/50 transition-all duration-300 hover:scale-[1.02] group shadow-lg"
                    >
                      <div className="flex items-start relative overflow-hidden">
                        {/* Subtle glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10 shadow-lg relative z-10">
                          <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-3 flex-1 relative z-10">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium">{activity.user.name} <span className="text-gray-400 font-normal">{activity.action}</span></p>
                            <p className="text-gray-400 text-sm">{activity.time}</p>
                          </div>
                          <p className="text-gray-300 mt-1">{activity.content}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex space-x-4">
                              <button className="text-gray-400 hover:text-white text-sm flex items-center transition-colors duration-300">
                                <span>❤️</span>
                                <span className="ml-1">{activity.likes}</span>
                              </button>
                              <button className="text-gray-400 hover:text-white text-sm flex items-center transition-colors duration-300">
                                <span>💬</span>
                                <span className="ml-1">{activity.comments}</span>
                              </button>
                              <button className="text-gray-400 hover:text-white text-sm flex items-center transition-colors duration-300">
                                <span>🔄</span>
                                <span className="ml-1">Teilen</span>
                              </button>
                            </div>
                            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm text-amber-400 py-1 px-3 rounded-full text-sm flex items-center border border-amber-500/20 shadow-lg">
                              <Zap size={14} className="mr-1" />
                              <span>+{activity.reward} BSN</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/20 rounded-lg shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 text-white flex items-center justify-center mr-3 shadow-lg">
                        <Zap size={18} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Social Mining aktiv</p>
                        <p className="text-gray-400 text-sm">Du hast heute <span className="text-amber-400 font-medium">127 BSN</span> Token verdient</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-3 bg-dark-300/50 rounded-full overflow-hidden shadow-inner border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        ></motion.div>
                      </div>
                      <span className="text-amber-400 ml-2 text-sm font-medium">75%</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>}
        </motion.div>
      </div>
    </section>;
};
export default LiveDemoSection;

