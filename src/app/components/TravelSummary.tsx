import { Route } from '../services/routeService';
import { SafetyScore } from '../services/safetyService';
import { POI } from '../services/mapService';
import { CrowdData, crowdEstimationService } from '../services/crowdEstimationService';
import { 
  MapPin, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  Shield, 
  Sun, 
  Moon,
  Users,
  Hospital,
  ShieldAlert
} from 'lucide-react';

interface TravelSummaryProps {
  route: Route;
  safety: SafetyScore;
  nearbyPOIs: POI[];
}

export function TravelSummary({ route, safety, nearbyPOIs }: TravelSummaryProps) {
  // Calculate turn directions
  const turns = calculateTurns(route.coordinates);
  
  // Get crowd estimation
  const crowdData = crowdEstimationService.estimateRouteCrowd(route.coordinates);
  const avgCrowd = Math.round(
    crowdData.reduce((sum, c) => sum + c.estimatedCount, 0) / crowdData.length
  );
  
  // Find nearest emergency services
  const nearestPolice = nearbyPOIs.find(poi => poi.type === 'police');
  const nearestHospital = nearbyPOIs.find(poi => poi.type === 'hospital');
  
  // Determine lighting (based on time)
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour <= 6;
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <h2 className="text-lg font-bold text-white">Travel Summary</h2>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
        {/* Route Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Distance</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {(route.distance / 1000).toFixed(1)} km
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Duration</span>
            </div>
            <div className="text-lg font-bold text-green-900">
              {Math.round(route.duration / 60)} min
            </div>
          </div>
        </div>

        {/* Safety Score */}
        <div className={`rounded-lg p-3 border-2 ${
          safety.overall >= 75 ? 'bg-green-50 border-green-500' :
          safety.overall >= 50 ? 'bg-yellow-50 border-yellow-500' :
          'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${
                safety.overall >= 75 ? 'text-green-600' :
                safety.overall >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`} />
              <span className="text-sm font-semibold text-gray-900">Safety Score</span>
            </div>
            <span className={`text-2xl font-bold ${
              safety.overall >= 75 ? 'text-green-700' :
              safety.overall >= 50 ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {safety.overall}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                safety.overall >= 75 ? 'bg-green-600' :
                safety.overall >= 50 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${safety.overall}%` }}
            />
          </div>
        </div>

        {/* Directions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            Turn-by-Turn Directions
          </h3>
          <div className="space-y-2">
            {turns.left > 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <span className="text-sm text-gray-700">⬅️ Left Turns</span>
                <span className="text-sm font-semibold text-gray-900">{turns.left}</span>
              </div>
            )}
            {turns.right > 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <span className="text-sm text-gray-700">➡️ Right Turns</span>
                <span className="text-sm font-semibold text-gray-900">{turns.right}</span>
              </div>
            )}
            {turns.straight > 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <span className="text-sm text-gray-700">⬆️ Continue Straight</span>
                <span className="text-sm font-semibold text-gray-900">{turns.straight}</span>
              </div>
            )}
          </div>
        </div>

        {/* Safety Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-600" />
            Safety Information
          </h3>
          <div className="space-y-2">
            {/* Lighting */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                {isNight ? (
                  <Moon className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm text-gray-700">Lighting</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {isNight ? 'Night Time' : 'Day Time'}
              </span>
            </div>

            {/* Crowd Level */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Avg Crowd</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                ~{avgCrowd} people
              </span>
            </div>

            {/* Risk Zones */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700">Risk Level</span>
              </div>
              <span className={`text-sm font-semibold ${
                safety.overall >= 75 ? 'text-green-700' :
                safety.overall >= 50 ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {safety.overall >= 75 ? 'Low' :
                 safety.overall >= 50 ? 'Moderate' :
                 'High'}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Services */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Hospital className="w-4 h-4 text-red-600" />
            Nearest Emergency Services
          </h3>
          <div className="space-y-2">
            {nearestPolice && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-blue-900">🚔 Police Station</div>
                    <div className="text-xs text-blue-700 mt-1">{nearestPolice.name}</div>
                  </div>
                  <span className="text-xs font-medium text-blue-600">~1.2km</span>
                </div>
              </div>
            )}

            {nearestHospital && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-red-900">🏥 Hospital</div>
                    <div className="text-xs text-red-700 mt-1">{nearestHospital.name}</div>
                  </div>
                  <span className="text-xs font-medium text-red-600">~0.8km</span>
                </div>
              </div>
            )}

            {!nearestPolice && !nearestHospital && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  No emergency services found nearby. Use SOS for assistance.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Key Landmarks */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">📍 Key Landmarks</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <ul className="space-y-1 text-xs text-gray-700">
              <li>• Pass through main market area</li>
              <li>• Cross railway station junction</li>
              <li>• Continue via hospital road</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate turns
function calculateTurns(coordinates: Array<[number, number]>): {
  left: number;
  right: number;
  straight: number;
} {
  if (coordinates.length < 3) {
    return { left: 0, right: 0, straight: 1 };
  }

  let left = 0;
  let right = 0;
  let straight = 0;

  for (let i = 1; i < coordinates.length - 1; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const next = coordinates[i + 1];

    const angle = calculateAngle(prev, curr, next);

    if (Math.abs(angle) < 20) {
      straight++;
    } else if (angle > 0) {
      right++;
    } else {
      left++;
    }
  }

  return { left, right, straight };
}

function calculateAngle(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number]
): number {
  const v1 = [p2[0] - p1[0], p2[1] - p1[1]];
  const v2 = [p3[0] - p2[0], p3[1] - p2[1]];

  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const det = v1[0] * v2[1] - v1[1] * v2[0];

  return Math.atan2(det, dot) * (180 / Math.PI);
}