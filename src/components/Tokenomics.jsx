import { useState, useEffect, useRef } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const Tokenomics = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoverSection, setHoverSection] = useState(null);
  const [activeTab, setActiveTab] = useState('allocation');
  const chartRef = useRef(null);
  
  // Tokenomics data
  const tokenData = {
    symbol: 'BSN',
    name: 'Blockchain Social Network Token',
    totalSupply: '1,000,000,000',
    initialPrice: '$0.05',
    currentPrice: '$4.28',
    marketCap: '$1.2B',
    circulatingSupply: '280,000,000',
    allocation: [
      { name: 'Community Rewards', percentage: 40, color: '#00a2ff' },
      { name: 'Public Sale', percentage: 20, color: '#0077ff' },
      { name: 'Team & Advisors', percentage: 15, color: '#7b61ff' },
      { name: 'Platform Development', percentage: 10, color: '#c961ff' },
      { name: 'Ecosystem Fund', percentage: 10, color: '#ff61d8' },
      { name: 'Liquidity Reserves', percentage: 5, color: '#ff617b' }
    ],
    vesting: [
      { category: 'Community Rewards', schedule: 'Continuous distribution based on platform engagement' },
      { category: 'Public Sale', schedule: '40% at TGE, 60% over 6 months' },
      { category: 'Team & Advisors', schedule: '12-month cliff, then 24-month linear vesting' },
      { category: 'Platform Development', schedule: '10% at TGE, then 30-month linear vesting' },
      { category: 'Ecosystem Fund', schedule: '5% at TGE, then 36-month linear vesting' },
      { category: 'Liquidity Reserves', schedule: '100% at TGE, used for exchange liquidity' }
    ],
    utility: [
      { 
        title: 'Governance', 
        description: 'BSN token holders can propose and vote on platform changes, feature additions, and other important decisions.',
        icon: '🏛️'
      },
      { 
        title: 'Staking Rewards', 
        description: 'Earn passive income by staking BSN tokens, with APY ranging from 8-15% based on lock-up period.',
        icon: '💰'
      },
      { 
        title: 'Content Monetization', 
        description: 'Creators earn BSN tokens directly from supporters and through automated engagement rewards.',
        icon: '📈'
      },
      { 
        title: 'Premium Features', 
        description: 'Access exclusive platform features, tools, and higher limits by holding BSN tokens.',
        icon: '🔑'
      },
      { 
        title: 'Network Fees', 
        description: 'BSN tokens are used for transaction fees on the network, with 50% of fees burned to create deflationary pressure.',
        icon: '🔄'
      },
      { 
        title: 'NFT Marketplace', 
        description: 'Buy, sell, and trade NFTs using BSN tokens with reduced marketplace fees.',
        icon: '🖼️'
      }
    ]
  };
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [isInView, animationStarted]);
  
  // Draw pie chart using SVG
  useEffect(() => {
    if (!animationStarted || !chartRef.current) return;
    
    const drawPieChart = () => {
      const svg = chartRef.current;
      const size = 200;
      const radius = size / 2;
      const centerX = size / 2;
      const centerY = size / 2;
      
      // Clear previous content
      svg.innerHTML = '';
      
      // Calculate total for percentages
      const total = tokenData.allocation.reduce((sum, item) => sum + item.percentage, 0);
      
      // Draw pie segments
      let startAngle = 0;
      tokenData.allocation.forEach((item, index) => {
        const percentage = item.percentage / total;
        const endAngle = startAngle + percentage * 2 * Math.PI;
        
        // Calculate coordinates
        const x1 = centerX + radius * Math.sin(startAngle);
        const y1 = centerY - radius * Math.cos(startAngle);
        const x2 = centerX + radius * Math.sin(endAngle);
        const y2 = centerY - radius * Math.cos(endAngle);
        
        // Determine if the arc should be drawn as a large arc
        const largeArcFlag = percentage > 0.5 ? 1 : 0;
        
        // Create path for pie segment
        const pathData = [
          `M ${centerX},${centerY}`,
          `L ${x1},${y1}`,
          `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`,
          'Z'
        ].join(' ');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', item.color);
        path.setAttribute('stroke', '#06071F');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('data-index', index);
        path.setAttribute('class', 'transition-all duration-300');
        
        // Add hover effect
        path.addEventListener('mouseenter', () => {
          path.setAttribute('transform', `translate(${Math.sin((startAngle + endAngle) / 2) * 10}, ${-Math.cos((startAngle + endAngle) / 2) * 10})`);
          setHoverSection(item.name);
        });
        
        path.addEventListener('mouseleave', () => {
          path.setAttribute('transform', '');
          setHoverSection(null);
        });
        
        svg.appendChild(path);
        
        startAngle = endAngle;
      });
      
      // Add center circle for better appearance
      const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      centerCircle.setAttribute('cx', centerX);
      centerCircle.setAttribute('cy', centerY);
      centerCircle.setAttribute('r', radius * 0.5);
      centerCircle.setAttribute('fill', '#06071F');
      centerCircle.setAttribute('stroke', '#00a2ff');
      centerCircle.setAttribute('stroke-width', '1');
      svg.appendChild(centerCircle);
      
      // Add BSN text in center
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', centerX);
      text.setAttribute('y', centerY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#00a2ff');
      text.setAttribute('font-size', '24');
      text.textContent = 'BSN';
      svg.appendChild(text);
    };
    
    drawPieChart();
    
    // Redraw on window resize
    window.addEventListener('resize', drawPieChart);
    return () => window.removeEventListener('resize', drawPieChart);
  }, [animationStarted, hoverSection]);

  return (
    <section 
      ref={ref}
      className="relative py-20 bg-black overflow-hidden"
    >
      {/* Decorative blockchain elements */}
      <div className="absolute inset-0 blockchain-grid opacity-10"></div>
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-6">
        {/* Section Title */}
        <div className={`text-center mb-16 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-300`}>
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
                Tokenomics
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
            </span>
          </h2>
          <p className="text-[#a0e4ff]/70 max-w-2xl mx-auto text-lg">
            The economic model powering the Blockchain Social Network
          </p>
        </div>
        
        {/* Token Overview */}
        <div className={`max-w-4xl mx-auto mb-16 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-500`}>
          <div className="bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg p-8">
            <h3 className="text-2xl font-light text-white mb-6">Token Overview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-[#8aa0ff]/70 text-sm">Token Name</p>
                <p className="text-white text-lg font-light">{tokenData.name}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[#8aa0ff]/70 text-sm">Symbol</p>
                <p className="text-white text-lg font-light">{tokenData.symbol}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[#8aa0ff]/70 text-sm">Total Supply</p>
                <p className="text-white text-lg font-light">{tokenData.totalSupply}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[#8aa0ff]/70 text-sm">Initial Price</p>
                <p className="text-white text-lg font-light">{tokenData.initialPrice}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[#8aa0ff]/70 text-sm">Current Price</p>
                <p className="text-white text-lg font-light">{tokenData.currentPrice} <span className="text-green-400 text-sm">+5.2%</span></p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[#8aa0ff]/70 text-sm">Market Cap</p>
                <p className="text-white text-lg font-light">{tokenData.marketCap}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className={`mb-8 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-700`}>
          <div className="flex justify-center space-x-6">
            <button
              className={`relative px-4 py-2 text-sm md:text-base transition-all duration-300 ${activeTab === 'allocation' ? 'text-[#00a2ff]' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('allocation')}
            >
              Token Allocation
              {activeTab === 'allocation' && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
              )}
            </button>
            <button
              className={`relative px-4 py-2 text-sm md:text-base transition-all duration-300 ${activeTab === 'vesting' ? 'text-[#00a2ff]' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('vesting')}
            >
              Vesting Schedule
              {activeTab === 'vesting' && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
              )}
            </button>
            <button
              className={`relative px-4 py-2 text-sm md:text-base transition-all duration-300 ${activeTab === 'utility' ? 'text-[#00a2ff]' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('utility')}
            >
              Token Utility
              {activeTab === 'utility' && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
              )}
            </button>
          </div>
        </div>
        
        {/* Token Allocation Tab */}
        <div 
          className={`max-w-4xl mx-auto transition-all duration-700 ${
            activeTab === 'allocation' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10 absolute pointer-events-none'
          }`}
          style={{ position: activeTab === 'allocation' ? 'relative' : 'absolute' }}
        >
          <div className="bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg p-8">
            <div className="flex flex-col md:flex-row">
              {/* Pie Chart */}
              <div className="md:w-1/2 flex justify-center items-center mb-8 md:mb-0">
                <div className="relative">
                  <svg ref={chartRef} width="200" height="200" viewBox="0 0 200 200"></svg>
                  
                  {/* Glowing effect behind chart */}
                  <div className="absolute inset-0 bg-[#00a2ff]/10 blur-2xl rounded-full -z-10"></div>
                </div>
              </div>
              
              {/* Allocation Legend */}
              <div className="md:w-1/2">
                <h3 className="text-xl font-light text-white mb-4">Token Allocation</h3>
                <div className="space-y-4">
                  {tokenData.allocation.map((item) => (
                    <div 
                      key={item.name}
                      className={`flex items-center transition-all duration-300 ${hoverSection === item.name ? 'scale-105' : ''}`}
                      onMouseEnter={() => setHoverSection(item.name)}
                      onMouseLeave={() => setHoverSection(null)}
                    >
                      <div 
                        className="w-4 h-4 rounded-sm mr-3" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white">{item.name}</span>
                          <span className="text-[#8aa0ff]">{item.percentage}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 mt-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-[#8aa0ff]/70 text-sm mt-6">
                  The BSN token allocation is designed to prioritize community rewards, ensuring that the majority of tokens flow to active platform participants.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vesting Schedule Tab */}
        <div 
          className={`max-w-4xl mx-auto transition-all duration-700 ${
            activeTab === 'vesting' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10 absolute pointer-events-none'
          }`}
          style={{ position: activeTab === 'vesting' ? 'relative' : 'absolute' }}
        >
          <div className="bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg p-8">
            <h3 className="text-xl font-light text-white mb-6">Vesting Schedule</h3>
            
            <div className="space-y-6">
              {tokenData.vesting.map((item, index) => (
                <div 
                  key={index}
                  className="border-b border-[#00a2ff]/10 pb-4 last:border-0"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center mb-2 md:mb-0">
                      <div 
                        className="w-3 h-3 rounded-sm mr-3"
                        style={{ backgroundColor: tokenData.allocation[index].color }}
                      ></div>
                      <h4 className="text-white">{item.category}</h4>
                    </div>
                    <div className="text-[#8aa0ff]/90 text-sm">
                      {item.schedule}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <h4 className="text-white mb-4">Circulating Supply Timeline</h4>
              <div className="h-10 bg-[#06071F]/80 border border-[#00a2ff]/10 rounded-lg overflow-hidden relative">
                {/* Timeline markers */}
                <div className="absolute inset-0 flex">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-1 border-r last:border-0 border-[#00a2ff]/10 relative">
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-[#8aa0ff]/70">
                        {`${i * 6}`}m
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Supply growth visualization */}
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00a2ff]/40 to-[#00a2ff]/10" style={{ width: '28%' }}></div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <span className="text-xs text-white">Current: 28% of total supply</span>
                </div>
              </div>
              <p className="text-[#8aa0ff]/70 text-sm mt-4">
                The vesting schedule is designed to ensure long-term alignment of all stakeholders while maintaining a healthy circulating supply.
              </p>
            </div>
          </div>
        </div>
        
        {/* Token Utility Tab */}
        <div 
          className={`max-w-4xl mx-auto transition-all duration-700 ${
            activeTab === 'utility' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10 absolute pointer-events-none'
          }`}
          style={{ position: activeTab === 'utility' ? 'relative' : 'absolute' }}
        >
          <div className="bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg p-8">
            <h3 className="text-xl font-light text-white mb-6">Token Utility</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tokenData.utility.map((item, index) => (
                <div 
                  key={index}
                  className="bg-[#06071F]/70 border border-[#00a2ff]/10 rounded-lg p-6 transition-all duration-300 hover:border-[#00a2ff]/30 hover:bg-[#06071F]/90"
                  onMouseEnter={() => setHoverSection(`utility-${index}`)}
                  onMouseLeave={() => setHoverSection(null)}
                >
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{item.icon}</div>
                    <h4 className="text-white text-lg">{item.title}</h4>
                  </div>
                  <p className="text-[#8aa0ff]/90 text-sm">
                    {item.description}
                  </p>
                  <div 
                    className="h-1 w-0 bg-gradient-to-r from-[#00a2ff] to-transparent mt-4 transition-all duration-500"
                    style={{ width: hoverSection === `utility-${index}` ? '100%' : '0%' }}
                  ></div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-[#00a2ff]/10 border border-[#00a2ff]/20 rounded-lg">
              <div className="flex items-start">
                <div className="text-xl mr-3">💡</div>
                <p className="text-[#8aa0ff] text-sm">
                  <strong className="text-white">Deflationary Mechanism:</strong> 50% of all transaction fees are automatically burned, reducing the total supply over time and creating deflationary pressure on the token.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className={`mt-16 text-center ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-900`}>
          <div className="bg-[#06071F]/70 backdrop-blur-sm border border-[#00a2ff]/20 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-light mb-4 text-white">Ready to Join the BSN Economy?</h3>
            <p className="text-[#8aa0ff]/80 mb-6">
              Participate in our token ecosystem and be part of the future of decentralized social networking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="#" 
                className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white px-8 py-3 rounded-full text-sm font-medium tracking-wider transition-all duration-300 shadow-lg shadow-[#00a2ff]/20 hover:shadow-[#00a2ff]/40 transform hover:translate-y-[-2px]"
              >
                Join Token Waitlist
              </a>
              <a 
                href="#" 
                className="border border-[#00a2ff]/30 hover:border-[#00a2ff] text-white px-8 py-3 rounded-full text-sm font-medium tracking-wider transition-all duration-300 hover:bg-[#00a2ff]/10"
              >
                Read Whitepaper
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className={`absolute left-8 top-1/2 z-10 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-600`}>
          <div className="h-40 w-px bg-gradient-to-b from-transparent via-[#00a2ff]/20 to-white/10"></div>
        </div>
        
        <div className={`absolute right-8 bottom-20 z-10 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-900`}>
          <div className="h-40 w-px bg-gradient-to-b from-transparent via-white/20 to-[#00a2ff]/20"></div>
        </div>
      </div>
    </section>
  );
};

export default Tokenomics; 