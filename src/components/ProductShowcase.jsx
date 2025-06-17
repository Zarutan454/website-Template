// src/components/ProductShowcase.jsx
import { useEffect, useState, useRef } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const ProductShowcase = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoverState, setHoverState] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const networkRef = useRef(null);
  
  // Platform statistics data
  const statistics = {
    overview: {
      users: { value: 2.7, unit: 'M', growth: '+24%', label: 'Active Users' },
      transactions: { value: 18.4, unit: 'M', growth: '+32%', label: 'Transactions' },
      volume: { value: 342, unit: 'M', growth: '+18%', label: 'Trading Volume' },
      nodes: { value: 12.5, unit: 'K', growth: '+15%', label: 'Network Nodes' }
    },
    engagement: {
      dailyActive: { value: 1.2, unit: 'M', growth: '+28%', label: 'Daily Active' },
      retention: { value: 87, unit: '%', growth: '+5%', label: 'User Retention' },
      avgTime: { value: 24, unit: 'min', growth: '+12%', label: 'Avg. Session' },
      interactions: { value: 45, unit: 'M', growth: '+41%', label: 'Interactions' }
    },
    security: {
      uptime: { value: 99.98, unit: '%', growth: '+0.1%', label: 'Network Uptime' },
      verified: { value: 3.8, unit: 'M', growth: '+22%', label: 'Verified Profiles' },
      securityScore: { value: 94, unit: '%', growth: '+3%', label: 'Security Score' },
      incidents: { value: 0, unit: '', growth: '-100%', label: 'Security Incidents' }
    }
  };
  
  // Chart data for different timeframes
  const chartData = {
    week: [12, 18, 15, 22, 27, 24, 30],
    month: [30, 45, 55, 60, 48, 75, 82, 90, 85, 92, 98, 110],
    year: [50, 65, 72, 80, 95, 110, 125, 140, 155, 170, 190, 220]
  };
  
  // Interactive blockchain network animation
  const handleMouseMove = (e) => {
    if (networkRef.current) {
      const bounds = networkRef.current.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      
      const rotateX = (mouseY - centerY) / 50;
      const rotateY = (centerX - mouseX) / 50;
      
      networkRef.current.style.transform = `rotate3d(1, 0, 0, ${rotateX}deg) rotate3d(0, 1, 0, ${rotateY}deg)`;
    }
  };
  
  const handleMouseLeave = () => {
    if (networkRef.current) {
      networkRef.current.style.transform = 'rotate3d(0, 0, 0, 0deg)';
    }
  };
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [isInView, animationStarted]);

  // Animation for statistics counting up
  const [counts, setCounts] = useState({
    users: 0,
    transactions: 0,
    volume: 0,
    nodes: 0,
    dailyActive: 0,
    retention: 0,
    avgTime: 0,
    interactions: 0,
    uptime: 0,
    verified: 0,
    securityScore: 0,
    incidents: 0
  });
  
  useEffect(() => {
    if (!animationStarted) return;
    
    const duration = 2000; // 2 seconds
    const frameRate = 60;
    const totalFrames = duration * frameRate / 1000;
    let frame = 0;
    
    const currentStats = statistics[activeTab];
    const targetCounts = {};
    Object.keys(currentStats).forEach(key => {
      targetCounts[key] = currentStats[key].value;
    });
    
    const initialCounts = { ...counts };
    
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      if (progress >= 1) {
        setCounts(targetCounts);
        clearInterval(interval);
        return;
      }
      
      const newCounts = { ...counts };
      Object.keys(targetCounts).forEach(key => {
        const start = initialCounts[key] || 0;
        const end = targetCounts[key];
        newCounts[key] = start + (end - start) * easeOutQuart(progress);
      });
      
      setCounts(newCounts);
    }, 1000 / frameRate);
    
    return () => clearInterval(interval);
  }, [animationStarted, activeTab]);
  
  // Easing function for smoother animation
  const easeOutQuart = (x) => {
    return 1 - Math.pow(1 - x, 4);
  };

  return (
    <section 
      ref={ref}
      className="relative min-h-screen py-20 bg-black overflow-hidden"
    >
      {/* Section Title */}
      <div className={`relative z-20 text-center mb-16 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-300`}>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-4">
          <span className="relative">
            <span 
              className="text-white"
              style={{
                background: 'linear-gradient(to right, #ffffff, #00a2ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Platform Statistics
            </span>
            <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
          </span>
        </h2>
        <p className="text-[#a0e4ff]/70 max-w-2xl mx-auto text-lg">
          Real-time metrics and growth analytics from our blockchain network
        </p>
      </div>
      
      {/* Blockchain network grid background */}
      <div className="absolute inset-0 blockchain-grid opacity-10"></div>
      
      {/* Magazine Style Header */}
      <div 
        className={`absolute top-8 left-8 z-20 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700 delay-300`}
        onMouseEnter={() => setHoverState('header')}
        onMouseLeave={() => setHoverState('')}
      >
        <div className="flex items-center">
          <div className={`h-4 w-4 hexagon border border-[#00a2ff]/30 transition-all duration-300 ${hoverState === 'header' ? 'rotate-45 bg-[#00a2ff]/10' : ''}`}></div>
          <span className="ml-3 text-white/70 text-sm font-mono tracking-widest">METRICS <span className="text-[#00a2ff]/70">|</span> BLOCKCHAIN NETWORK</span>
        </div>
      </div>
      
      {/* Page Number */}
      <div className={`absolute bottom-8 right-8 z-20 text-white/50 text-sm ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-500`}>
        <div className="flex items-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#00a2ff]/30 mr-2"></div>
          <span className="font-mono tracking-widest">04</span>
          <div className="ml-2 w-2 h-2 hexagon bg-[#00a2ff]/30"></div>
        </div>
      </div>
      
      {/* Decorative blockchain elements */}
      <div className={`absolute top-0 right-24 h-32 w-px bg-gradient-to-b from-transparent via-[#00a2ff]/30 to-transparent transform rotate-45 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-700`}></div>
      <div className={`absolute bottom-0 left-1/4 h-40 w-px bg-gradient-to-t from-transparent via-white/10 to-transparent transform -rotate-45 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-900`}></div>
      <div className={`absolute top-1/4 right-1/3 w-24 h-24 hexagon border border-white/5 ${animationStarted ? 'animate-spin-slow opacity-20' : 'opacity-0'} transition-opacity duration-700 delay-1100`} style={{ animationDuration: '30s' }}></div>
      
      {/* Enhanced background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050520] to-black opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,162,255,0.1),transparent_70%)] opacity-60"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="flex flex-col items-center">
          {/* Statistics Tabs */}
          <div className={`w-full max-w-4xl mb-10 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-500`}>
            <div className="flex justify-center space-x-6 md:space-x-10 mb-8">
              {Object.keys(statistics).map((tab) => (
                <button
                  key={tab}
                  className={`relative px-4 py-2 text-sm md:text-base transition-all duration-300 capitalize ${activeTab === tab ? 'text-[#00a2ff]' : 'text-white/70 hover:text-white'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Object.entries(statistics[activeTab]).map(([key, stat]) => (
                <div 
                  key={key}
                  className="bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg p-5 transition-all duration-300 hover:border-[#00a2ff]/30 hover:bg-[#06071F]/70 group"
                  onMouseEnter={() => setHoverState(`stat-${key}`)}
                  onMouseLeave={() => setHoverState('')}
                >
                  <div className="flex items-end justify-between mb-2">
                    <h3 className="text-white/70 text-sm">{stat.label}</h3>
                    <span className={`text-xs ${stat.growth.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.growth}
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl md:text-4xl font-light text-white">
                      {counts[key] % 1 === 0 ? counts[key] : counts[key].toFixed(1)}
                    </span>
                    <span className="ml-1 text-lg text-[#00a2ff]">{stat.unit}</span>
                  </div>
                  <div 
                    className="h-1 w-0 bg-gradient-to-r from-[#00a2ff] to-transparent mt-3 transition-all duration-500 group-hover:w-full"
                    style={{ width: hoverState === `stat-${key}` ? '100%' : '0%' }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Interactive Chart */}
          <div className={`w-full max-w-4xl mb-12 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-700`}>
            <div className="bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg">Network Growth</h3>
                <div className="flex space-x-2">
                  {['week', 'month', 'year'].map((timeframe) => (
                    <button
                      key={timeframe}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                        selectedTimeframe === timeframe 
                          ? 'bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff]' 
                          : 'bg-transparent border border-white/10 text-white/50 hover:border-white/30'
                      }`}
                      onClick={() => setSelectedTimeframe(timeframe)}
                    >
                      {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chart Visualization */}
              <div className="h-48 relative">
                <div className="absolute inset-0 flex items-end">
                  {chartData[selectedTimeframe].map((value, index) => {
                    const maxValue = Math.max(...chartData[selectedTimeframe]);
                    const height = (value / maxValue) * 100;
                    
                    return (
                      <div 
                        key={index}
                        className="flex-1 flex items-end justify-center group"
                        onMouseEnter={() => setHoverState(`chart-${index}`)}
                        onMouseLeave={() => setHoverState('')}
                      >
                        <div 
                          className={`w-[60%] bg-gradient-to-t from-[#00a2ff]/80 to-[#0077ff]/40 rounded-t transition-all duration-500 ${animationStarted ? 'h-[' + height + '%]' : 'h-0'}`}
                          style={{ 
                            height: animationStarted ? `${height}%` : '0%',
                            transitionDelay: `${index * 0.1 + 0.5}s`,
                            opacity: hoverState === `chart-${index}` ? '1' : '0.7'
                          }}
                        ></div>
                        
                        {/* Tooltip */}
                        <div 
                          className={`absolute bottom-full mb-2 bg-[#06071F] border border-[#00a2ff]/30 rounded px-2 py-1 text-xs text-white transition-all duration-300 ${
                            hoverState === `chart-${index}` ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                          }`}
                        >
                          {value}K
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* X-axis */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10"></div>
                
                {/* Y-axis */}
                <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/10"></div>
              </div>
              
              {/* X-axis Labels */}
              <div className="flex mt-2">
                {chartData[selectedTimeframe].map((_, index) => {
                  const labels = {
                    week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  };
                  
                  return (
                    <div key={index} className="flex-1 text-center text-xs text-white/50">
                      {labels[selectedTimeframe][index]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className={`w-full max-w-4xl ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-900`}>
            <div className="bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg p-6">
              <h3 className="text-white text-lg mb-4">Recent Network Activity</h3>
              
              <div className="space-y-4">
                {[
                  { type: 'transaction', user: 'User0x8F3E', amount: '2,450 BSN', time: '2 minutes ago' },
                  { type: 'node', user: 'Node0x4A7B', action: 'Joined Network', time: '15 minutes ago' },
                  { type: 'verification', user: 'User0x2C9D', entity: 'Identity Verified', time: '34 minutes ago' },
                  { type: 'transaction', user: 'User0x6E1F', amount: '18,750 BSN', time: '1 hour ago' }
                ].map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0"
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        activity.type === 'transaction' 
                          ? 'bg-green-500/20 text-green-400' 
                          : activity.type === 'node' 
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {activity.type === 'transaction' 
                          ? '💱' 
                          : activity.type === 'node' 
                            ? '🖧'
                            : '✓'}
                      </div>
                      <div>
                        <p className="text-white text-sm">{activity.user}</p>
                        <p className="text-white/50 text-xs">
                          {activity.amount || activity.action || activity.entity}
                        </p>
                      </div>
                    </div>
                    <span className="text-white/40 text-xs">{activity.time}</span>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 w-full py-2 border border-[#00a2ff]/30 rounded-md text-[#00a2ff] text-sm hover:bg-[#00a2ff]/10 transition-colors duration-300">
                View All Activity
              </button>
            </div>
          </div>
          
          {/* Interactive Network Visualization - Minimized */}
          <div 
            className={`w-full max-w-4xl mt-12 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-1500 ease-out`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative h-40 perspective-1000">
              {/* Multiple layered network effects */}
              <div className="absolute inset-0 bg-[#00a2ff]/10 blur-3xl rounded-full animate-pulse-slow" style={{ animationDuration: '8s' }}></div>
              
              {/* Main BSN Network Visualization */}
              <div 
                className="relative z-10 mx-auto flex justify-center h-full"
                onMouseEnter={() => setHoverState('network')}
                onMouseLeave={() => setHoverState('')}
              >
                <div 
                  ref={networkRef}
                  className="relative w-full h-full flex items-center justify-center"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Central BSN Hub */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 hexagon bg-gradient-to-br from-[#00a2ff]/30 to-[#0077ff]/10 border-2 border-[#00a2ff]/50 flex items-center justify-center animate-pulse-glow">
                      <div className="text-center">
                        <div className="text-xl font-light text-[#00a2ff]">BSN</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Orbiting Network Nodes - Simplified */}
                  {[...Array(6)].map((_, i) => {
                    const angle = (i * 60) * (Math.PI / 180);
                    const radius = 80;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <div
                        key={i}
                        className="absolute w-6 h-6 hexagon bg-[#00a2ff]/20 border border-[#00a2ff]/40 flex items-center justify-center animate-float"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                          animationDelay: `${i * 0.5}s`
                        }}
                      >
                        <div className="w-1 h-1 bg-[#00a2ff]/80 rounded-full animate-pulse"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;