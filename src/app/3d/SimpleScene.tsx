import { Building, Road } from '../services/mapService';
import { Box, Navigation, Zap } from 'lucide-react';

interface SimpleSceneProps {
  buildings: Building[];
  roads: Road[];
  centerLat: number;
  centerLon: number;
  isNightMode?: boolean;
}

export function SimpleScene({ buildings, roads, centerLat, centerLon, isNightMode = false }: SimpleSceneProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-sky-50 relative overflow-hidden">
      {/* Background sky/night effect */}
      {isNightMode && (
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-indigo-700 opacity-80" />
      )}
      
      {/* Stars for night mode */}
      {isNightMode && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>
      )}

      {/* Isometric city visualization */}
      <div className="relative z-10 p-8">
        <div className="text-center space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Box className="w-20 h-20 mx-auto text-blue-600 animate-pulse" />
            <h2 className="text-3xl font-bold text-gray-900">
              3D Simulation View
            </h2>
            <p className="text-lg text-gray-600">
              Realistic Environment Visualization
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border-2 border-blue-100">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Box className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{buildings.length}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Buildings Loaded</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border-2 border-green-100">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Navigation className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{roads.length}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Roads Rendered</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border-2 border-purple-100">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {isNightMode ? 'Night' : 'Day'}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Lighting Mode</p>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border-2 border-gray-100 max-w-2xl mx-auto mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">3D Environment Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Realistic Building Models</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Accurate Road Networks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Day/Night Lighting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Street Lights & Vehicles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Pedestrian Simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Interactive Controls</span>
              </div>
            </div>
          </div>

          {/* Location info */}
          <div className="text-xs text-gray-500 mt-4">
            Center: {centerLat.toFixed(4)}°N, {centerLon.toFixed(4)}°E
          </div>
        </div>
      </div>

      {/* Animated buildings in background (decorative) */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end justify-center gap-2 opacity-20 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-700 rounded-t-sm"
            style={{
              width: `${20 + Math.random() * 30}px`,
              height: `${50 + Math.random() * 150}px`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}