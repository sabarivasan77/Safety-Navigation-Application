import { useState, useEffect } from 'react';
import { AlertTriangle, X, Navigation } from 'lucide-react';
import { Button } from './ui/button';

export interface SafetyAlertData {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  suggestedAction?: string;
  onReroute?: () => void;
}

interface SafetyAlertProps {
  alert: SafetyAlertData;
  onDismiss: (id: string) => void;
}

export function SafetyAlert({ alert, onDismiss }: SafetyAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, [alert.id]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(alert.id), 300);
  };

  const getBgColor = () => {
    switch (alert.type) {
      case 'danger':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBorderColor = () => {
    switch (alert.type) {
      case 'danger':
        return 'border-red-600';
      case 'warning':
        return 'border-yellow-600';
      case 'info':
        return 'border-blue-600';
      default:
        return 'border-gray-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md mx-4 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl border-2 ${getBorderColor()} overflow-hidden`}
      >
        {/* Header Bar */}
        <div className={`${getBgColor()} px-4 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold text-sm">{alert.title}</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-800">{alert.message}</p>

          {alert.suggestedAction && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-700">
                <strong>Suggestion:</strong> {alert.suggestedAction}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {alert.onReroute && (
              <Button
                onClick={alert.onReroute}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Find Safer Route
              </Button>
            )}
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className={alert.onReroute ? '' : 'flex-1'}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Alert Manager Component
interface SafetyAlertManagerProps {
  alerts: SafetyAlertData[];
  onDismiss: (id: string) => void;
}

export function SafetyAlertManager({ alerts, onDismiss }: SafetyAlertManagerProps) {
  // Show only the most recent alert
  const currentAlert = alerts[alerts.length - 1];

  if (!currentAlert) return null;

  return <SafetyAlert alert={currentAlert} onDismiss={onDismiss} />;
}
