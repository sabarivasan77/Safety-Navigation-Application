import { useState } from 'react';
import { AlertTriangle, X, Phone, MapPin, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { sosService } from '../services/sosService';

interface SOSButtonProps {
  currentLocation: { lat: number; lon: number } | null;
  nearbyPolice: Array<{ name: string; distance: string }>;
  onSOSActivated?: () => void;
}

export function SOSButton({ currentLocation, nearbyPolice, onSOSActivated }: SOSButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSOSClick = () => {
    // Check if contacts are configured
    const contacts = sosService.getContacts();
    if (contacts.length === 0) {
      alert('Please add emergency contacts before activating SOS. Configure them in the settings.');
      return;
    }
    
    setShowConfirm(true);
  };

  const handleConfirmSOS = async () => {
    setShowConfirm(false);
    
    // Activate SOS service
    await sosService.activateSOS('manual');
    
    // Notify parent component
    if (onSOSActivated) {
      onSOSActivated();
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setShowDialog(false);
  };

  const callEmergency = () => {
    window.location.href = 'tel:100';
  };

  return (
    <>
      <Button
        onClick={handleSOSClick}
        className="w-full h-16 text-lg font-semibold bg-red-600 hover:bg-red-700 shadow-lg transform hover:scale-105 transition-all"
      >
        <AlertTriangle className="w-6 h-6 mr-2" />
        SOS EMERGENCY
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 text-xl">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Activate SOS Emergency?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              This will immediately:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Send emergency alerts to all your contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Share your live GPS location</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Play loud alarm sound</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Start continuous location tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Attempt to call your first emergency contact</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 font-medium">
                ⚠️ Only activate if you are in actual danger or need immediate help
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 py-3"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSOS}
                className="flex-1 bg-red-600 hover:bg-red-700 py-3 font-bold text-base"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                ACTIVATE SOS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Dialog with nearby services */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Emergency SOS Activated
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Your location and nearby police stations are listed below. Please call 100 if you need immediate assistance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentLocation && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Your Location</p>
                    <p className="text-xs text-gray-600">
                      Lat: {currentLocation.lat.toFixed(6)}, Lon: {currentLocation.lon.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Nearby Police Stations</h3>
              {nearbyPolice.length > 0 ? (
                nearbyPolice.map((station, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{station.name}</p>
                      <p className="text-xs text-gray-600">{station.distance} away</p>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Searching for nearby help...</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={callEmergency}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call 100
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}