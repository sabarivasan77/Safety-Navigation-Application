import { Shield, MapPin, Navigation, Clock } from 'lucide-react';

interface QuickStatsProps {
  totalRoutes: number;
  selectedSafetyScore: number;
  nearbyPOIs: number;
  estimatedTime?: string;
}

export function QuickStats({ 
  totalRoutes, 
  selectedSafetyScore, 
  nearbyPOIs,
  estimatedTime 
}: QuickStatsProps) {
  if (totalRoutes === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Navigation className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-gray-700">Routes</span>
        </div>
        <div className="text-lg font-bold text-gray-900">{totalRoutes}</div>
      </div>

      <div className={`rounded-lg p-3 ${
        selectedSafetyScore >= 70 
          ? 'bg-green-50' 
          : selectedSafetyScore >= 50 
          ? 'bg-yellow-50' 
          : 'bg-red-50'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className={`w-4 h-4 ${
            selectedSafetyScore >= 70 
              ? 'text-green-600' 
              : selectedSafetyScore >= 50 
              ? 'text-yellow-600' 
              : 'text-red-600'
          }`} />
          <span className="text-xs font-medium text-gray-700">Safety</span>
        </div>
        <div className="text-lg font-bold text-gray-900">{selectedSafetyScore}%</div>
      </div>

      <div className="bg-purple-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-gray-700">Services</span>
        </div>
        <div className="text-lg font-bold text-gray-900">{nearbyPOIs}</div>
      </div>

      {estimatedTime && (
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-700">Time</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{estimatedTime}</div>
        </div>
      )}
    </div>
  );
}
