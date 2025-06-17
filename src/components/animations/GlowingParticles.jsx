import React, { useRef, useEffect, useState } from 'react';
import useIntersectionObserver from '../../utils/useIntersectionObserver';

const GlowingParticles = ({
  particleCount = 20,
  minSize = 2,
  maxSize = 8,
  minSpeed = 0.2,
  maxSpeed = 0.8,
  color = '#00a2ff',
  baseOpacity = 0.4,
  glowIntensity = 10,
  trails = false
}) => {
  const containerRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: false
  });
  
  // Initialize particles
  useEffect(() => {
    if (!isVisible) return;
    
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: minSize + Math.random() * (maxSize - minSize),
        speedX: (minSpeed + Math.random() * (maxSpeed - minSpeed)) * (Math.random() > 0.5 ? 1 : -1),
        speedY: (minSpeed + Math.random() * (maxSpeed - minSpeed)) * (Math.random() > 0.5 ? 1 : -1),
        opacity: baseOpacity * (0.5 + Math.random() * 0.5),
        trail: []
      });
    }
    
    setParticles(newParticles);
  }, [particleCount, minSize, maxSize, minSpeed, maxSpeed, baseOpacity, isVisible]);
  
  // Animate particles
  useEffect(() => {
    if (!isVisible || particles.length === 0) return;
    
    const animationFrame = requestAnimationFrame(() => {
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Calculate new position
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;
          
          // Bounce off edges
          if (newX <= 0 || newX >= 100) {
            particle.speedX *= -1;
            newX = Math.max(0, Math.min(100, newX));
          }
          
          if (newY <= 0 || newY >= 100) {
            particle.speedY *= -1;
            newY = Math.max(0, Math.min(100, newY));
          }
          
          // Update trail if enabled
          let trail = particle.trail;
          if (trails) {
            trail = [...trail, { x: particle.x, y: particle.y }];
            if (trail.length > 5) {
              trail = trail.slice(-5);
            }
          }
          
          return {
            ...particle,
            x: newX,
            y: newY,
            trail
          };
        });
      });
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [particles, isVisible, trails]);
  
  return (
    <div 
      ref={el => {
        containerRef.current = el;
        ref.current = el;
      }} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
    >
      {particles.map(particle => (
        <React.Fragment key={particle.id}>
          {/* Particle trails */}
          {trails && particle.trail.map((point, i) => (
            <div
              key={`trail-${particle.id}-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: `${particle.size * (i / particle.trail.length) * 0.8}px`,
                height: `${particle.size * (i / particle.trail.length) * 0.8}px`,
                backgroundColor: color,
                opacity: particle.opacity * (i / particle.trail.length) * 0.5,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* Main particle */}
          <div 
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: color,
              opacity: particle.opacity,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${glowIntensity}px ${color}`,
              transition: 'box-shadow 0.3s ease-in-out'
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default GlowingParticles; 