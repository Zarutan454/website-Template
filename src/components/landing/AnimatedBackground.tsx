
import React, { Suspense, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { PerspectiveCamera, Environment, useTexture, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

type ParticleFieldProps = Record<never, never>;

const ParticleField: React.FC<ParticleFieldProps> = () => {
  const particles = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  
  const colorArray = useMemo(() => {
    const colors = new Float32Array(5000 * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < 5000; i++) {
      const colorChoice = Math.random();
      if (colorChoice > 0.7) {
        color.set('#e31c79'); // Brand pink
      } else if (colorChoice > 0.4) {
        color.set('#ffffff'); // White
      } else if (colorChoice > 0.2) {
        color.set('#9945FF'); // Purple
      } else {
        color.set('#14F195'); // Teal
      }
      
      color.toArray(colors, i * 3);
    }
    
    return colors;
  }, []);
  
  const sizeArray = useMemo(() => {
    const sizes = new Float32Array(5000);
    
    for (let i = 0; i < 5000; i++) {
      sizes[i] = Math.random() * 0.1 + 0.03;
    }
    
    return sizes;
  }, []);
  
  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      particles.current.rotation.y = state.clock.getElapsedTime() * 0.075;
      
      particles.current.position.x = THREE.MathUtils.lerp(
        particles.current.position.x,
        mouse.x * 0.3,
        0.1
      );
      particles.current.position.y = THREE.MathUtils.lerp(
        particles.current.position.y,
        mouse.y * 0.3,
        0.1
      );
      
      const positions = (particles.current.geometry as THREE.BufferGeometry).attributes.position;
      const sizes = (particles.current.geometry as THREE.BufferGeometry).attributes.size;
      
      for (let i = 0; i < positions.count; i++) {
        sizes.array[i] = sizeArray[i] * (1 + 0.3 * Math.sin(state.clock.getElapsedTime() * 0.5 + i * 0.01));
      }
      
      sizes.needsUpdate = true;
    }
  });

  const particleCount = 5000;
  const positionArray = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i += 3) {
    positionArray[i] = (Math.random() - 0.5) * 20;
    positionArray[i + 1] = (Math.random() - 0.5) * 20;
    positionArray[i + 2] = (Math.random() - 0.5) * 20;
  }

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positionArray}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colorArray}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizeArray}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        vertexColors
        transparent 
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

type GridFloorProps = Record<never, never>;

