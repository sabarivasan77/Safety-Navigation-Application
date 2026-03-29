import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CityEnvironmentProps {
  isNightMode: boolean;
}

export function CityEnvironment({ isNightMode }: CityEnvironmentProps) {
  const starsRef = useRef<THREE.Points>(null);
  
  // Animate stars rotation
  useFrame(() => {
    if (starsRef.current && isNightMode) {
      starsRef.current.rotation.y += 0.0001;
    }
  });

  // Create stars for night mode
  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = Math.random() * 500 + 100;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    return geometry;
  }, []);

  return (
    <>
      {/* Ground plane */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial 
          color={isNightMode ? '#1e293b' : '#4a5f4a'} 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid helper for visual reference */}
      <gridHelper args={[500, 50, '#64748b', '#94a3b8']} position={[0, 0, 0]} />

      {/* Stars for night mode */}
      {isNightMode && (
        <points ref={starsRef} geometry={starsGeometry}>
          <pointsMaterial
            color="#ffffff"
            size={2}
            sizeAttenuation={true}
            transparent={true}
            opacity={0.8}
          />
        </points>
      )}

      {/* Night sky dome */}
      {isNightMode && (
        <mesh>
          <sphereGeometry args={[800, 32, 32]} />
          <meshBasicMaterial 
            color="#0f172a" 
            side={THREE.BackSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Fog for atmosphere */}
      <fog attach="fog" args={[isNightMode ? '#1e293b' : '#e0f2fe', 100, 400]} />
    </>
  );
}