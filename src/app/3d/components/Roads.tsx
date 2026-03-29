import { useMemo } from 'react';
import { Road } from '../../services/mapService';
import * as THREE from 'three';

interface RoadsProps {
  roads: Road[];
  centerLat: number;
  centerLon: number;
}

// Convert lat/lon to local 3D coordinates
function latLonToXZ(lat: number, lon: number, centerLat: number, centerLon: number): [number, number] {
  const scale = 111000;
  const x = (lon - centerLon) * scale * Math.cos(centerLat * Math.PI / 180) * 0.001;
  const z = -(lat - centerLat) * scale * 0.001;
  return [x, z];
}

function RoadSegment({ road, centerLat, centerLon }: { road: Road; centerLat: number; centerLon: number }) {
  const tubeGeometry = useMemo(() => {
    if (!road.points || road.points.length < 2) return null;

    // Create road path from points
    const points = road.points.map(point => {
      const [x, z] = latLonToXZ(point.lat, point.lon, centerLat, centerLon);
      return new THREE.Vector3(x, 0.05, z);
    });

    // Road width based on type
    const roadWidths: Record<string, number> = {
      motorway: 8,
      primary: 6,
      secondary: 5,
      residential: 3.5,
      tertiary: 4,
    };
    const width = roadWidths[road.type || 'residential'] || 3.5;

    try {
      // Create curve from points
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, 20, width / 2, 8, false);
    } catch (error) {
      console.warn('Error creating tube geometry:', error);
      return null;
    }
  }, [road, centerLat, centerLon]);

  if (!tubeGeometry) return null;

  // Road colors based on type
  const roadColors: Record<string, string> = {
    motorway: '#1e293b',
    primary: '#334155',
    secondary: '#475569',
    residential: '#64748b',
    tertiary: '#64748b',
  };
  const color = roadColors[road.type || 'residential'] || '#64748b';

  return (
    <group>
      {/* Main road surface */}
      <mesh geometry={tubeGeometry} receiveShadow>
        <meshStandardMaterial 
          color={color} 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

export function Roads({ roads, centerLat, centerLon }: RoadsProps) {
  return (
    <group>
      {roads.slice(0, 30).map((road, idx) => (
        <RoadSegment 
          key={`road-${idx}`} 
          road={road} 
          centerLat={centerLat} 
          centerLon={centerLon} 
        />
      ))}
    </group>
  );
}