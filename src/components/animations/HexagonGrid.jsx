import React, { useRef, useEffect } from 'react';
import useIntersectionObserver from '../../utils/useIntersectionObserver';

const HexagonGrid = ({
  columns = 10,
  rows = 10,
  size = 30,
  gap = 5,
  color = '#00a2ff',
  pulseDelay = 150,
  opacity = 0.3,
  rotationSpeed = 0.5
}) => {
  const containerRef = useRef(null);
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: false
  });

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    // Clear previous hexagons
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Calculate hexagon dimensions
    const width = size;
    const height = size * 0.866; // height of a hexagon is approximately 0.866 times its width
    const horizontalSpacing = width + gap;
    const verticalSpacing = height + gap;

    // Create hexagons
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const hexagon = document.createElement('div');
        
        // Position with offset for every other row
        const offsetX = row % 2 === 0 ? 0 : width / 2;
        const x = col * horizontalSpacing + offsetX;
        const y = row * verticalSpacing;
        
        // Style the hexagon
        hexagon.className = 'absolute';
        hexagon.style.width = `${width}px`;
        hexagon.style.height = `${width}px`;
        hexagon.style.left = `${x}px`;
        hexagon.style.top = `${y}px`;
        hexagon.style.transformOrigin = 'center';
        
        // Create the inner hexagon with clip-path
        const inner = document.createElement('div');
        inner.className = 'w-full h-full';
        inner.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        inner.style.backgroundColor = color;
        inner.style.opacity = opacity;
        
        // Add animation
        const animationDelay = (row * columns + col) * pulseDelay;
        inner.style.animation = `pulse ${2 + Math.random()}s infinite alternate, rotate ${20 / rotationSpeed}s linear infinite`;
        inner.style.animationDelay = `${animationDelay}ms, ${Math.random() * 5}s`;
        
        // Add border
        const border = document.createElement('div');
        border.className = 'absolute inset-0';
        border.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        border.style.border = `1px solid ${color}`;
        border.style.opacity = opacity * 0.5;
        
        // Assemble hexagon
        hexagon.appendChild(inner);
        hexagon.appendChild(border);
        containerRef.current.appendChild(hexagon);
      }
    }

    // Add CSS animations if they don't exist
    const styleId = 'hexagon-grid-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pulse {
          0% { opacity: ${opacity * 0.5}; transform: scale(0.95); }
          100% { opacity: ${opacity}; transform: scale(1); }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Cleanup
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [columns, rows, size, gap, color, pulseDelay, opacity, rotationSpeed, isVisible]);

  return (
    <div 
      ref={el => {
        containerRef.current = el;
        ref.current = el;
      }}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        opacity: isVisible ? 1 : 0, 
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  );
};

export default HexagonGrid; 