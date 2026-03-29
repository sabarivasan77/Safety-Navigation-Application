import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Building, Road, POI } from '../services/mapService';
import { Route } from '../services/routeService';
import { SafetyScore } from '../services/safetyService';
import { CityEnvironment } from './components/CityEnvironment';
import { Buildings } from './components/Buildings';
import { Roads } from './components/Roads';
import { StreetLights } from './components/StreetLights';
import { Pedestrians } from './components/Pedestrians';
import { Vehicles } from './components/Vehicles';
import { Lighting } from './components/Lighting';
import { Routes3D } from './components/Route3D';
import { POI3D } from './components/POI3D';
import { Suspense } from 'react';

interface Scene3DProps {
  buildings: Building[];
  roads: Road[];
  pois: POI[];
  routes: Array<{ route: Route; safety: SafetyScore }>;
  selectedRoute: number | null;
  centerLat: number;
  centerLon: number;
  isNightMode?: boolean;
}

export function Scene3D({ 
  buildings, 
  roads, 
  pois, 
  routes, 
  selectedRoute, 
  centerLat, 
  centerLon, 
  isNightMode = false 
}: Scene3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [100, 80, 100], fov: 60 }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <Lighting isNightMode={isNightMode} />
          
          {/* Ground and environment */}
          <CityEnvironment isNightMode={isNightMode} />
          
          {/* City elements - render only if data exists */}
          {buildings.length > 0 && (
            <Buildings buildings={buildings} centerLat={centerLat} centerLon={centerLon} />
          )}
          {roads.length > 0 && (
            <Roads roads={roads} centerLat={centerLat} centerLon={centerLon} />
          )}
          {roads.length > 0 && (
            <StreetLights roads={roads} centerLat={centerLat} centerLon={centerLon} isNightMode={isNightMode} />
          )}
          <Pedestrians centerLat={centerLat} centerLon={centerLon} />
          {roads.length > 0 && (
            <Vehicles roads={roads} centerLat={centerLat} centerLon={centerLon} />
          )}

          {/* Routes - NEW */}
          {routes.length > 0 && (
            <Routes3D
              routes={routes}
              selectedRoute={selectedRoute}
              centerLat={centerLat}
              centerLon={centerLon}
            />
          )}

          {/* POI Markers - NEW */}
          {pois.length > 0 && (
            <POI3D pois={pois} centerLat={centerLat} centerLon={centerLon} />
          )}
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={20}
            maxDistance={300}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}