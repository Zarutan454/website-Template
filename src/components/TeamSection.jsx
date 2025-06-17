import { useState, useEffect, useRef } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const TeamSection = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredMember, setHoveredMember] = useState(null);
  
  // Team member data
  const teamMembers = [
    {
      id: 1,
      name: 'Alexander Schmidt',
      role: 'Founder & CEO',
      category: 'leadership',
      image: '/team/placeholder.svg', // Using placeholder image
      bio: 'Blockchain-Enthusiast seit 2013, ehemaliger CTO bei TechVentures GmbH mit über 15 Jahren Erfahrung in der Softwareentwicklung.',
      links: {
        linkedin: 'https://linkedin.com/',
        twitter: 'https://twitter.com/',
        github: 'https://github.com/'
      }
    },
    {
      id: 2,
      name: 'Sophia Weber',
      role: 'CTO',
      category: 'leadership',
      image: '/team/placeholder.svg', // Using placeholder image
      bio: 'Full-Stack Entwicklerin mit Fokus auf dezentrale Anwendungen. Zuvor Tech Lead bei Blockchain Solutions AG.',
      links: {
        linkedin: 'https://linkedin.com/',
        twitter: 'https://twitter.com/',
        github: 'https://github.com/'
      }
    },
    {
      id: 3,
      name: 'Michael Becker',
      role: 'Head of Blockchain',
      category: 'technology',
      image: '/team/placeholder.svg', // Using placeholder image
      bio: 'Smart Contract-Spezialist mit umfangreicher Erfahrung in Ethereum und Polygon. Ehemaliger Blockchain Developer bei CryptoTech.',
      links: {
        linkedin: 'https://linkedin.com/',
        github: 'https://github.com/'
      }
    },
    {
      id: 4,
      name: 'Laura Müller',
      role: 'UX/UI Designer',
      category: 'design',
      image: '/team/placeholder.svg', // Using placeholder image
      bio: 'Erfahrene UX/UI Designerin mit Schwerpunkt auf Web3-Anwendungen. Hat zuvor für namhafte Krypto-Projekte gearbeitet.',
      links: {
        linkedin: 'https://linkedin.com/',
        dribbble: 'https://dribbble.com/'
      }
    },
    {
      id: 5,
      name: 'Daniel Fischer',
      role: 'Backend Developer',
      category: 'technology',
      image: '/team/placeholder.svg', // Using placeholder image
      bio: 'Spezialist für skalierbare Backend-Systeme und Blockchain-Integration. 8+ Jahre Erfahrung in der Entwicklung.',
      links: {
        linkedin: 'https://linkedin.com/',
        github: 'https://github.com/'
      }
    },
    {
      id: 6,
      name: 'Julia Hoffmann',
      role: 'Marketing Director',
      category: 'business',
      image: '/team/placeholder.svg', // Using placeholder image
      bio: 'Erfahrene Marketing-Strategin mit Fokus auf Krypto- und Web3-Projekte. Zuvor bei einer führenden Blockchain-Marketing-Agentur.',
      links: {
        linkedin: 'https://linkedin.com/',
        twitter: 'https://twitter.com/'
      }
    },
    {
      id: 7,
      name: 'Thomas Schulz',
      role: 'Tokenomics Advisor',
      category: 'advisors',
      image: '/team/placeholder.svg', // Using placeholder image
      bio: 'Wirtschaftsmathematiker mit Spezialisierung auf Krypto-Ökonomie. Berater für mehrere erfolgreiche Token-Launches.',
      links: {
        linkedin: 'https://linkedin.com/'
      }
    },
    {
      id: 8,
      name: 'Nina Wagner',
      role: 'Community Manager',
      category: 'business',
      image: '/team/placeholder.svg', // Using placeholder image
      bio: 'Erfahrene Community Managerin mit Leidenschaft für den Aufbau engagierter Web3-Communities. Mehrsprachig und international vernetzt.',
      links: {
        linkedin: 'https://linkedin.com/',
        twitter: 'https://twitter.com/'
      }
    }
  ];
  
  // Categories for filtering
  const categories = [
    { id: 'all', label: 'Alle' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'technology', label: 'Technologie' },
    { id: 'design', label: 'Design' },
    { id: 'business', label: 'Business' },
    { id: 'advisors', label: 'Berater' }
  ];
  
  // Filter team members based on active category
  const filteredTeamMembers = activeCategory === 'all' 
    ? teamMembers 
    : teamMembers.filter(member => member.category === activeCategory);
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [isInView, animationStarted]);

  // Animation for category change
  const [categoryChangeAnimation, setCategoryChangeAnimation] = useState(false);
  
  useEffect(() => {
    setCategoryChangeAnimation(true);
    const timer = setTimeout(() => {
      setCategoryChangeAnimation(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [activeCategory]);

  return (
    <section 
      ref={ref}
      id="team"
      className="relative py-20 overflow-hidden"
    >
      {/* Decorative blockchain elements */}
      <div className="absolute inset-0 blockchain-grid opacity-10"></div>
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-[#00a2ff]/30 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
        
        {/* Hexagonal nodes */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`hex-${i}`}
            className="absolute hexagon border border-[#00a2ff]/20 animate-float-slow"
            style={{
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${8 + Math.random() * 7}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
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
                Unser Team
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
            </span>
          </h2>
          <p className="text-[#a0e4ff]/70 max-w-2xl mx-auto text-lg">
            Die Köpfe hinter dem BSN Blockchain Social Network
          </p>
        </div>
        
        {/* Category Filter */}
        <div className={`mb-12 overflow-x-auto pb-4 ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-500`}>
          <div className="flex space-x-4 md:justify-center min-w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id 
                    ? 'bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] shadow-lg shadow-[#00a2ff]/10' 
                    : 'bg-transparent border border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="relative">
                  {category.label}
                  {activeCategory === category.id && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#00a2ff] to-transparent"></span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Team Members Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${animationStarted ? 'opacity-100' : 'opacity-0'} transition-all duration-1000 delay-700`}>
          {filteredTeamMembers.map((member, index) => (
            <div 
              key={member.id}
              className={`bg-[#06071F]/70 backdrop-blur-lg border border-[#00a2ff]/20 rounded-lg overflow-hidden transition-all duration-500 hover:border-[#00a2ff]/50 hover:shadow-lg hover:shadow-[#00a2ff]/10 group ${categoryChangeAnimation ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
              style={{ 
                transitionDelay: `${categoryChangeAnimation ? '0ms' : 300 + (index * 100) + 'ms'}`,
                transform: animationStarted ? 'translateY(0)' : 'translateY(20px)'
              }}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {/* Member Image */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#06071F]/80 z-10"></div>
                <div 
                  className="h-full bg-[#00a2ff]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url(${member.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Fallback if image fails to load */}
                  <div className="text-[#00a2ff] text-6xl opacity-20">{member.name.charAt(0)}</div>
                </div>
                
                {/* Animated glow effect on hover */}
                {hoveredMember === member.id && (
                  <div className="absolute inset-0 bg-[#00a2ff]/5 z-5 animate-pulse-glow"></div>
                )}
                
                {/* Member role tag */}
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="px-3 py-1 bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] text-xs tracking-wider rounded-full group-hover:bg-[#00a2ff]/30 transition-all duration-300">
                    {member.role}
                  </span>
                </div>
                
                {/* Animated connection lines on hover */}
                {hoveredMember === member.id && (
                  <>
                    <div className="absolute top-1/4 left-0 w-8 h-[1px] bg-gradient-to-r from-transparent to-[#00a2ff]/50 animate-expand-right"></div>
                    <div className="absolute top-3/4 right-0 w-8 h-[1px] bg-gradient-to-l from-transparent to-[#00a2ff]/50 animate-expand-left"></div>
                  </>
                )}
              </div>
              
              {/* Member Info */}
              <div className="p-6">
                <h3 className="text-xl font-light text-white mb-2 group-hover:text-[#00a2ff] transition-colors duration-300">{member.name}</h3>
                <p className="text-[#8aa0ff]/80 text-sm mb-4">{member.bio}</p>
                
                {/* Social Links with animated hover effect */}
                <div className="flex space-x-3">
                  {member.links.linkedin && (
                    <a 
                      href={member.links.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-white/50 hover:text-[#00a2ff] transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  
                  {member.links.twitter && (
                    <a 
                      href={member.links.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-white/50 hover:text-[#00a2ff] transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  
                  {member.links.github && (
                    <a 
                      href={member.links.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-white/50 hover:text-[#00a2ff] transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                      </svg>
                    </a>
                  )}
                  
                  {member.links.dribbble && (
                    <a 
                      href={member.links.dribbble} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-white/50 hover:text-[#00a2ff] transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Join the Team CTA */}
        <div className={`mt-16 text-center ${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-1000`}>
          <div className="bg-[#06071F]/70 backdrop-blur-lg border border-[#00a2ff]/20 rounded-lg p-8 max-w-2xl mx-auto relative overflow-hidden group hover:border-[#00a2ff]/40 transition-all duration-500">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00a2ff]/0 via-[#00a2ff]/5 to-[#00a2ff]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
            
            <h3 className="text-2xl font-light text-white mb-4">Werde Teil des Teams</h3>
            <p className="text-[#8aa0ff]/80 mb-6">
              Wir suchen leidenschaftliche Talente, die mit uns die Zukunft des dezentralen Social Networkings gestalten wollen.
            </p>
            <a 
              href="#careers" 
              className="inline-flex items-center bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white px-6 py-3 rounded-full text-sm font-medium tracking-wider transition-all duration-300 shadow-lg shadow-[#00a2ff]/20 hover:shadow-[#00a2ff]/40 transform hover:-translate-y-1 relative overflow-hidden"
            >
              <span className="relative z-10">Offene Positionen ansehen</span>
              
              {/* Button animation effect */}
              <span className="absolute inset-0 w-full h-full bg-white/10 transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left"></span>
              
              {/* Particle effects on hover */}
              <span className="absolute top-0 left-0 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDuration: '1s', animationDelay: '0.2s' }}></span>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDuration: '1s', animationDelay: '0.5s' }}></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection; 