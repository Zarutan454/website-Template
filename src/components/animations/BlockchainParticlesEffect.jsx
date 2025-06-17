import React, { useRef, useEffect } from 'react';

const BlockchainParticlesEffect = ({ particleCount = 30, connectionCount = 10 }) => {
  const particlesRef = useRef(null);
  const connectionsRef = useRef(null);

  useEffect(() => {
    if (!particlesRef.current || !connectionsRef.current) return;

    // Clear previous particles
    while (particlesRef.current.firstChild) {
      particlesRef.current.removeChild(particlesRef.current.firstChild);
    }

    // Clear previous connections
    while (connectionsRef.current.firstChild) {
      connectionsRef.current.removeChild(connectionsRef.current.firstChild);
    }

    // Create particles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = "absolute w-2 h-2 bg-[#00a2ff]/30 rounded-full animate-float-slow";
      
      // Random position
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      particle.style.top = `${top}%`;
      particle.style.left = `${left}%`;
      
      // Random animation duration and delay
      particle.style.animationDuration = `${6 + Math.random() * 4}s`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      
      particlesRef.current.appendChild(particle);
      particles.push({ element: particle, top, left });
    }

    // Create connections between particles
    for (let i = 0; i < connectionCount; i++) {
      const connection = document.createElement('div');
      connection.className = "absolute h-px bg-gradient-to-r from-transparent via-[#00a2ff]/20 to-transparent";
      
      // Random position
      connection.style.top = `${20 + Math.random() * 60}%`;
      connection.style.left = '0';
      connection.style.right = '0';
      connection.style.width = '100%';
      
      // Random rotation
      connection.style.transform = `rotate(${-30 + Math.random() * 60}deg)`;
      
      // Random opacity
      connection.style.opacity = 0.2 + Math.random() * 0.3;
      
      connectionsRef.current.appendChild(connection);
    }

    // Create connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        // Only connect particles that are close to each other
        const p1 = particles[i];
        const p2 = particles[j];
        
        const distance = Math.sqrt(
          Math.pow(p1.top - p2.top, 2) + 
          Math.pow(p1.left - p2.left, 2)
        );
        
        if (distance < 30) { // Only connect if they're close enough
          const connection = document.createElement('div');
          connection.className = "absolute h-px bg-[#00a2ff]/10";
          
          // Position and rotate to connect the two particles
          const top1 = p1.top;
          const left1 = p1.left;
          const top2 = p2.top;
          const left2 = p2.left;
          
          const angle = Math.atan2(top2 - top1, left2 - left1) * 180 / Math.PI;
          const length = Math.sqrt(
            Math.pow(top2 - top1, 2) + 
            Math.pow(left2 - left1, 2)
          );
          
          connection.style.top = `${top1}%`;
          connection.style.left = `${left1}%`;
          connection.style.width = `${length}%`;
          connection.style.transformOrigin = 'left center';
          connection.style.transform = `rotate(${angle}deg)`;
          
          // Add animation
          connection.style.animation = 'pulse-line 3s infinite';
          
          connectionsRef.current.appendChild(connection);
        }
      }
    }

    return () => {
      // Cleanup
      if (particlesRef.current) {
        while (particlesRef.current.firstChild) {
          particlesRef.current.removeChild(particlesRef.current.firstChild);
        }
      }
      
      if (connectionsRef.current) {
        while (connectionsRef.current.firstChild) {
          connectionsRef.current.removeChild(connectionsRef.current.firstChild);
        }
      }
    };
  }, [particleCount, connectionCount]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden"></div>
      <div ref={connectionsRef} className="absolute inset-0 overflow-hidden"></div>
    </div>
  );
};

export default BlockchainParticlesEffect; 