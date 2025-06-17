import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text, useTexture, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const WaveEffect = () => {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(viewport.width * 2, viewport.height * 2, 32, 32);
  }, [viewport]);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      const time = clock.getElapsedTime();
      const position = mesh.current.geometry.attributes.position;
      
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        
        const waveX = 0.3 * Math.sin(x * 0.5 + time * 0.7);
        const waveY = 0.2 * Math.sin(y * 0.5 + time * 0.7);
        
        position.setZ(i, waveX + waveY);
      }
      
      position.needsUpdate = true;
    }
  });
  
  return (
    <mesh ref={mesh} position={[0, 0, -10]} rotation={[0, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        color="#1a1a2e" 
        wireframe={true} 
        emissive="#e31c79"
        emissiveIntensity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const AnimatedText = ({ text, position, fontSize, color, glowColor, glowIntensity = 0.5 }) => {
  const textRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (textRef.current) {
      textRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });
  
  return (
    <group>
      {/* Glow effect */}
      <Text
        ref={textRef}
        position={position}
        fontSize={fontSize}
        color={glowColor}
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
        outlineWidth={0.05}
        outlineColor={glowColor}
      >
        {text}
      </Text>
      
      {/* Main text */}
      <Text
        position={position}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
      >
        {text}
      </Text>
    </group>
  );
};

const NetworkVisualization = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <WaveEffect />
      
      {/* 3D Text with Glow */}
      <AnimatedText 
        text="BSN" 
        position={[0, 2, 0]} 
        fontSize={1.5} 
        color="#ffffff" 
        glowColor="#e31c79" 
        glowIntensity={0.8} 
      />
      
      <AnimatedText 
        text="Blockchain Social Network" 
        position={[0, 0.5, 0]} 
        fontSize={0.5} 
        color="#e31c79" 
        glowColor="#e31c79" 
        glowIntensity={0.5} 
      />
    </group>
  );
};

const Hero3D: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-20 md:py-24 lg:py-28" id="home">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video 
          className="absolute w-full h-full object-cover"
          autoPlay 
          loop 
          muted 
          playsInline
          style={{ 
            filter: 'brightness(0.7) contrast(1.1)',
            transform: 'scale(1.05)'
          }}
        >
          <source src="/videos/hero-background-compressed.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-300/60 via-dark-200/40 to-dark-100/80 z-1"></div>
      </div>
      
      {/* Content Overlay */}
      <div className="container mx-auto px-4 relative z-10 mt-[30vh]">
        <div className="flex flex-col items-center text-center">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Future of Social Networking on Blockchain
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 max-w-3xl mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connect, create, and earn with BSN - the first decentralized social platform that rewards your activity with real crypto tokens.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/register" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-medium text-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 transform hover:-translate-y-1">
              Get Started
            </Link>
            <Link to="/login" className="px-8 py-3 bg-dark-200 border border-gray-700 rounded-full text-white font-medium text-lg hover:bg-dark-300 transition-all duration-300">
              Login
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <motion.div 
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <motion.div 
            className="w-1 h-2 bg-white rounded-full mt-2"
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero3D;
