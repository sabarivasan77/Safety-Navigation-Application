import { useState } from 'react';
import { Button } from './ui/button';
import { ShieldAlert, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

interface ManualSafetyCheckProps {
  onStartFlow: () => void;
  onPauseFlow: () => void;
  onResetFlow: () => void;
  isFlowActive: boolean;
  isPaused: boolean;
}

export function ManualSafetyCheck({
  onStartFlow,
  onPauseFlow,
  onResetFlow,
  isFlowActive,
  isPaused,
}: ManualSafetyCheckProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStartClick = () => {
    if (!isFlowActive) {
      setShowConfirm(true);
    } else if (isPaused) {
      onPauseFlow(); // Resume
    } else {
      onPauseFlow(); // Pause
    }
  };

  const confirmStart = () => {
    setShowConfirm(false);
    onStartFlow();
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-orange-600" />
          <h3 className="text-sm font-semibold text-gray-900">Safety Check Control</h3>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600">
          Manually trigger the "Are You Safe?" flow. The system will automatically check your safety 
          at increasing intervals.
        </p>

        {/* Status */}
        {isFlowActive && (
          <div className={`p-3 rounded-lg border ${
            isPaused 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'
              }`}></div>
              <span className={`font-medium ${
                isPaused ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {isPaused ? 'Flow Paused' : 'Flow Active'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {isPaused 
                ? 'Safety checks are paused. Click Resume to continue.' 
                : 'System will automatically check your safety periodically.'}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-2">
          {/* Main Action Button */}
          <Button
            onClick={handleStartClick}
            className={`w-full font-semibold ${
              !isFlowActive
                ? 'bg-orange-600 hover:bg-orange-700'
                : isPaused
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {!isFlowActive ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Safety Check Flow
              </>
            ) : isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume Flow
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Flow
              </>
            )}
          </Button>

          {/* Reset Button */}
          {isFlowActive && (
            <Button
              onClick={onResetFlow}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Flow
            </Button>
          )}
        </div>

        {/* Flow Levels Info */}
        <div className="border-t border-gray-200 pt-3">
          <div className="text-xs font-semibold text-gray-700 mb-2">Flow Levels:</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-gray-600">Are you okay?</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-gray-600">Reminder check</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-gray-600">Warning escalation</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                4
              </div>
              <span className="text-gray-600">Emergency SOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Start Safety Check?</h3>
                <p className="text-sm text-gray-600">This will trigger the automatic flow</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm text-gray-700">
              <p className="font-medium">What happens next:</p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>System will ask "Are you okay?" immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>If no response, will escalate through warning levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>May alert emergency contacts if safety is at risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Final level triggers automatic SOS</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStart}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Start Flow
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