const GridFloor: React.FC<GridFloorProps> = () => {
  const grid = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(40, 40, 32, 32);
  }, []);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#e31c79') },
        color2: { value: new THREE.Color('#9945FF') }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          
          float wave1 = sin(position.x * 0.5 + time * 0.7) * 0.5;
          float wave2 = sin(position.y * 0.5 + time * 0.7) * 0.5;
          
          vec3 newPosition = position;
          newPosition.z = wave1 + wave2;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          float mixFactor = sin(vUv.x * 3.14 + time * 0.5) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, mixFactor);
          
          float gridX = step(0.98, mod(vUv.x * 20.0, 1.0));
          float gridY = step(0.98, mod(vUv.y * 20.0, 1.0));
          float grid = gridX + gridY;
          
          color = mix(color * 0.3, vec3(1.0), grid * 0.3);
          
          gl_FragColor = vec4(color, 0.7);
        }
      `,
      transparent: true,
      wireframe: true
    });
  }, []);
  
  useFrame((state) => {
    if (grid.current) {
      (grid.current.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.getElapsedTime();
      
      grid.current.position.z = -state.clock.getElapsedTime() * 0.1 % 1;
      grid.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });
  
  return (
    <mesh ref={grid} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} material={material}>
      <primitive object={geometry} attach="geometry" />
    </mesh>
  );
};

interface NetworkVisualizationProps {
  nodeCount?: number;
}

interface NetworkNode {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  connections: number[];
  size: number;
  pulseSpeed: number;
  color: string;
}

interface NetworkConnection {
  start: number;
  end: number;
  color: string;
  opacity: number;
  pulseSpeed: number;
  thickness: number;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ nodeCount = 20 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<(THREE.Mesh | null)[]>([]);
  const linesRef = useRef<(THREE.Line | null)[]>([]);
  const { mouse } = useThree();
  
  const nodes = useMemo(() => {
    const nodesArray: NetworkNode[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      nodesArray.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        connections: [],
        size: 0.05 + Math.random() * 0.15, // Varied sizes
        pulseSpeed: 0.5 + Math.random() * 1.5, // Different pulse speeds
        color: Math.random() > 0.7 ? '#e31c79' : 
               Math.random() > 0.5 ? '#9945FF' : 
               Math.random() > 0.3 ? '#14F195' : '#ffffff'
      });
    }
    
    return nodesArray;
  }, [nodeCount]);
  
  const connections = useMemo(() => {
    const connectionsArray: NetworkConnection[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      const connectionCount = 2 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        
        if (targetIndex !== i && !nodes[i].connections.includes(targetIndex)) {
          nodes[i].connections.push(targetIndex);
          
          connectionsArray.push({
            start: i,
            end: targetIndex,
            color: nodes[i].color,
            opacity: 0.2 + Math.random() * 0.3,
            pulseSpeed: 0.5 + Math.random() * 1.5, // Different pulse speeds
            thickness: 0.5 + Math.random() * 2.5 // Varied line thickness
          });
        }
      }
    }
    
    return connectionsArray;
  }, [nodes]);
  
  const simulateTransaction = useCallback(() => {
    if (nodesRef.current.length === 0) return;
    
    const sourceIndex = Math.floor(Math.random() * nodes.length);
    let targetIndex = Math.floor(Math.random() * nodes.length);
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * nodes.length);
    }
    
    const sourceNode = nodesRef.current[sourceIndex];
    const targetNode = nodesRef.current[targetIndex];
    
    if (sourceNode && targetNode) {
      const sourceMaterial = sourceNode.material as THREE.MeshStandardMaterial;
      const targetMaterial = targetNode.material as THREE.MeshStandardMaterial;
      
      const originalSourceEmissive = sourceMaterial.emissiveIntensity;
      const originalTargetEmissive = targetMaterial.emissiveIntensity;
      
      sourceMaterial.emissiveIntensity = 2;
      
      setTimeout(() => {
        targetMaterial.emissiveIntensity = 2;
        
        setTimeout(() => {
          sourceMaterial.emissiveIntensity = originalSourceEmissive;
          targetMaterial.emissiveIntensity = originalTargetEmissive;
        }, 500);
      }, 300);
    }
  }, [nodes]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      simulateTransaction();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [simulateTransaction]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 + mouse.x * 0.2;
      groupRef.current.rotation.x = mouse.y * 0.1;
      
      nodes.forEach((node, i) => {
        if (nodesRef.current[i]) {
          node.position.add(node.velocity);
          
          if (Math.abs(node.position.x) > 5) node.velocity.x *= -1;
          if (Math.abs(node.position.y) > 5) node.velocity.y *= -1;
          if (Math.abs(node.position.z) > 5) node.velocity.z *= -1;
          
          const nodeMesh = nodesRef.current[i];
          if (nodeMesh) {
            nodeMesh.position.copy(node.position);
            
            const scale = 1 + 0.2 * Math.sin(state.clock.getElapsedTime() * node.pulseSpeed);
            nodeMesh.scale.set(scale, scale, scale);
          }
        }
      });
      
      connections.forEach((connection, i) => {
        const line = linesRef.current[i];
        if (line && line.geometry) {
          const geometry = line.geometry as THREE.BufferGeometry;
          const positions = geometry.attributes.position.array as Float32Array;
          
          positions[0] = nodes[connection.start].position.x;
          positions[1] = nodes[connection.start].position.y;
          positions[2] = nodes[connection.start].position.z;
          
          positions[3] = nodes[connection.end].position.x;
          positions[4] = nodes[connection.end].position.y;
          positions[5] = nodes[connection.end].position.z;
          
          geometry.attributes.position.needsUpdate = true;
          
          const material = line.material as THREE.LineBasicMaterial;
          material.opacity = connection.opacity * (0.5 + 0.5 * Math.sin(state.clock.getElapsedTime() * connection.pulseSpeed));
        }
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Enhanced Nodes with glow effect */}
      {nodes.map((node, i) => (
        <group key={`node-group-${i}`} position={node.position}>
          {/* Glow sphere */}
          <mesh scale={[1.8, 1.8, 1.8]}>
            <sphereGeometry args={[node.size, 16, 16]} />
            <meshBasicMaterial 
              color={node.color}
              transparent={true}
              opacity={0.15}
            />
          </mesh>
          
          {/* Core sphere */}
          <mesh
            ref={el => nodesRef.current[i] = el}
          >
            <sphereGeometry args={[node.size, 16, 16]} />
            <meshStandardMaterial 
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </group>
      ))}
      
      {/* Enhanced Connections with data flow */}
      {connections.map((connection, i) => {
        const lineGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6); // 2 points * 3 coordinates
        
        positions[0] = nodes[connection.start].position.x;
        positions[1] = nodes[connection.start].position.y;
        positions[2] = nodes[connection.start].position.z;
        
        positions[3] = nodes[connection.end].position.x;
        positions[4] = nodes[connection.end].position.y;
        positions[5] = nodes[connection.end].position.z;
        
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        return (
          <primitive
            key={`connection-${i}`}
            object={new THREE.Line(
              lineGeometry,
              new THREE.LineBasicMaterial({
                color: connection.color,
                opacity: connection.opacity,
                transparent: true,
                linewidth: connection.thickness // Note: This has limited support in WebGL
              })
            )}
            ref={el => linesRef.current[i] = el}
          />
        );
      })}
    </group>
  );
};

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-300 via-dark-200 to-dark-100" />
      
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 35 }}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={0.5} />
            
            <ParticleField />
            
            <Environment preset="night" />
            
            {/* Temporarily disable EffectComposer due to compatibility issues */}
            {/* <EffectComposer>
              <Bloom 
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                intensity={0.8}
              />
              <ChromaticAberration 
                offset={new THREE.Vector2(0.0005, 0.0005)}
                radialModulation={false}
                modulationOffset={0}
              />
            </EffectComposer> */}
          </Suspense>
        </Canvas>
      </div>
      
      {/* Enhanced decorative elements with glassmorphism and gradients */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
      
      {/* Side borders with glow */}
      <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
      
      {/* Diagonal accent lines */}
      <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-gradient-to-r from-pink-500/50 to-transparent transform rotate-45 origin-top-left" />
      <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-gradient-to-l from-pink-500/50 to-transparent transform -rotate-45 origin-bottom-right" />
      
      {/* Enhanced grid pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Glassmorphism floating elements */}
      <div className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/5 backdrop-blur-xl transform rotate-45 animate-float-slow pointer-events-none" />
      <div className="absolute top-[60%] right-[15%] w-40 h-40 rounded-full bg-gradient-to-tr from-blue-500/10 to-teal-500/5 backdrop-blur-xl transform -rotate-12 animate-float-slow-reverse pointer-events-none" />
      <div className="absolute bottom-[25%] left-[25%] w-24 h-24 rounded-full bg-gradient-to-bl from-purple-500/10 to-pink-500/5 backdrop-blur-xl transform rotate-12 animate-float-medium pointer-events-none" />
    </div>
  );
};

export default AnimatedBackground;
