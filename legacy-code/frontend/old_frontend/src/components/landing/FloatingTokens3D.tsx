import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TokenData {
  symbol: string;
  color: string;
  glowColor: string;
  delay: number;
  scale?: number;
  svgPath?: string;
}

const tokens: TokenData[] = [
  { symbol: 'ETH', color: '#9ca3af', delay: 0, glowColor: '#9ca3af', scale: 1.2, svgPath: '/images/crypto/eth.svg' },
  { symbol: 'BNB', color: '#eab308', delay: 1, glowColor: '#eab308', scale: 1.1, svgPath: '/images/crypto/bnb.svg' },
  { symbol: 'BSN', color: '#e31c79', delay: 2, glowColor: '#e31c79', scale: 1.3, svgPath: '/images/crypto/bsn.svg' },
  { symbol: 'MATIC', color: '#a855f7', delay: 3, glowColor: '#a855f7', scale: 1.0, svgPath: '/images/crypto/matic.svg' },
  { symbol: 'AVAX', color: '#ef4444', delay: 4, glowColor: '#ef4444', scale: 1.2, svgPath: '/images/crypto/avax.svg' },
  { symbol: 'SOL', color: '#22c55e', delay: 5, glowColor: '#22c55e', scale: 1.1, svgPath: '/images/crypto/sol.svg' },
];

interface TokenProps {
  symbol: string;
  color: string;
  glowColor: string;
  delay: number;
  position: [number, number, number];
  scale?: number;
  svgPath?: string;
}

const Token: React.FC<TokenProps> = ({ symbol, color, glowColor, delay, position, scale = 1, svgPath }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  const rotationSpeed = useMemo(() => 0.3 + Math.random() * 0.5, []);
  const floatAmplitude = useMemo(() => 0.3 + Math.random() * 0.2, []);
  const floatFrequency = useMemo(() => 0.5 + Math.random() * 0.5, []);
  
  const createTextTexture = (): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    if (!context) return new THREE.Texture();
    
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColorBrightness(color, -30));
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    context.fillStyle = '#ffffff';
    context.font = 'bold 100px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(symbol, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const createSvgTexture = async (svgPath: string): Promise<THREE.Texture> => {
    try {
      const svgData = await fetch(svgPath).then(res => res.text());
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      if (!context) return new THREE.Texture();
      
      const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, adjustColorBrightness(color, -30));
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
      
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      return new Promise((resolve) => {
        img.onload = () => {
          context.drawImage(img, 64, 64, 384, 384);
          URL.revokeObjectURL(url);
          
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          resolve(texture);
        };
        img.src = url;
      });
    } catch (error) {
      return createTextTexture();
    }
  };
  
  const adjustColorBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };
  
  useEffect(() => {
    const loadTexture = async () => {
      if (svgPath) {
        const svgTexture = await createSvgTexture(svgPath);
        setTexture(svgTexture);
      } else {
        setTexture(createTextTexture());
      }
    };
    
    loadTexture();
  }, [svgPath, color, symbol]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin((state.clock.getElapsedTime() + delay) * floatFrequency) * floatAmplitude;
      
      meshRef.current.rotation.x = state.clock.getElapsedTime() * rotationSpeed * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * rotationSpeed;
      
      meshRef.current.position.x = position[0] + Math.sin((state.clock.getElapsedTime() + delay * 2) * 0.3) * 0.2;
      meshRef.current.position.z = position[2] + Math.cos((state.clock.getElapsedTime() + delay) * 0.4) * 0.2;
    }
    
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = 0.4 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
      }
      
      glowRef.current.scale.set(
        1.2 + Math.sin(state.clock.getElapsedTime()) * 0.1,
        1.2 + Math.sin(state.clock.getElapsedTime()) * 0.1,
        1.2 + Math.sin(state.clock.getElapsedTime()) * 0.1
      );
    }
  });
  
  if (!texture) return null;
  
  return (
    <group position={position}>
      {/* Glow sphere */}
      <mesh ref={glowRef} scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[0.5 * scale, 32, 32]} />
        <meshBasicMaterial 
          color={glowColor} 
          transparent={true} 
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Token coin */}
      <mesh ref={meshRef} scale={[scale, scale, scale * 0.2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial 
          map={texture}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

const FloatingTokens3D: React.FC = () => {
  const tokenPositions = useMemo<[number, number, number][]>(() => 
    tokens.map(() => [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 5 - 2 // Push tokens a bit back in z
    ]), 
  []);
  
  return (
    <group>
      {tokens.map((token, index) => (
        <Token
          key={token.symbol}
          symbol={token.symbol}
          color={token.color}
          glowColor={token.glowColor}
          delay={token.delay}
          position={tokenPositions[index]}
          scale={token.scale}
          svgPath={token.svgPath}
        />
      ))}
    </group>
  );
};

export default FloatingTokens3D;
