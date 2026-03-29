import { useEffect, useState } from 'react';
import { sosService, LocationData, EmergencyContact } from '../services/sosService';
import { Button } from './ui/button';
import { 
  AlertOctagon, 
  MapPin, 
  Phone, 
  Navigation, 
  Clock,
  Users,
  Radio,
  X,
  ExternalLink
} from 'lucide-react';

interface EmergencyActiveScreenProps {
  onClose: () => void;
}

export function EmergencyActiveScreen({ onClose }: EmergencyActiveScreenProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [duration, setDuration] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  useEffect(() => {
    // Get initial data
    setLocation(sosService.getState().currentLocation);
    setContacts(sosService.getContacts());

    // Set up callbacks
    sosService.setCallbacks({
      onLocationUpdate: (loc) => {
        setLocation(loc);
        setUpdateCount(prev => prev + 1);
      },
    });

    // Update duration every second
    const interval = setInterval(() => {
      setDuration(sosService.getActiveDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopSOS = () => {
    sosService.stopSOS();
    onClose();
  };

  const openInMaps = () => {
    if (location) {
      window.open(sosService.getMapLink(), '_blank');
    }
  };

  const callContact = (phone: string) => {
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-red-600 overflow-y-auto">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800 animate-pulse opacity-90" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 pb-24">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 animate-bounce">
            <AlertOctagon className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🚨 SOS ACTIVE
          </h1>
          <p className="text-red-100 text-lg">
            Emergency assistance activated
          </p>
        </div>

        {/* Status Cards */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Duration & Updates */}
          <div className="bg-white rounded-xl shadow-2xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-600 font-medium">Active Duration</span>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {formatDuration(duration)}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Radio className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">Location Updates</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {updateCount}
                </div>
              </div>
            </div>
          </div>

          {/* Current Location */}
          <div className="bg-white rounded-xl shadow-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 mb-1">Live Location</h2>
                {location ? (
                  <div className="space-y-2">
                    <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">Latitude:</span>
                        <span className="font-semibold">{location.lat.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">Longitude:</span>
                        <span className="font-semibold">{location.lng.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="font-semibold">{location.accuracy.toFixed(0)}m</span>
                      </div>
                    </div>
                    
                    {location.address && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-blue-900">{location.address}</p>
                      </div>
                    )}
                    
                    <Button
                      onClick={openInMaps}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </Button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <Navigation className="w-4 h-4 inline mr-2" />
                      Acquiring GPS location...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl shadow-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-red-600" />
              <h2 className="font-bold text-gray-900">Emergency Contacts Notified</h2>
            </div>
            
            {contacts.length > 0 ? (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-green-50 rounded-lg p-3 border border-green-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.phone}</div>
                      <div className="text-xs text-green-700 mt-1">
                        ✓ Alert sent • {contact.relationship}
                      </div>
                    </div>
                    <Button
                      onClick={() => callContact(contact.phone)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  No emergency contacts configured. Add contacts in settings.
                </p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-2xl p-5">
            <h2 className="font-bold text-gray-900 mb-3">Active Systems</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                <span className="text-sm font-medium text-gray-900">🔊 Emergency Alarm</span>
                <span className="text-xs text-green-700 font-semibold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                <span className="text-sm font-medium text-gray-900">📍 Live GPS Tracking</span>
                <span className="text-xs text-green-700 font-semibold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                <span className="text-sm font-medium text-gray-900">📡 Location Broadcasting</span>
                <span className="text-xs text-green-700 font-semibold">EVERY 10s</span>
              </div>
            </div>
          </div>

          {/* Safety Instructions */}
          <div className="bg-blue-900 rounded-xl shadow-2xl p-5 text-white">
            <h2 className="font-bold mb-3">Safety Instructions</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-300">•</span>
                <span>Stay calm and move to a safe location if possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300">•</span>
                <span>Your location is being shared with emergency contacts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300">•</span>
                <span>Keep your phone with you and charged</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300">•</span>
                <span>Help is on the way - someone will contact you soon</span>
              </li>
            </ul>
          </div>

          {/* Stop SOS Button */}
          {!showStopConfirm ? (
            <Button
              onClick={() => setShowStopConfirm(true)}
              variant="outline"
              className="w-full py-6 text-lg font-semibold bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-100"
            >
              <X className="w-5 h-5 mr-2" />
              I'm Safe - Stop SOS
            </Button>
          ) : (
            <div className="bg-white rounded-xl shadow-2xl p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-center">
                Are you sure you're safe?
              </h3>
              <p className="text-sm text-gray-600 text-center">
                This will stop all emergency alerts and location tracking.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleStopSOS}
                  className="bg-green-600 hover:bg-green-700 py-4 font-semibold"
                >
                  Yes, I'm Safe
                </Button>
                <Button
                  onClick={() => setShowStopConfirm(false)}
                  variant="outline"
                  className="py-4 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
