import { useMemo, useRef } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { Route } from '../../services/routeService';
import { SafetyScore } from '../../services/safetyService';
import { useFrame } from '@react-three/fiber';

interface Route3DProps {
  route: Route;
  safety: SafetyScore;
  centerLat: number;
  centerLon: number;
  isSelected?: boolean;
}

// Convert lat/lon to 3D coordinates
function latLonTo3D(lat: number, lon: number, centerLat: number, centerLon: number): [number, number, number] {
  const x = (lon - centerLon) * 111320 * Math.cos((centerLat * Math.PI) / 180) / 100;
  const z = -(lat - centerLat) * 111320 / 100;
  return [x, 0.5, z]; // Elevated slightly above ground
}

// Get color based on safety score
function getSafetyColor(score: number): THREE.Color {
  if (score >= 75) {
    return new THREE.Color(0x22c55e); // Green
  } else if (score >= 50) {
    return new THREE.Color(0xeab308); // Yellow
  } else {
    return new THREE.Color(0xef4444); // Red
  }
}

export function Route3D({ route, safety, centerLat, centerLon, isSelected = false }: Route3DProps) {
  const lineRef = useRef<THREE.Line>(null);
  
  // Convert route coordinates to 3D points
  const points = useMemo(() => {
    return route.coordinates.map(coord => 
      new THREE.Vector3(...latLonTo3D(coord[1], coord[0], centerLat, centerLon))
    );
  }, [route.coordinates, centerLat, centerLon]);

  // Get color based on safety score
  const routeColor = useMemo(() => getSafetyColor(safety.overallScore), [safety.overallScore]);

  // Animate selected route
  useFrame((state) => {
    if (lineRef.current && isSelected) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  // Create gradient colors along the route based on segment safety
  const segmentColors = useMemo(() => {
    const colors: THREE.Color[] = [];
    const segments = route.coordinates.length - 1;
    
    route.coordinates.forEach((_, index) => {
      // Calculate safety for this segment
      const progress = index / segments;
      const segmentScore = safety.overallScore * (1 - progress * 0.2); // Slight variation
      colors.push(getSafetyColor(segmentScore));
    });
    
    return colors;
  }, [route.coordinates, safety.overallScore]);

  return (
    <group>
      {/* Main route line */}
      <Line
        ref={lineRef}
        points={points}
        color={routeColor}
        lineWidth={isSelected ? 4 : 2.5}
        transparent
        opacity={isSelected ? 1 : 0.8}
      />
      
      {/* Glowing effect for selected route */}
      {isSelected && (
        <Line
          points={points}
          color={routeColor}
          lineWidth={8}
          transparent
          opacity={0.3}
        />
      )}
      
      {/* Start marker */}
      <mesh position={points[0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial 
          color={0x22c55e} 
          emissive={0x22c55e} 
          emissiveIntensity={0.5} 
        />
      </mesh>
      
      {/* End marker */}
      <mesh position={points[points.length - 1]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial 
          color={0xef4444} 
          emissive={0xef4444} 
          emissiveIntensity={0.5} 
        />
      </mesh>

      {/* Danger zone indicators along route */}
      {safety.riskAreas.map((area, index) => {
        const riskPoint = latLonTo3D(area.center.lat, area.center.lon, centerLat, centerLon);
        return (
          <group key={`risk-${index}`} position={riskPoint}>
            {/* Warning cylinder */}
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[2, 2, 4, 8]} />
              <meshStandardMaterial 
                color={0xef4444} 
                transparent 
                opacity={0.3} 
                emissive={0xef4444}
                emissiveIntensity={0.2}
              />
            </mesh>
            {/* Pulsing light */}
            <pointLight color={0xef4444} intensity={5} distance={10} />
          </group>
        );
      })}
    </group>
  );
}

// Component to render multiple routes
interface Routes3DProps {
  routes: Array<{ route: Route; safety: SafetyScore }>;
  selectedRoute: number | null;
  centerLat: number;
  centerLon: number;
}

export function Routes3D({ routes, selectedRoute, centerLat, centerLon }: Routes3DProps) {
  return (
    <group>
      {routes.map((routeData, index) => (
        <Route3D
          key={`route-${index}`}
          route={routeData.route}
          safety={routeData.safety}
          centerLat={centerLat}
          centerLon={centerLon}
          isSelected={selectedRoute === index}
        />
      ))}
    </group>
  );
}
