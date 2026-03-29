import { useMemo } from 'react';
import { Building } from '../../services/mapService';
import * as THREE from 'three';

interface BuildingsProps {
  buildings: Building[];
  centerLat: number;
  centerLon: number;
}

// Convert lat/lon to local 3D coordinates
function latLonToXZ(lat: number, lon: number, centerLat: number, centerLon: number): [number, number] {
  const scale = 111000; // meters per degree at equator
  const x = (lon - centerLon) * scale * Math.cos(centerLat * Math.PI / 180) * 0.001;
  const z = -(lat - centerLat) * scale * 0.001;
  return [x, z];
}

function BuildingMesh({ building, centerLat, centerLon }: { building: Building; centerLat: number; centerLon: number }) {
  const [x, z] = latLonToXZ(building.lat, building.lon, centerLat, centerLon);
  const height = building.height || (2 + Math.random() * 8);
  const width = building.width || (3 + Math.random() * 5);
  const depth = building.depth || (3 + Math.random() * 5);
  
  // Determine building color based on type
  const buildingColors: Record<string, string> = {
    commercial: '#94a3b8',
    residential: '#cbd5e1',
    industrial: '#64748b',
    office: '#475569',
  };
  const color = buildingColors[building.type || 'residential'] || '#94a3b8';

  // Create windows texture
  const windowsData = useMemo(() => {
    const floors = Math.floor(height / 3);
    const windowsPerFloor = Math.floor(width / 1.5);
    return { floors, windowsPerFloor };
  }, [height, width]);

  return (
    <group position={[x, height / 2, z]}>
      {/* Main building structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Windows - front face */}
      {Array.from({ length: windowsData.floors }).map((_, floorIdx) => (
        <group key={`floor-${floorIdx}`}>
          {Array.from({ length: windowsData.windowsPerFloor }).map((_, winIdx) => {
            const winX = -width / 2 + (winIdx + 0.5) * (width / windowsData.windowsPerFloor);
            const winY = -height / 2 + (floorIdx + 0.5) * (height / windowsData.floors);
            const isLit = Math.random() > 0.5;
            
            return (
              <mesh 
                key={`win-${winIdx}`}
                position={[winX, winY, depth / 2 + 0.01]}
              >
                <planeGeometry args={[0.8, 1.2]} />
                <meshStandardMaterial 
                  color={isLit ? '#fef3c7' : '#334155'}
                  emissive={isLit ? '#fef3c7' : '#000000'}
                  emissiveIntensity={isLit ? 0.5 : 0}
                />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Roof detail */}
      <mesh position={[0, height / 2 + 0.2, 0]}>
        <boxGeometry args={[width + 0.2, 0.4, depth + 0.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Buildings({ buildings, centerLat, centerLon }: BuildingsProps) {
  return (
    <group>
      {buildings.slice(0, 50).map((building, idx) => (
        <BuildingMesh 
          key={`building-${idx}`} 
          building={building} 
          centerLat={centerLat} 
          centerLon={centerLon} 
        />
      ))}
    </group>
  );
}
