import { useEffect, useState } from 'react';
import { EscalationLevel } from '../services/safetyMonitorService';
import { Button } from './ui/button';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from 'lucide-react';

interface SafetyCheckDialogProps {
  level: EscalationLevel;
  onResponse: (response: 'ok' | 'help' | 'sos') => void;
  isVisible: boolean;
}

export function SafetyCheckDialog({ level, onResponse, isVisible }: SafetyCheckDialogProps) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Set countdown based on escalation level
    let initialTime = 0;
    switch (level) {
      case 1:
        initialTime = 60; // 1 minute
        break;
      case 2:
        initialTime = 120; // 2 minutes
        break;
      case 3:
        initialTime = 60; // 1 minute
        break;
      default:
        initialTime = 0;
    }

    setCountdown(initialTime);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [level, isVisible]);

  if (!isVisible) return null;

  const getDialogContent = () => {
    switch (level) {
      case 1:
        return {
          icon: <ShieldCheck className="w-16 h-16 text-blue-500" />,
          title: 'Are You OK?',
          message: 'Just checking in on your safety during your journey.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          showOK: true,
          showHelp: true,
          showSOS: false,
        };

      case 2:
        return {
          icon: <ShieldAlert className="w-16 h-16 text-yellow-500" />,
          title: 'We Didn\'t Hear From You',
          message: 'Please respond to confirm you\'re safe.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          showOK: true,
          showHelp: true,
          showSOS: true,
        };

      case 3:
        return {
          icon: <AlertTriangle className="w-20 h-20 text-orange-500 animate-pulse" />,
          title: 'URGENT: Please Respond',
          message: 'Emergency will be activated automatically if you don\'t respond.',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          showOK: true,
          showHelp: false,
          showSOS: true,
        };

      case 4:
        return {
          icon: <AlertOctagon className="w-24 h-24 text-red-500 animate-bounce" />,
          title: '🆘 EMERGENCY ACTIVATED',
          message: 'Help is being notified. Stay calm.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          showOK: false,
          showHelp: false,
          showSOS: false,
        };

      default:
        return {
          icon: <ShieldCheck className="w-16 h-16 text-blue-500" />,
          title: 'Safety Check',
          message: 'Are you safe?',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          showOK: true,
          showHelp: true,
          showSOS: false,
        };
    }
  };

  const content = getDialogContent();
  const isEmergency = level === 4;
  const isCritical = level === 3;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isEmergency 
            ? 'bg-red-900/80 animate-pulse' 
            : isCritical 
            ? 'bg-orange-900/70' 
            : 'bg-black/50'
        }`}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`${content.bgColor} rounded-2xl shadow-2xl border-4 ${content.borderColor} max-w-md w-full p-6 transform transition-all duration-300 ${
            isCritical || isEmergency ? 'scale-105' : 'scale-100'
          }`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold text-center mb-3 ${
            isEmergency ? 'text-red-700' : isCritical ? 'text-orange-700' : 'text-gray-900'
          }`}>
            {content.title}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-700 mb-4 text-base">
            {content.message}
          </p>

          {/* Countdown */}
          {countdown > 0 && level < 4 && (
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                level === 3 ? 'border-orange-500 bg-orange-100' : 'border-yellow-500 bg-yellow-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  level === 3 ? 'text-orange-700' : 'text-yellow-700'
                }`}>
                  {countdown}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">seconds remaining</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {content.showOK && (
              <Button
                onClick={() => onResponse('ok')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all"
              >
                ✅ I'm OK
              </Button>
            )}

            {content.showHelp && (
              <Button
                onClick={() => onResponse('help')}
                variant="outline"
                className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50 font-semibold py-3 text-base rounded-xl"
              >
                ⚠️ Need Help
              </Button>
            )}

            {content.showSOS && (
              <Button
                onClick={() => onResponse('sos')}
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 text-base rounded-xl shadow-lg"
              >
                🚨 Activate SOS Now
              </Button>
            )}

            {isEmergency && (
              <div className="text-center mt-4">
                <p className="text-red-700 font-semibold animate-pulse">
                  Emergency services notified
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Live location sharing active
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
