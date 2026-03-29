import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { realtimeService, RealTimeData } from '../services/realtimeService';

interface RealTimeMonitorProps {
  currentLocation: { lat: number; lon: number } | null;
  onDataUpdate?: (data: RealTimeData) => void;
}

export function RealTimeMonitor({ currentLocation, onDataUpdate }: RealTimeMonitorProps) {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [previousScore, setPreviousScore] = useState<number>(0);

  useEffect(() => {
    if (!currentLocation) return;

    // Start monitoring
    realtimeService.startMonitoring(currentLocation);

    // Subscribe to updates
    const handleUpdate = (newData: RealTimeData) => {
      setData(prevData => {
        if (prevData) {
          setPreviousScore(prevData.safetyScore);
          
          // Determine trend
          if (newData.safetyScore > prevData.safetyScore + 2) {
            setTrend('up');
          } else if (newData.safetyScore < prevData.safetyScore - 2) {
            setTrend('down');
          } else {
            setTrend('stable');
          }
        }
        return newData;
      });

      // Notify parent component
      if (onDataUpdate) {
        onDataUpdate(newData);
      }
    };

    realtimeService.subscribe('monitor', handleUpdate);

    // Cleanup
    return () => {
      realtimeService.unsubscribe('monitor');
      realtimeService.stopMonitoring();
    };
  }, [currentLocation, onDataUpdate]);

  // Update location when it changes
  useEffect(() => {
    if (currentLocation) {
      realtimeService.updateLocation(currentLocation);
    }
  }, [currentLocation]);

  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Initializing real-time monitoring...</span>
        </div>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
          <h3 className="text-sm font-semibold text-gray-900">Live Monitoring</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Active</span>
        </div>
      </div>

      {/* Safety Score with Trend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Safety Score</span>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-xs text-gray-500">
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
              {Math.abs(data.safetyScore - previousScore).toFixed(0)}
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                data.safetyScore >= 70
                  ? 'bg-green-500'
                  : data.safetyScore >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${data.safetyScore}%` }}
            />
          </div>
          <span className="absolute right-0 top-0 text-xs font-bold text-gray-900 mt-4">
            {data.safetyScore}%
          </span>
        </div>
      </div>

      {/* Crowd Density */}
      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <span className="text-xs text-gray-600">Crowd Density</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-gray-900">~{data.crowdDensity} people</span>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className={`rounded-lg border p-2 ${getRiskColor(data.riskLevel)}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <div className="flex-1">
            <div className="text-xs font-semibold capitalize">{data.riskLevel} Risk</div>
            {data.activeAlerts > 0 && (
              <div className="text-xs mt-0.5">{data.activeAlerts} active alert{data.activeAlerts > 1 ? 's' : ''}</div>
            )}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
        Updated {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
