interface LightingProps {
  isNightMode: boolean;
}

export function Lighting({ isNightMode }: LightingProps) {
  return (
    <>
      {/* Ambient light - overall illumination */}
      <ambientLight intensity={isNightMode ? 0.15 : 0.4} />
      
      {/* Directional light - sun/moon */}
      <directionalLight
        position={isNightMode ? [-50, 50, -50] : [100, 100, 50]}
        intensity={isNightMode ? 0.2 : 1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        color={isNightMode ? '#6366f1' : '#ffffff'}
      />
      
      {/* Hemisphere light for realistic outdoor lighting */}
      <hemisphereLight
        color={isNightMode ? '#1e1b4b' : '#87ceeb'}
        groundColor={isNightMode ? '#0f172a' : '#3a5f3a'}
        intensity={isNightMode ? 0.3 : 0.6}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-50, 30, -30]}
        intensity={isNightMode ? 0.1 : 0.3}
        color={isNightMode ? '#818cf8' : '#ffffff'}
      />
    </>
  );
}
