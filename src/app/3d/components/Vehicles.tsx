import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Road } from '../../services/mapService';
import * as THREE from 'three';

interface VehiclesProps {
  roads: Road[];
  centerLat: number;
  centerLon: number;
}

function latLonToXZ(lat: number, lon: number, centerLat: number, centerLon: number): [number, number] {
  const scale = 111000;
  const x = (lon - centerLon) * scale * Math.cos(centerLat * Math.PI / 180) * 0.001;
  const z = -(lat - centerLat) * scale * 0.001;
  return [x, z];
}

interface VehicleData {
  id: number;
  position: THREE.Vector3;
  rotation: number;
  path: THREE.Vector3[];
  pathIndex: number;
  speed: number;
  color: string;
  type: 'car' | 'truck' | 'bus';
}

function Vehicle({ data }: { data: VehicleData }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !data.path || data.path.length === 0) return;

    const target = data.path[data.pathIndex % data.path.length];
    const current = groupRef.current.position;

    // Move towards target
    const direction = new THREE.Vector3().subVectors(target, current);
    const distance = direction.length();
    
    if (distance > 0.1) {
      direction.normalize().multiplyScalar(data.speed);
      current.add(direction);
      
      // Rotate to face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
    } else {
      // Move to next point in path
      data.pathIndex = (data.pathIndex + 1) % data.path.length;
    }
  });

  // Vehicle dimensions based on type
  const dimensions = {
    car: { width: 1.8, height: 1.5, length: 4 },
    truck: { width: 2.5, height: 3, length: 8 },
    bus: { width: 2.5, height: 3.5, length: 12 },
  };
  const dim = dimensions[data.type];

  return (
    <group ref={groupRef} position={data.position}>
      {/* Main body */}
      <mesh castShadow position={[0, dim.height / 2, 0]}>
        <boxGeometry args={[dim.width, dim.height, dim.length]} />
        <meshStandardMaterial color={data.color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, dim.height * 0.7, dim.length / 2 - 0.5]}>
        <boxGeometry args={[dim.width - 0.2, dim.height * 0.4, 0.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} transparent opacity={0.6} />
      </mesh>

      {/* Wheels */}
      {[
        [-dim.width / 2 - 0.2, 0.3, dim.length / 3],
        [dim.width / 2 + 0.2, 0.3, dim.length / 3],
        [-dim.width / 2 - 0.2, 0.3, -dim.length / 3],
        [dim.width / 2 + 0.2, 0.3, -dim.length / 3],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}

      {/* Headlights */}
      <mesh position={[dim.width / 3, dim.height * 0.3, dim.length / 2 + 0.05]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-dim.width / 3, dim.height * 0.3, dim.length / 2 + 0.05]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.5} />
      </mesh>

      {/* Taillights */}
      <mesh position={[dim.width / 3, dim.height * 0.3, -dim.length / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-dim.width / 3, dim.height * 0.3, -dim.length / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function Vehicles({ roads, centerLat, centerLon }: VehiclesProps) {
  const vehicles = useMemo(() => {
    const vehs: VehicleData[] = [];
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#1e293b', '#6366f1', '#ec4899'];
    const types: ('car' | 'truck' | 'bus')[] = ['car', 'car', 'car', 'truck', 'bus'];

    // Create vehicles for each road
    roads.slice(0, 10).forEach((road, roadIdx) => {
      if (!road.points || road.points.length < 3) return;

      // Create path from road points
      const path = road.points.map(point => {
        const [x, z] = latLonToXZ(point.lat, point.lon, centerLat, centerLon);
        return new THREE.Vector3(x, 0.5, z);
      });

      // Add 1-2 vehicles per road
      const numVehicles = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numVehicles; i++) {
        const startIdx = Math.floor(Math.random() * path.length);
        const type = types[Math.floor(Math.random() * types.length)];
        
        vehs.push({
          id: roadIdx * 10 + i,
          position: path[startIdx].clone(),
          rotation: 0,
          path,
          pathIndex: startIdx,
          speed: 0.05 + Math.random() * 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          type,
        });
      }
    });

    return vehs.slice(0, 20); // Limit to 20 vehicles
  }, [roads, centerLat, centerLon]);

  return (
    <group>
      {vehicles.map(vehicle => (
        <Vehicle key={vehicle.id} data={vehicle} />
      ))}
    </group>
  );
}