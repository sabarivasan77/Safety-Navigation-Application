import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PedestriansProps {
  centerLat: number;
  centerLon: number;
}

interface PedestrianData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  path: THREE.Vector3[];
  pathIndex: number;
}

function Pedestrian({ data }: { data: PedestrianData }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !data.path || data.path.length === 0) return;

    // Simple walking animation
    const time = Date.now() * 0.003;
    
    // Move along path
    const target = data.path[data.pathIndex % data.path.length];
    const current = groupRef.current.position;
    
    // Move towards target
    current.lerp(target, 0.01);
    
    // Look in direction of movement
    const direction = new THREE.Vector3().subVectors(target, current);
    if (direction.length() > 0.1) {
      groupRef.current.lookAt(current.clone().add(direction));
    }
    
    // Check if reached target
    if (current.distanceTo(target) < 0.5) {
      data.pathIndex = (data.pathIndex + 1) % data.path.length;
    }

    // Bobbing animation for walking
    groupRef.current.position.y = 1 + Math.sin(time * 4) * 0.1;
  });

  return (
    <group ref={groupRef} position={data.position}>
      {/* Body */}
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#f8b195" />
      </mesh>

      {/* Arms (simplified) */}
      <mesh castShadow position={[0.4, 0.3, 0]} rotation={[0, 0, Math.PI / 8]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color={data.color} />
      </mesh>
      <mesh castShadow position={[-0.4, 0.3, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color={data.color} />
      </mesh>
    </group>
  );
}

export function Pedestrians({ centerLat, centerLon }: PedestriansProps) {
  const pedestrians = useMemo(() => {
    const peds: PedestrianData[] = [];
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
    
    for (let i = 0; i < 15; i++) {
      // Random position within the city
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      
      // Create a random path for pedestrian to follow
      const path: THREE.Vector3[] = [];
      const pathLength = 4 + Math.floor(Math.random() * 4);
      for (let j = 0; j < pathLength; j++) {
        const px = x + (Math.random() - 0.5) * 20;
        const pz = z + (Math.random() - 0.5) * 20;
        path.push(new THREE.Vector3(px, 1, pz));
      }
      
      peds.push({
        id: i,
        position: new THREE.Vector3(x, 1, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          0,
          (Math.random() - 0.5) * 0.05
        ),
        color: colors[Math.floor(Math.random() * colors.length)],
        path,
        pathIndex: 0,
      });
    }
    
    return peds;
  }, [centerLat, centerLon]);

  return (
    <group>
      {pedestrians.map(ped => (
        <Pedestrian key={ped.id} data={ped} />
      ))}
    </group>
  );
}