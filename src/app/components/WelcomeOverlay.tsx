import { useState } from 'react';
import { Shield, Navigation, AlertTriangle, X, Check } from 'lucide-react';
import { Button } from './ui/button';

export function WelcomeOverlay() {
  const [show, setShow] = useState(() => {
    return !localStorage.getItem('saferoute-welcome-seen');
  });

  const handleClose = () => {
    localStorage.setItem('saferoute-welcome-seen', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SafeRoute</h2>
          <p className="text-gray-600">Your intelligent safety navigation companion</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Smart Route Analysis</h3>
              <p className="text-xs text-gray-600">Get safety scores for multiple routes based on real-time data</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Real-time Safety Zones</h3>
              <p className="text-xs text-gray-600">View color-coded safety zones and nearby emergency services</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Emergency SOS</h3>
              <p className="text-xs text-gray-600">One-tap emergency alert with location sharing and nearby help</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-700">
            <strong>Coverage:</strong> Currently optimized for Coimbatore and Tiruppur regions with real OpenStreetMap data.
          </p>
        </div>

        <Button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700">
          Get Started
        </Button>
      </div>
    </div>
  );
}
