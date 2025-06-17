import React, { useRef, useEffect, useState } from 'react';
import useIntersectionObserver from '../../utils/useIntersectionObserver';

const DataFlowAnimation = ({ 
  nodeCount = 8, 
  packetCount = 3,
  color = '#00a2ff',
  speed = 1,
  opacity = 0.6,
  showLabels = false
}) => {
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: false
  });

  // Generate random nodes
  useEffect(() => {
    if (!isVisible) return;
    
    const newNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({
        id: i,
        x: 10 + Math.random() * 80, // Keep away from edges
        y: 10 + Math.random() * 80,
        size: 4 + Math.random() * 4,
        label: `Node ${i+1}`,
        connections: []
      });
    }
    
    // Create connections between nodes
    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i];
      const possibleConnections = [...newNodes];
      possibleConnections.splice(i, 1); // Remove self
      
      // Shuffle and take 2-4 connections
      const shuffled = possibleConnections.sort(() => 0.5 - Math.random());
      const connectionCount = 2 + Math.floor(Math.random() * 3);
      const connections = shuffled.slice(0, connectionCount);
      
      node.connections = connections.map(conn => ({
        target: conn.id,
        packets: Array.from({ length: packetCount }).map((_, i) => ({
          id: `${node.id}-${conn.id}-${i}`,
          position: Math.random(),
          speed: 0.3 + Math.random() * 0.7 * speed,
          size: 1 + Math.random() * 1.5
        }))
      }));
    }
    
    setNodes(newNodes);
  }, [nodeCount, packetCount, speed, isVisible]);

  // Animate packets
  useEffect(() => {
    if (!isVisible || nodes.length === 0) return;
    
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        return prevNodes.map(node => ({
          ...node,
          connections: node.connections.map(conn => ({
            ...conn,
            packets: conn.packets.map(packet => ({
              ...packet,
              position: (packet.position + packet.speed / 100) % 1
            }))
          }))
        }));
      });
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [nodes, isVisible]);

  return (
    <div 
      ref={el => {
        containerRef.current = el;
        ref.current = el;
      }} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
    >
      {/* Nodes */}
      {nodes.map(node => (
        <React.Fragment key={`node-${node.id}`}>
          {/* Node */}
          <div 
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              backgroundColor: `${color}`,
              opacity: opacity,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-full animate-pulse-glow"
              style={{
                boxShadow: `0 0 10px ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
              }}
            ></div>
            
            {/* Node label */}
            {showLabels && (
              <div 
                className="absolute whitespace-nowrap text-xs"
                style={{
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: `${color}`,
                  opacity: opacity * 0.8
                }}
              >
                {node.label}
              </div>
            )}
          </div>
          
          {/* Connections and packets */}
          {node.connections.map(conn => {
            const targetNode = nodes.find(n => n.id === conn.target);
            if (!targetNode) return null;
            
            // Calculate connection line properties
            const x1 = node.x;
            const y1 = node.y;
            const x2 = targetNode.x;
            const y2 = targetNode.y;
            
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            const distance = Math.sqrt(
              Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
            );
            
            return (
              <React.Fragment key={`conn-${node.id}-${conn.target}`}>
                {/* Connection line */}
                <div 
                  className="absolute h-px"
                  style={{
                    left: `${x1}%`,
                    top: `${y1}%`,
                    width: `${distance}%`,
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg)`,
                    background: `linear-gradient(90deg, ${color}${Math.floor(opacity * 20).toString(16).padStart(2, '0')}, ${color}${Math.floor(opacity * 40).toString(16).padStart(2, '0')}, ${color}${Math.floor(opacity * 20).toString(16).padStart(2, '0')})`,
                  }}
                ></div>
                
                {/* Data packets */}
                {conn.packets.map(packet => (
                  <div
                    key={packet.id}
                    className="absolute rounded-full"
                    style={{
                      left: `${x1 + (x2 - x1) * packet.position}%`,
                      top: `${y1 + (y2 - y1) * packet.position}%`,
                      width: `${packet.size}px`,
                      height: `${packet.size}px`,
                      backgroundColor: color,
                      opacity: opacity * 0.8,
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></div>
                ))}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DataFlowAnimation; 