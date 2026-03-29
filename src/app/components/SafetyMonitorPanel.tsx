import { useState, useEffect } from 'react';
import { safetyMonitorService, SafetyMonitorState } from '../services/safetyMonitorService';
import { Button } from './ui/button';
import { Shield, Play, Square, Clock, Activity } from 'lucide-react';

interface SafetyMonitorPanelProps {
  onSOSActivated: () => void;
}

export function SafetyMonitorPanel({ onSOSActivated }: SafetyMonitorPanelProps) {
  const [monitorState, setMonitorState] = useState<SafetyMonitorState>(
    safetyMonitorService.getState()
  );
  const [timeUntilCheck, setTimeUntilCheck] = useState(0);
  const [journeyTime, setJourneyTime] = useState(0);

  useEffect(() => {
    // Update state every second
    const interval = setInterval(() => {
      setMonitorState(safetyMonitorService.getState());
      setTimeUntilCheck(safetyMonitorService.getTimeUntilNextCheck());
      setJourneyTime(safetyMonitorService.getJourneyDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (monitorState.status) {
      case 'safe':
        return 'text-green-600';
      case 'checking':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-orange-600';
      case 'emergency':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = () => {
    switch (monitorState.status) {
      case 'safe':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            ✓ Safe
          </span>
        );
      case 'checking':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold animate-pulse">
            🔔 Checking
          </span>
        );
      case 'warning':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold animate-pulse">
            ⚠️ Warning
          </span>
        );
      case 'critical':
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold animate-bounce">
            🚨 Critical
          </span>
        );
      case 'emergency':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold animate-pulse">
            🆘 Emergency
          </span>
        );
    }
  };

  if (!monitorState.isActive) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-6 h-6 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Safety Monitor</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Not active. Start monitoring to receive regular safety checks during your journey.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className={`w-6 h-6 ${getStatusColor()}`} />
          <h3 className="font-semibold text-gray-900">Safety Monitor</h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Next Check */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Next Check</span>
          </div>
          <div className="text-xl font-bold text-blue-700">
            {formatTime(timeUntilCheck)}
          </div>
        </div>

        {/* Journey Time */}
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Journey Time</span>
          </div>
          <div className="text-xl font-bold text-green-700">
            {formatTime(journeyTime)}
          </div>
        </div>
      </div>

      {/* Check Count */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>Safety checks completed:</span>
        <span className="font-semibold text-gray-900">{monitorState.checkCount}</span>
      </div>

      {/* Escalation Indicator */}
      {monitorState.escalationLevel > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Alert Level</span>
            <span className={getStatusColor()}>
              Level {monitorState.escalationLevel}/4
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                monitorState.escalationLevel === 1
                  ? 'bg-blue-500'
                  : monitorState.escalationLevel === 2
                  ? 'bg-yellow-500'
                  : monitorState.escalationLevel === 3
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${(monitorState.escalationLevel / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Active:</span> You'll receive safety checks every 5 minutes. 
          Respond promptly to avoid escalation.
        </p>
      </div>
    </div>
  );
}
