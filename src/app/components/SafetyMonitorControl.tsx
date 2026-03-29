import { useState } from 'react';
import { Button } from './ui/button';
import { Shield, Play, Square } from 'lucide-react';
import { safetyMonitorService } from '../services/safetyMonitorService';

interface SafetyMonitorControlProps {
  onStart: () => void;
  onStop: () => void;
  isActive: boolean;
}

export function SafetyMonitorControl({ onStart, onStop, isActive }: SafetyMonitorControlProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStart = () => {
    onStart();
  };

  const handleStop = () => {
    setShowConfirm(true);
  };

  const confirmStop = () => {
    onStop();
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Stop Safety Monitoring?</h3>
        <p className="text-sm text-yellow-800 mb-4">
          You won't receive safety checks anymore. Only stop if your journey is complete.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={confirmStop}
            variant="destructive"
            className="flex-1"
          >
            Yes, Stop
          </Button>
          <Button
            onClick={() => setShowConfirm(false)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={isActive ? handleStop : handleStart}
      className={`w-full font-semibold py-6 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all ${
        isActive
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      {isActive ? (
        <>
          <Square className="w-5 h-5 mr-2" />
          Stop Safety Monitor
        </>
      ) : (
        <>
          <Play className="w-5 h-5 mr-2" />
          Start Safety Monitor
        </>
      )}
    </Button>
  );
}
