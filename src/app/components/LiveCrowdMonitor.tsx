import { useEffect, useState } from 'react';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { crowdEstimationService, CrowdData } from '../services/crowdEstimationService';

interface LiveCrowdMonitorProps {
  currentLocation: { lat: number; lon: number } | null;
  className?: string;
}

export function LiveCrowdMonitor({ currentLocation, className = '' }: LiveCrowdMonitorProps) {
  const [crowdData, setCrowdData] = useState<CrowdData | null>(null);

  useEffect(() => {
    if (!currentLocation) return;

    // Start live monitoring
    crowdEstimationService.startLiveMonitoring(currentLocation, (data) => {
      setCrowdData(data);
    });

    // Cleanup
    return () => {
      crowdEstimationService.stopLiveMonitoring(currentLocation);
    };
  }, [currentLocation]);

  if (!crowdData) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Estimating crowd...</span>
        </div>
      </div>
    );
  }

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'low':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTrendIcon = () => {
    switch (crowdData.trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendText = () => {
    switch (crowdData.trend) {
      case 'increasing':
        return 'Increasing';
      case 'decreasing':
        return 'Decreasing';
      default:
        return 'Stable';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Live Crowd Estimate</h3>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Crowd Count with Icon */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {crowdEstimationService.getCrowdIcon(crowdData.density)} ~{crowdData.estimatedCount}
            </span>
            <span className="text-sm text-gray-600">people</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon()}
            <span className="text-xs text-gray-600">{getTrendText()}</span>
          </div>
        </div>
      </div>

      {/* Density Badge */}
      <div className={`rounded-lg border p-3 ${getDensityColor(crowdData.density)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold capitalize">{crowdData.density} Density</div>
            <div className="text-xs mt-0.5">
              {crowdData.density === 'low' && 'Area is relatively empty'}
              {crowdData.density === 'medium' && 'Moderate crowd present'}
              {crowdData.density === 'high' && 'High crowd density - Stay alert'}
            </div>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
        Updated {new Date(crowdData.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
}

// Compact version for inline display
export function CompactCrowdMonitor({ currentLocation }: LiveCrowdMonitorProps) {
  const [crowdData, setCrowdData] = useState<CrowdData | null>(null);

  useEffect(() => {
    if (!currentLocation) return;

    crowdEstimationService.startLiveMonitoring(currentLocation, (data) => {
      setCrowdData(data);
    });

    return () => {
      crowdEstimationService.stopLiveMonitoring(currentLocation);
    };
  }, [currentLocation]);

  if (!crowdData) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
      <Users className="w-4 h-4 text-blue-600" />
      <span className="text-sm font-medium text-blue-900">
        ~{crowdData.estimatedCount} people
      </span>
      {crowdData.trend === 'increasing' && <TrendingUp className="w-3 h-3 text-red-600" />}
      {crowdData.trend === 'decreasing' && <TrendingDown className="w-3 h-3 text-green-600" />}
    </div>
  );
}
