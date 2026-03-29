import { Navigation, Clock, Shield, TrendingUp } from 'lucide-react';
import { Route, routeService } from '../services/routeService';
import { SafetyScore, safetyService } from '../services/safetyService';
import { Button } from './ui/button';

interface RoutePanelProps {
  routes: Array<{ route: Route; safety: SafetyScore }>;
  selectedRoute: number | null;
  onSelectRoute: (index: number) => void;
}

export function RoutePanel({ routes, selectedRoute, onSelectRoute }: RoutePanelProps) {
  if (routes.length === 0) {
    return null;
  }

  // Sort routes by safety score to identify safest route
  const sortedRoutes = routes
    .map((r, index) => ({ ...r, index }))
    .sort((a, b) => b.safety.overall - a.safety.overall);

  const safestRouteIndex = sortedRoutes[0]?.index;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 flex items-center">
        <Navigation className="w-5 h-5 mr-2 text-blue-600" />
        Available Routes
      </h3>

      <div className="space-y-2">
        {routes.map((item, index) => {
          const isSafest = index === safestRouteIndex;
          const isSelected = index === selectedRoute;
          const riskLevel = safetyService.getRiskLevel(item.safety.overall);

          return (
            <button
              key={index}
              onClick={() => onSelectRoute(index)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      Route {index + 1}
                    </span>
                    {isSafest && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        Safest
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <span className="flex items-center">
                      <Navigation className="w-3 h-3 mr-1" />
                      {routeService.formatDistance(item.route.distance)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {routeService.formatDuration(item.route.duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield
                      className={`w-4 h-4 ${
                        riskLevel === 'safe'
                          ? 'text-green-600'
                          : riskLevel === 'moderate'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          Safety Score
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          {item.safety.overall}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            riskLevel === 'safe'
                              ? 'bg-green-600'
                              : riskLevel === 'moderate'
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${item.safety.overall}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedRoute !== null && routes[selectedRoute] && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Safety Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Crowd Density</span>
              <div className="font-medium text-gray-900">
                {routes[selectedRoute].safety.crowdDensity}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Infrastructure</span>
              <div className="font-medium text-gray-900">
                {routes[selectedRoute].safety.infrastructure}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Nearby Help</span>
              <div className="font-medium text-gray-900">
                {routes[selectedRoute].safety.proximity}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Lighting</span>
              <div className="font-medium text-gray-900">
                {routes[selectedRoute].safety.lighting}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
