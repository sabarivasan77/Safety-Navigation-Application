import { Box, Navigation, Zap, Info } from 'lucide-react';

interface Scene3DOverlayProps {
  buildingCount: number;
  roadCount: number;
  isNightMode: boolean;
}

export function Scene3DOverlay({ buildingCount, roadCount, isNightMode }: Scene3DOverlayProps) {
  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[500] pointer-events-none">
      <div className="text-center space-y-4">
        {/* Title */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Box className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">3D Simulation View</h2>
          </div>
          <p className="text-sm text-gray-600">Realistic Environment Visualization</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-blue-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Box className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{buildingCount}</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">Buildings Loaded</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-green-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Navigation className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{roadCount}</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">Roads Rendered</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-purple-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {isNightMode ? 'Night' : 'Day'}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">Lighting Mode</p>
          </div>
        </div>

        {/* Features Panel */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">3D Environment Features</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-left">
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
      </div>
    </div>
  );
}
