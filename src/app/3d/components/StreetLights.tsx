import { Road } from '../../services/mapService';
import { useRef } from 'react';
import * as THREE from 'three';

interface StreetLightsProps {
  roads: Road[];
  centerLat: number;
  centerLon: number;
  isNightMode: boolean;
}

function latLonToXZ(lat: number, lon: number, centerLat: number, centerLon: number): [number, number] {
  const scale = 111000;
  const x = (lon - centerLon) * scale * Math.cos(centerLat * Math.PI / 180) * 0.001;
  const z = -(lat - centerLat) * scale * 0.001;
  return [x, z];
}

function StreetLight({ position, isNightMode }: { position: [number, number, number]; isNightMode: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);

  return (
    <group position={position}>
      {/* Light pole */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 8, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Light fixture */}
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial 
          color={isNightMode ? '#fbbf24' : '#94a3b8'}
          emissive={isNightMode ? '#fbbf24' : '#000000'}
          emissiveIntensity={isNightMode ? 1 : 0}
        />
      </mesh>

      {/* Point light - only active at night */}
      {isNightMode && (
        <pointLight
          ref={lightRef}
          position={[0, 4, 0]}
          color="#fbbf24"
          intensity={2}
          distance={15}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
      )}

      {/* Light glow effect */}
      {isNightMode && (
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial 
            color="#fbbf24" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

export function StreetLights({ roads, centerLat, centerLon, isNightMode }: StreetLightsProps) {
  // Generate street light positions along roads
  const lightPositions: [number, number, number][] = [];
  
  roads.slice(0, 15).forEach(road => {
    if (!road.points || road.points.length < 2) return;
    
    // Place lights every 3rd point
    road.points.forEach((point, idx) => {
      if (idx % 3 === 0) {
        const [x, z] = latLonToXZ(point.lat, point.lon, centerLat, centerLon);
        // Offset lights to the side of the road
        lightPositions.push([x + 2, 0, z]);
      }
    });
  });

  return (
    <group>
      {lightPositions.slice(0, 40).map((position, idx) => (
        <StreetLight 
          key={`light-${idx}`} 
          position={position} 
          isNightMode={isNightMode}
        />
      ))}
    </group>
  );
}
