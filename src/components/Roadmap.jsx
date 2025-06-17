import { useState, useEffect, useRef } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const Roadmap = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [activePhase, setActivePhase] = useState('phase3');
  const [hoverPhase, setHoverPhase] = useState(null);
  
  // Roadmap data
  const roadmapData = [
    {
      id: 'phase1',
      title: 'Phase 1: Foundation',
      subtitle: 'Q4 2023',
      status: 'completed',
      description: 'Establishing the core blockchain infrastructure and protocol design.',
      milestones: [
        { title: 'Whitepaper Release', status: 'completed' },
        { title: 'Core Development Team Formation', status: 'completed' },
        { title: 'Initial Blockchain Architecture Design', status: 'completed' },
        { title: 'Smart Contract Development', status: 'completed' },
        { title: 'Security Audit - Round 1', status: 'completed' }
      ]
    },
    {
      id: 'phase2',
      title: 'Phase 2: Alpha Testing',
      subtitle: 'Q1 2024',
      status: 'completed',
      description: 'Private alpha testing with a limited group of early adopters.',
      milestones: [
        { title: 'Private Testnet Launch', status: 'completed' },
        { title: 'Alpha Web Interface', status: 'completed' },
        { title: 'Core Features Implementation', status: 'completed' },
        { title: 'Initial Tokenomics Model', status: 'completed' },
        { title: 'Community Building', status: 'completed' }
      ]
    },
    {
      id: 'phase3',
      title: 'Phase 3: Beta Release',
      subtitle: 'Q2 2024',
      status: 'in-progress',
      description: 'Public beta release with expanded features and community growth.',
      milestones: [
        { title: 'Public Testnet Launch', status: 'completed' },
        { title: 'Mobile App Development', status: 'completed' },
        { title: 'Enhanced Security Features', status: 'in-progress' },
        { title: 'Governance Framework', status: 'in-progress' },
        { title: 'Security Audit - Round 2', status: 'planned' }
      ]
    },
    {
      id: 'phase4',
      title: 'Phase 4: Token Launch',
      subtitle: 'Q3 2024',
      status: 'planned',
      description: 'Official token launch and mainnet preparation.',
      milestones: [
        { title: 'Token Generation Event', status: 'planned' },
        { title: 'Exchange Listings', status: 'planned' },
        { title: 'Staking Mechanism Launch', status: 'planned' },
        { title: 'DAO Governance Activation', status: 'planned' },
        { title: 'Security Audit - Final Round', status: 'planned' }
      ]
    },
    {
      id: 'phase5',
      title: 'Phase 5: Mainnet Launch',
      subtitle: 'Q4 2024',
      status: 'planned',
      description: 'Full platform launch with complete feature set.',
      milestones: [
        { title: 'Mainnet Deployment', status: 'planned' },
        { title: 'Full Feature Release', status: 'planned' },
        { title: 'Cross-Chain Interoperability', status: 'planned' },
        { title: 'Partner Integrations', status: 'planned' },
        { title: 'Global Marketing Campaign', status: 'planned' }
      ]
    },
    {
      id: 'phase6',
      title: 'Phase 6: Ecosystem Expansion',
      subtitle: '2025',
      status: 'planned',
      description: 'Expanding the ecosystem with developer tools and partnerships.',
      milestones: [
        { title: 'Developer SDK Release', status: 'planned' },
        { title: 'Third-Party App Marketplace', status: 'planned' },
        { title: 'Enterprise Solutions', status: 'planned' },
        { title: 'Global Adoption Initiatives', status: 'planned' },
        { title: 'Advanced AI Features Integration', status: 'planned' }
      ]
    }
  ];
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
    
    // Find the current active phase based on status
    const currentPhase = roadmapData.find(phase => phase.status === 'in-progress');
    if (currentPhase) {
      setActivePhase(currentPhase.id);
    }
  }, [isInView, animationStarted]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-400';
      case 'in-progress':
        return 'bg-[#00a2ff]';
      default:
        return 'bg-white/30';
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 bg-black overflow-hidden"
    >
      {/* Decorative blockchain elements */}
      <div className="absolute inset-0 blockchain-grid opacity-10"></div>
      <div className="absolute top-0 left-1/3 w-64 h-64 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      
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
                Development Roadmap
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
            </span>
          </h2>
          <p className="text-[#a0e4ff]/70 max-w-2xl mx-auto text-lg">
            Our journey to building the future of decentralized social networking
          </p>
        </div>
        
        {/* Phase Navigation */}
        <div className={`mb-12 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-500`}>
          <div className="flex flex-wrap justify-center gap-4">
            {roadmapData.map((phase) => (
              <button
                key={phase.id}
                className={`relative px-4 py-2 text-sm md:text-base transition-all duration-300 rounded-full border ${
                  activePhase === phase.id 
                    ? 'bg-[#00a2ff]/20 border-[#00a2ff]/50 text-[#00a2ff]' 
                    : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                }`}
                onClick={() => setActivePhase(phase.id)}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(phase.status)} mr-2`}></div>
                  <span>{phase.title.split(':')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Timeline Visualization */}
        <div className={`relative max-w-5xl mx-auto mb-16 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-700`}>
          {/* Timeline line */}
          <div className="absolute left-0 right-0 top-4 h-1 bg-white/10"></div>
          
          {/* Timeline nodes */}
          <div className="flex justify-between relative">
            {roadmapData.map((phase, index) => (
              <div 
                key={phase.id}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoverPhase(phase.id)}
                onMouseLeave={() => setHoverPhase(null)}
              >
                {/* Node */}
                <div 
                  className={`w-8 h-8 rounded-full border-2 z-10 transition-all duration-300 flex items-center justify-center ${
                    activePhase === phase.id || hoverPhase === phase.id
                      ? 'border-[#00a2ff] bg-[#00a2ff]/20 scale-125'
                      : phase.status === 'completed'
                        ? 'border-green-400 bg-green-400/20'
                        : phase.status === 'in-progress'
                          ? 'border-[#00a2ff] bg-[#00a2ff]/10'
                          : 'border-white/30 bg-black'
                  }`}
                >
                  {phase.status === 'completed' && (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                  {phase.status === 'in-progress' && (
                    <div className="w-2 h-2 bg-[#00a2ff] rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {/* Progress line */}
                {index < roadmapData.length - 1 && (
                  <div 
                    className={`absolute top-4 h-1 transition-all duration-700 ${
                      phase.status === 'completed' 
                        ? 'bg-gradient-to-r from-green-400 to-[#00a2ff]' 
                        : 'bg-white/10'
                    }`}
                    style={{ 
                      left: '50%', 
                      width: '100%',
                      zIndex: 0
                    }}
                  ></div>
                )}
                
                {/* Label */}
                <div className={`absolute -bottom-8 text-xs whitespace-nowrap transition-all duration-300 ${
                  activePhase === phase.id || hoverPhase === phase.id
                    ? 'text-[#00a2ff]'
                    : 'text-white/50'
                }`}>
                  {phase.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Phase Details */}
        {roadmapData.map((phase) => (
          <div
            key={phase.id}
            className={`max-w-4xl mx-auto transition-all duration-700 ${
              activePhase === phase.id 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10 absolute pointer-events-none'
            }`}
            style={{ position: activePhase === phase.id ? 'relative' : 'absolute' }}
          >
            <div className="bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-light text-white mb-2">{phase.title}</h3>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(phase.status)} mr-2`}></div>
                    <span className="text-[#8aa0ff]/80 text-sm">
                      {phase.status === 'completed' ? 'Completed' : phase.status === 'in-progress' ? 'In Progress' : 'Planned'}
                    </span>
                    <span className="mx-2 text-white/30">•</span>
                    <span className="text-[#8aa0ff]/80 text-sm">{phase.subtitle}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  {phase.status === 'completed' ? (
                    <div className="bg-green-400/20 border border-green-400/30 text-green-400 px-4 py-1 rounded-full text-xs">
                      COMPLETED
                    </div>
                  ) : phase.status === 'in-progress' ? (
                    <div className="bg-[#00a2ff]/20 border border-[#00a2ff]/30 text-[#00a2ff] px-4 py-1 rounded-full text-xs">
                      IN PROGRESS
                    </div>
                  ) : (
                    <div className="bg-white/10 border border-white/20 text-white/70 px-4 py-1 rounded-full text-xs">
                      PLANNED
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-[#8aa0ff]/90 mb-8">{phase.description}</p>
              
              {/* Milestones */}
              <div className="space-y-4">
                <h4 className="text-white text-lg font-light mb-4">Key Milestones</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.milestones.map((milestone, index) => (
                    <div 
                      key={index}
                      className="flex items-center bg-[#06071F]/70 border border-[#00a2ff]/5 rounded-lg p-4 transition-all duration-300 hover:border-[#00a2ff]/20"
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-3 ${
                        milestone.status === 'completed'
                          ? 'bg-green-400/20'
                          : milestone.status === 'in-progress'
                            ? 'bg-[#00a2ff]/20'
                            : 'bg-white/10'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        ) : milestone.status === 'in-progress' ? (
                          <div className="w-1.5 h-1.5 bg-[#00a2ff] rounded-full animate-pulse"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                        )}
                      </div>
                      <span className={`text-sm ${
                        milestone.status === 'completed'
                          ? 'text-white'
                          : milestone.status === 'in-progress'
                            ? 'text-[#00a2ff]/90'
                            : 'text-white/70'
                      }`}>
                        {milestone.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Current Progress Summary */}
        <div className={`mt-16 text-center ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-900`}>
          <div className="bg-[#06071F]/70 backdrop-blur-sm border border-[#00a2ff]/20 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-light mb-4 text-white">Current Development Progress</h3>
            <div className="mb-6">
              <div className="flex justify-between text-xs text-white/70 mb-2">
                <span>Phase 1</span>
                <span>Phase 6</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-[#00a2ff] rounded-full"
                  style={{ width: '45%' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-white/70 mt-2">
                <span>Foundation</span>
                <span>Ecosystem Expansion</span>
              </div>
            </div>
            <p className="text-[#8aa0ff]/80 mb-6">
              We are currently in Phase 3 (Beta Release) with 45% of our roadmap completed. Join us on this exciting journey as we revolutionize social networking with blockchain technology.
            </p>
            <a 
              href="#" 
              className="inline-block bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white px-8 py-3 rounded-full text-sm font-medium tracking-wider transition-all duration-300 shadow-lg shadow-[#00a2ff]/20 hover:shadow-[#00a2ff]/40 transform hover:translate-y-[-2px]"
            >
              Join Beta Program
            </a>
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

export default Roadmap; 