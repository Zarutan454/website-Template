import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDEarth = ({ size = 200, autoRotate = true, enableZoom = false }) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      1, // We'll use a square container
      0.1,
      1000
    );
    camera.position.z = 2.5;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // Transparent background
    });
    renderer.setSize(size, size);
    
    // Clear any existing canvas
    if (mountRef.current.childElementCount > 0) {
      mountRef.current.removeChild(mountRef.current.childNodes[0]);
    }
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create Earth sphere
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Load Earth textures
    const textureLoader = new THREE.TextureLoader();
    
    const earthMap = textureLoader.load('/textures/earth/earthmap1k.jpg');
    const earthCloudMap = textureLoader.load('/textures/earth/earthcloudmap.jpg');
    
    // Create Earth material
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      shininess: 5
    });
    
    // Create Earth mesh
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);
    
    // Create cloud layer
    const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: earthCloudMap,
      transparent: true,
      opacity: 0.3
    });
    
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(1.1, 64, 64);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0x00a2ff,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = enableZoom;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.5;
    controls.minPolarAngle = Math.PI / 2 - 0.5; // Limit vertical rotation
    controls.maxPolarAngle = Math.PI / 2 + 0.5;
    controlsRef.current = controls;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate clouds slightly faster than Earth
      cloudMesh.rotation.y += 0.0003;
      
      // Update controls
      controls.update();
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      renderer.setSize(size, size);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [size, autoRotate, enableZoom]);
  
  return (
    <div 
      ref={mountRef} 
      className="relative w-full h-full flex items-center justify-center"
      style={{ width: size, height: size }}
    />
  );
};

export default ThreeDEarth;