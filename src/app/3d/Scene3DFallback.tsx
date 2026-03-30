import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { useMemo } from "react";
import { Building, POI, Road } from "../services/mapService";
import { Route } from "../services/routeService";
import { RouteSegment } from "../services/routeSegmentService";

interface Scene3DFallbackProps {
  buildings: Building[];
  roads: Road[];
  pois: POI[];
  routes: Route[];
  selectedRoute: number | null;
  routeSegments?: RouteSegment[][];
  centerLat: number;
  centerLon: number;
  isNightMode?: boolean;
}

type LocalPoint = [number, number, number];

const poiColors: Record<POI["type"], string> = {
  police: "#2563eb",
  hospital: "#ef4444",
  petrol: "#f59e0b",
};

function latLonToScene(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
): LocalPoint {
  const scale = 7000;
  const x =
    (lon - centerLon) *
    Math.cos((centerLat * Math.PI) / 180) *
    scale;
  const z = -(lat - centerLat) * scale;
  return [x, 0, z];
}

function Ground({ isNightMode }: { isNightMode: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[260, 260]} />
      <meshStandardMaterial
        color={isNightMode ? "#1f2937" : "#dbe7d3"}
      />
    </mesh>
  );
}

function RoadsLayer({
  roads,
  centerLat,
  centerLon,
}: {
  roads: Road[];
  centerLat: number;
  centerLon: number;
}) {
  const roadLines = useMemo(
    () =>
      roads.slice(0, 24).map((road) =>
        road.coordinates.map(([lon, lat]) =>
          latLonToScene(lat, lon, centerLat, centerLon),
        ),
      ),
    [roads, centerLat, centerLon],
  );

  return (
    <>
      {roadLines.map((points, index) => (
        <Line
          key={`road-${index}`}
          points={points}
          color="#4b5563"
          lineWidth={2.5}
          position={[0, 0.04, 0]}
        />
      ))}
    </>
  );
}

function BuildingsLayer({
  buildings,
  centerLat,
  centerLon,
}: {
  buildings: Building[];
  centerLat: number;
  centerLon: number;
}) {
  const blocks = useMemo(
    () =>
      buildings.slice(0, 70).map((building, index) => {
        const footprint = building.coordinates.slice(0, 4);
        const lats = footprint.map((coord) => coord[1]);
        const lons = footprint.map((coord) => coord[0]);

        const lat = lats.reduce((sum, value) => sum + value, 0) / lats.length;
        const lon = lons.reduce((sum, value) => sum + value, 0) / lons.length;

        const xs = footprint.map((coord) =>
          latLonToScene(coord[1], coord[0], centerLat, centerLon)[0],
        );
        const zs = footprint.map((coord) =>
          latLonToScene(coord[1], coord[0], centerLat, centerLon)[2],
        );

        const width = Math.max(2.5, Math.abs(Math.max(...xs) - Math.min(...xs)));
        const depth = Math.max(2.5, Math.abs(Math.max(...zs) - Math.min(...zs)));
        const height = Math.max(4, Math.min(30, building.height || 8));
        const [x, , z] = latLonToScene(lat, lon, centerLat, centerLon);

        return { key: `${building.id}-${index}`, x, z, width, depth, height };
      }),
    [buildings, centerLat, centerLon],
  );

  return (
    <>
      {blocks.map((block) => (
        <mesh
          key={block.key}
          position={[block.x, block.height / 2, block.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[block.width, block.height, block.depth]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}
    </>
  );
}

function RouteLayer({
  routes,
  selectedRoute,
  routeSegments,
  centerLat,
  centerLon,
}: {
  routes: Route[];
  selectedRoute: number | null;
  routeSegments?: RouteSegment[][];
  centerLat: number;
  centerLon: number;
}) {
  if (selectedRoute === null || !routes[selectedRoute]) {
    return null;
  }

  const selectedSegments = routeSegments?.[selectedRoute];

  if (selectedSegments && selectedSegments.length > 0) {
    return (
      <>
        {selectedSegments.map((segment, index) => (
          <Line
            key={`segment-${index}`}
            points={segment.coordinates.map(([lon, lat]) =>
              latLonToScene(lat, lon, centerLat, centerLon),
            )}
            color={segment.color}
            lineWidth={4}
            position={[0, 0.16, 0]}
          />
        ))}
      </>
    );
  }

  return (
    <Line
      points={routes[selectedRoute].coordinates.map(([lon, lat]) =>
        latLonToScene(lat, lon, centerLat, centerLon),
      )}
      color="#2563eb"
      lineWidth={4}
      position={[0, 0.16, 0]}
    />
  );
}

function PoiLayer({
  pois,
  centerLat,
  centerLon,
}: {
  pois: POI[];
  centerLat: number;
  centerLon: number;
}) {
  return (
    <>
      {pois.slice(0, 18).map((poi) => {
        const [x, , z] = latLonToScene(
          poi.lat,
          poi.lon,
          centerLat,
          centerLon,
        );
        return (
          <group key={poi.id} position={[x, 1.5, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.45, 0.45, 2.4, 10]} />
              <meshStandardMaterial color={poiColors[poi.type]} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.7, 12, 12]} />
              <meshStandardMaterial color={poiColors[poi.type]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function SceneContents({
  buildings,
  roads,
  pois,
  routes,
  selectedRoute,
  routeSegments,
  centerLat,
  centerLon,
  isNightMode,
}: Scene3DFallbackProps) {
  return (
    <>
      <color attach="background" args={[isNightMode ? "#0f172a" : "#dbeafe"]} />
      <fog attach="fog" args={[isNightMode ? "#0f172a" : "#dbeafe", 120, 260]} />
      <ambientLight intensity={isNightMode ? 1.1 : 1.4} />
      <directionalLight
        position={[60, 90, 20]}
        intensity={isNightMode ? 0.8 : 1.2}
        castShadow
      />
      <Ground isNightMode={Boolean(isNightMode)} />
      <gridHelper args={[260, 26, "#94a3b8", "#cbd5e1"]} position={[0, 0.01, 0]} />
      <RoadsLayer roads={roads} centerLat={centerLat} centerLon={centerLon} />
      <BuildingsLayer
        buildings={buildings}
        centerLat={centerLat}
        centerLon={centerLon}
      />
      <RouteLayer
        routes={routes}
        selectedRoute={selectedRoute}
        routeSegments={routeSegments}
        centerLat={centerLat}
        centerLon={centerLon}
      />
      <PoiLayer pois={pois} centerLat={centerLat} centerLon={centerLon} />
      <OrbitControls
        enableDamping
        enablePan
        enableRotate
        enableZoom
        maxPolarAngle={Math.PI / 2.05}
        minDistance={25}
        maxDistance={180}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function Scene3DFallback(props: Scene3DFallbackProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        camera={{ position: [48, 58, 48], fov: 52, near: 0.1, far: 500 }}
      >
        <SceneContents {...props} />
      </Canvas>
    </div>
  );
}
