import { useState, useEffect, useRef } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const FAQ = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [hoverQuestion, setHoverQuestion] = useState(null);
  
  // FAQ data
  const faqItems = [
    {
      id: 'what-is-bsn',
      question: 'What is BSN (Blockchain Social Network)?',
      answer: 'BSN is a decentralized social networking platform built on blockchain technology. It gives users complete ownership and control over their data, identity, and digital interactions. Unlike traditional social networks, BSN operates on a distributed network where no single entity has control over user data or content.'
    },
    {
      id: 'how-different',
      question: 'How is BSN different from traditional social networks?',
      answer: 'BSN differs from traditional social networks in several key ways: 1) Your data belongs to you, not a corporation; 2) Content cannot be censored by a central authority; 3) You earn tokens for your contributions and engagement; 4) Your privacy is protected through encryption and blockchain technology; 5) The platform is governed by its users through a decentralized autonomous organization (DAO).'
    },
    {
      id: 'token',
      question: 'What is the BSN token and how does it work?',
      answer: 'The BSN token is the native cryptocurrency of the Blockchain Social Network. It serves multiple purposes: governance voting rights, content monetization, access to premium features, staking rewards, and network transaction fees. Users can earn tokens through creating valuable content, engaging with the community, and participating in network governance.'
    },
    {
      id: 'security',
      question: 'How does BSN ensure data security and privacy?',
      answer: 'BSN employs multiple layers of security: end-to-end encryption for all communications, decentralized data storage across the network, self-sovereign identity verification, zero-knowledge proofs for private transactions, and cryptographic protection against attacks. Your data is stored across multiple nodes rather than on centralized servers, dramatically reducing the risk of data breaches.'
    },
    {
      id: 'join',
      question: 'How can I join the BSN platform?',
      answer: 'Currently, BSN is in its final development phase before public launch. You can join our waitlist to be among the first to access the platform when it launches. Early adopters will receive special benefits including bonus tokens, exclusive NFTs, and priority access to new features.'
    },
    {
      id: 'governance',
      question: 'How is the platform governed?',
      answer: 'BSN is governed by its community through a Decentralized Autonomous Organization (DAO). Token holders can propose and vote on platform changes, feature additions, token economics, and other important decisions. This ensures the platform evolves according to the needs and desires of its users rather than corporate interests.'
    },
    {
      id: 'monetize',
      question: 'Can I monetize my content on BSN?',
      answer: 'Yes, BSN provides multiple ways to monetize your content and social presence. You can earn tokens directly from other users who appreciate your content, receive automated rewards based on engagement metrics, create subscription-based content, mint and sell NFTs of your digital creations, and participate in the platform\'s advertising revenue sharing program.'
    },
    {
      id: 'technical',
      question: 'What blockchain technology does BSN use?',
      answer: 'BSN is built on a hybrid blockchain architecture that combines the best aspects of several technologies. The core platform uses a high-throughput, energy-efficient Proof-of-Stake consensus mechanism, with layer-2 solutions for scalability. BSN is also interoperable with major blockchains like Ethereum, Solana, and Polkadot, allowing for cross-chain functionality and asset transfers.'
    }
  ];
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [isInView, animationStarted]);
  
  const toggleQuestion = (id) => {
    if (activeQuestion === id) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(id);
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 bg-black overflow-hidden"
    >
      {/* Decorative blockchain elements */}
      <div className="absolute inset-0 blockchain-grid opacity-10"></div>
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      
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
                Frequently Asked Questions
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
            </span>
          </h2>
          <p className="text-[#a0e4ff]/70 max-w-2xl mx-auto text-lg">
            Everything you need to know about the Blockchain Social Network
          </p>
        </div>
        
        {/* FAQ Items */}
        <div className={`max-w-3xl mx-auto ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-500`}>
          <div className="space-y-6">
            {faqItems.map((item) => (
              <div 
                key={item.id}
                className={`bg-[#06071F]/50 backdrop-blur-sm border border-[#00a2ff]/10 rounded-lg overflow-hidden transition-all duration-300 ${
                  activeQuestion === item.id ? 'border-[#00a2ff]/30' : hoverQuestion === item.id ? 'border-[#00a2ff]/20' : ''
                }`}
                onMouseEnter={() => setHoverQuestion(item.id)}
                onMouseLeave={() => setHoverQuestion(null)}
              >
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => toggleQuestion(item.id)}
                  aria-expanded={activeQuestion === item.id}
                >
                  <span className="text-white font-light text-lg">{item.question}</span>
                  <div className={`w-6 h-6 flex items-center justify-center transition-transform duration-300 ${activeQuestion === item.id ? 'rotate-45' : ''}`}>
                    <div className="relative">
                      <span className="absolute inset-0 w-full h-0.5 bg-[#00a2ff] rounded-full"></span>
                      <span className={`absolute inset-0 w-0.5 h-full bg-[#00a2ff] rounded-full transition-opacity duration-300 ${activeQuestion === item.id ? 'opacity-100' : 'opacity-100'}`}></span>
                    </div>
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-500 ${
                    activeQuestion === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-[#8aa0ff]/90">
                    <div className="h-[1px] w-full bg-gradient-to-r from-[#00a2ff]/30 to-transparent mb-4"></div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Still Have Questions */}
        <div className={`mt-16 text-center ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-700`}>
          <div className="bg-[#06071F]/70 backdrop-blur-sm border border-[#00a2ff]/20 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-light mb-4 text-white">Still Have Questions?</h3>
            <p className="text-[#8aa0ff]/80 mb-6">
              Our team is ready to assist you with any additional questions you may have about the Blockchain Social Network.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="#" 
                className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white px-8 py-3 rounded-full text-sm font-medium tracking-wider transition-all duration-300 shadow-lg shadow-[#00a2ff]/20 hover:shadow-[#00a2ff]/40 transform hover:translate-y-[-2px]"
              >
                Contact Support
              </a>
              <a 
                href="#" 
                className="border border-[#00a2ff]/30 hover:border-[#00a2ff] text-white px-8 py-3 rounded-full text-sm font-medium tracking-wider transition-all duration-300 hover:bg-[#00a2ff]/10"
              >
                Join Community
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

export default FAQ; 