import { useEffect, useRef, useState } from 'react';
import { Building, Road } from '../services/mapService';

interface Scene3DFallbackProps {
  buildings: Building[];
  roads: Road[];
  centerLat: number;
  centerLon: number;
  isNightMode?: boolean;
}

export function Scene3DFallback({ buildings, roads, centerLat, centerLon, isNightMode = false }: Scene3DFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: -0.5, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(200);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      drawScene(ctx, canvas.width, canvas.height);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrame);
    };
  }, [buildings, roads, rotation, zoom, isNightMode]);

  const drawScene = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = isNightMode ? '#0f172a' : '#e0f2fe';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Simple 3D projection
    const project = (x: number, y: number, z: number) => {
      // Rotate around Y axis
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const scale = zoom / (zoom + z2);
      return {
        x: centerX + x1 * scale,
        y: centerY + y1 * scale,
        scale,
      };
    };

    // Convert lat/lon to local coordinates
    const latLonToXZ = (lat: number, lon: number): [number, number] => {
      const scale = 111000;
      const x = (lon - centerLon) * scale * Math.cos(centerLat * Math.PI / 180) * 0.5;
      const z = -(lat - centerLat) * scale * 0.5;
      return [x, z];
    };

    // Draw ground grid
    ctx.strokeStyle = isNightMode ? '#1e293b' : '#94a3b8';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const gridCount = 20;
    for (let i = -gridCount; i <= gridCount; i++) {
      const p1 = project(i * gridSize, 0, -gridCount * gridSize);
      const p2 = project(i * gridSize, 0, gridCount * gridSize);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const p3 = project(-gridCount * gridSize, 0, i * gridSize);
      const p4 = project(gridCount * gridSize, 0, i * gridSize);
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // Draw buildings (simple boxes)
    const buildingObjs = buildings
      .filter(building => building.center && building.center.lat && building.center.lon)
      .slice(0, 50)
      .map(building => {
        const [x, z] = latLonToXZ(building.center.lat, building.center.lon);
        const height = building.height || 15;
        return { x, z, height };
      })
      .sort((a, b) => b.z - a.z); // Sort by z for painter's algorithm

    buildingObjs.forEach(({ x, z, height }) => {
      const size = 8;
      
      // Draw building faces
      const corners = [
        project(x - size, 0, z - size),
        project(x + size, 0, z - size),
        project(x + size, 0, z + size),
        project(x - size, 0, z + size),
        project(x - size, height, z - size),
        project(x + size, height, z - size),
        project(x + size, height, z + size),
        project(x - size, height, z + size),
      ];

      // Front face
      ctx.fillStyle = isNightMode ? '#334155' : '#64748b';
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[5].x, corners[5].y);
      ctx.lineTo(corners[4].x, corners[4].y);
      ctx.closePath();
      ctx.fill();

      // Side face
      ctx.fillStyle = isNightMode ? '#1e293b' : '#475569';
      ctx.beginPath();
      ctx.moveTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[2].x, corners[2].y);
      ctx.lineTo(corners[6].x, corners[6].y);
      ctx.lineTo(corners[5].x, corners[5].y);
      ctx.closePath();
      ctx.fill();

      // Top face
      ctx.fillStyle = isNightMode ? '#475569' : '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(corners[4].x, corners[4].y);
      ctx.lineTo(corners[5].x, corners[5].y);
      ctx.lineTo(corners[6].x, corners[6].y);
      ctx.lineTo(corners[7].x, corners[7].y);
      ctx.closePath();
      ctx.fill();

      // Draw windows (simple dots)
      if (!isNightMode) {
        ctx.fillStyle = '#dbeafe';
        for (let i = 1; i < height; i += 3) {
          for (let j = -size + 2; j < size; j += 3) {
            const window1 = project(x + j, i, z - size);
            ctx.fillRect(window1.x - 1, window1.y - 1, 2, 2);
          }
        }
      }
    });

    // Draw roads (simple lines)
    ctx.strokeStyle = isNightMode ? '#1e293b' : '#334155';
    ctx.lineWidth = 3;
    roads.slice(0, 30).forEach(road => {
      if (!road.points || road.points.length < 2) return;

      ctx.beginPath();
      road.points.forEach((point, idx) => {
        const [x, z] = latLonToXZ(point.lat, point.lon);
        const p = project(x, 0.1, z);
        if (idx === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();
    });

    // Add some simple "vehicles" (moving dots)
    const time = Date.now() * 0.001;
    ctx.fillStyle = isNightMode ? '#fef3c7' : '#ef4444';
    for (let i = 0; i < 10; i++) {
      const angle = (time * 0.3 + i) * 0.5;
      const radius = 50 + i * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const p = project(x, 2, z);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add "pedestrians" (smaller dots)
    ctx.fillStyle = isNightMode ? '#a5b4fc' : '#3b82f6';
    for (let i = 0; i < 15; i++) {
      const angle = (time * 0.5 + i) * 0.3;
      const radius = 30 + (i % 5) * 15;
      const x = Math.sin(angle * 1.5) * radius;
      const z = Math.cos(angle * 1.3) * radius;
      const p = project(x, 1, z);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;

    setRotation(prev => ({
      x: Math.max(-Math.PI / 2, Math.min(0, prev.x + dy * 0.01)),
      y: prev.y + dx * 0.01,
    }));

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(100, Math.min(500, prev + e.deltaY * 0.1)));
  };

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs space-y-1">
        <div className="font-semibold text-gray-900 mb-2">3D View Controls</div>
        <div className="text-gray-600">🖱️ Drag to rotate</div>
        <div className="text-gray-600">🔍 Scroll to zoom</div>
      </div>
    </div>
  );
}