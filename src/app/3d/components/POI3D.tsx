import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { POI } from '../../services/mapService';

interface POI3DProps {
  pois: POI[];
  centerLat: number;
  centerLon: number;
}

// Convert lat/lon to 3D coordinates
function latLonTo3D(lat: number, lon: number, centerLat: number, centerLon: number): [number, number, number] {
  const x = (lon - centerLon) * 111320 * Math.cos((centerLat * Math.PI) / 180) / 100;
  const z = -(lat - centerLat) * 111320 / 100;
  return [x, 5, z]; // Elevated for visibility
}

// Get marker color and size based on POI type
function getPOIStyle(type: string): { color: number; emissiveColor: number; size: number; height: number } {
  switch (type) {
    case 'police':
      return { color: 0x3b82f6, emissiveColor: 0x3b82f6, size: 1.5, height: 8 };
    case 'hospital':
      return { color: 0xef4444, emissiveColor: 0xef4444, size: 1.5, height: 8 };
    case 'fuel':
      return { color: 0x22c55e, emissiveColor: 0x22c55e, size: 1.2, height: 6 };
    default:
      return { color: 0x94a3b8, emissiveColor: 0x94a3b8, size: 1, height: 4 };
  }
}

// Individual POI marker component
function POIMarker({ poi, centerLat, centerLon }: { poi: POI; centerLat: number; centerLon: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const style = getPOIStyle(poi.type);
  const position = latLonTo3D(poi.lat, poi.lon, centerLat, centerLon);

  // Pulsing animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  // Get emoji icon for POI type
  const getIcon = (type: string): string => {
    switch (type) {
      case 'police':
        return '🚔';
      case 'hospital':
        return '🏥';
      case 'fuel':
        return '⛽';
      default:
        return '📍';
    }
  };

  return (
    <group position={position}>
      {/* Vertical beam */}
      <mesh position={[0, style.height / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.15, style.height, 8]} />
        <meshStandardMaterial
          color={style.color}
          emissive={style.emissiveColor}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Top sphere marker */}
      <mesh
        ref={meshRef}
        position={[0, style.height, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[style.size, 16, 16]} />
        <meshStandardMaterial
          color={style.color}
          emissive={style.emissiveColor}
          emissiveIntensity={hovered ? 1 : 0.5}
        />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight
        color={style.color}
        intensity={hovered ? 10 : 5}
        distance={15}
        position={[0, style.height, 0]}
      />

      {/* Label */}
      {hovered && (
        <Text
          position={[0, style.height + 2, 0]}
          fontSize={1}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.1}
          outlineColor="black"
        >
          {getIcon(poi.type)} {poi.name}
        </Text>
      )}

      {/* Ground circle indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[style.size * 1.5, 32]} />
        <meshStandardMaterial
          color={style.color}
          transparent
          opacity={hovered ? 0.5 : 0.2}
          emissive={style.emissiveColor}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

// Main POI3D component
export function POI3D({ pois, centerLat, centerLon }: POI3DProps) {
  return (
    <group>
      {pois.map((poi, index) => (
        <POIMarker
          key={`poi-${index}-${poi.name}`}
          poi={poi}
          centerLat={centerLat}
          centerLon={centerLon}
        />
      ))}
    </group>
  );
}
