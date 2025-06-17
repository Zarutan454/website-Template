// Blockchain particles component (DOM-based implementation)
export const BlockchainParticles = (container, count = 15) => {
  if (typeof document === 'undefined') return;
  
  // Clear any existing particles
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = "absolute w-2 h-2 bg-[#00a2ff]/30 rounded-full animate-float-slow";
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${6 + Math.random() * 4}s`;
    particle.style.animationDelay = `${Math.random() * 2}s`;
    container.appendChild(particle);
  }
};

// Blockchain connections component (DOM-based implementation)
export const BlockchainConnections = (container, count = 6) => {
  if (typeof document === 'undefined') return;
  
  // Clear any existing connections
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  for (let i = 0; i < count; i++) {
    const connection = document.createElement('div');
    connection.className = "absolute h-px bg-gradient-to-r from-transparent via-[#00a2ff]/20 to-transparent";
    connection.style.top = `${20 + Math.random() * 60}%`;
    connection.style.left = '0';
    connection.style.right = '0';
    connection.style.width = '100%';
    connection.style.transform = `rotate(${-30 + Math.random() * 60}deg)`;
    connection.style.opacity = 0.2 + Math.random() * 0.3;
    container.appendChild(connection);
  }
};

// Function to add extended animations to the page
export const addExtendedAnimations = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes pulse-border {
      0%, 100% { border-color: rgba(0, 162, 255, 0.2); }
      50% { border-color: rgba(0, 162, 255, 0.5); }
    }
    
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes spin-slow-faster {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes spin-slow-reverse {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    
    @keyframes spin-slow-reverse-faster {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes float-slow {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-8px) rotate(1deg); }
      75% { transform: translateY(8px) rotate(-1deg); }
    }
    
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
    
    .animate-pulse-border {
      animation: pulse-border 2s infinite;
    }
    
    .animate-spin-slow {
      animation: spin-slow 20s linear infinite;
    }
    
    .animate-spin-slow-faster {
      animation: spin-slow-faster 15s linear infinite;
    }
    
    .animate-spin-slow-reverse {
      animation: spin-slow-reverse 25s linear infinite;
    }
    
    .animate-spin-slow-reverse-faster {
      animation: spin-slow-reverse-faster 18s linear infinite;
    }
    
    .animate-float {
      animation: float 4s ease-in-out infinite;
    }
    
    .animate-float-slow {
      animation: float-slow 8s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
};

// Helper function to create animated sections
export const createAnimatedSection = (container, options = {}) => {
  const { delay = 0, threshold = 0.1 } = options;
  
  if (typeof window === 'undefined' || !container) return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold }
  );
  
  // Set initial styles
  container.style.opacity = '0';
  container.style.transform = 'translateY(20px)';
  container.style.transition = `all 1000ms ease`;
  container.style.transitionDelay = `${delay}ms`;
  
  observer.observe(container);
  
  return {
    cleanup: () => {
      observer.unobserve(container);
    }
  };
};

export default {
  BlockchainParticles,
  BlockchainConnections,
  addExtendedAnimations,
  createAnimatedSection
}; 