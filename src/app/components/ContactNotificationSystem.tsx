import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Users, Check, MapPin, Clock, Share2, AlertCircle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface ContactNotificationSystemProps {
  onConfirm: (selectedContacts: Contact[]) => void;
  onSkip: () => void;
  currentLocation: { lat: number; lon: number } | null;
  destination: { lat: number; lon: number } | null;
  routeInfo?: {
    distance: string;
    duration: string;
    safetyScore: number;
  };
}

export function ContactNotificationSystem({
  onConfirm,
  onSkip,
  currentLocation,
  destination,
  routeInfo,
}: ContactNotificationSystemProps) {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showLocationPreview, setShowLocationPreview] = useState(false);

  // Mock contacts - In real app, fetch from device
  const mockContacts: Contact[] = [
    { id: '1', name: 'Mom', phone: '+91 98765 43210', relationship: 'Family' },
    { id: '2', name: 'Dad', phone: '+91 98765 43211', relationship: 'Family' },
    { id: '3', name: 'Spouse', phone: '+91 98765 43212', relationship: 'Family' },
    { id: '4', name: 'Best Friend', phone: '+91 98765 43213', relationship: 'Friend' },
    { id: '5', name: 'Roommate', phone: '+91 98765 43214', relationship: 'Friend' },
    { id: '6', name: 'Colleague', phone: '+91 98765 43215', relationship: 'Work' },
  ];

  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAll = () => {
    if (selectedContacts.size === mockContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(mockContacts.map(c => c.id)));
    }
  };

  const handleConfirm = () => {
    const selected = mockContacts.filter(c => selectedContacts.has(c.id));
    onConfirm(selected);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'Family':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Friend':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Work':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Share Your Journey</h2>
                <p className="text-blue-100 text-sm">Keep your loved ones informed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-700 font-medium">Your selected contacts will receive:</p>
              <ul className="mt-2 space-y-1 text-gray-600 text-xs">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Live location updates every 30 seconds
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Route information and safety score
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Instant alerts if safety concerns arise
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Route Preview */}
        {routeInfo && (
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{routeInfo.distance}</div>
                <div className="text-xs text-gray-600">Distance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{routeInfo.duration}</div>
                <div className="text-xs text-gray-600">Duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{routeInfo.safetyScore}%</div>
                <div className="text-xs text-gray-600">Safety</div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Selection */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Select Contacts ({selectedContacts.size})
            </h3>
            <Button
              onClick={selectAll}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {selectedContacts.size === mockContacts.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="space-y-2">
            {mockContacts.map((contact) => {
              const isSelected = selectedContacts.has(contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        contact.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.phone}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRelationshipColor(
                        contact.relationship
                      )}`}
                    >
                      {contact.relationship}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location Preview Toggle */}
        {currentLocation && destination && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={() => setShowLocationPreview(!showLocationPreview)}
              className="w-full text-left text-sm text-gray-600 hover:text-gray-900 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Preview what contacts will see
              </span>
              <span className="text-xs text-blue-600">
                {showLocationPreview ? 'Hide' : 'Show'}
              </span>
            </button>

            {showLocationPreview && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 text-xs space-y-2">
                <div>
                  <div className="font-semibold text-gray-700">Start Location:</div>
                  <div className="text-gray-600">
                    📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lon.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Destination:</div>
                  <div className="text-gray-600">
                    🎯 {destination.lat.toFixed(4)}, {destination.lon.toFixed(4)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Clock className="w-4 h-4" />
                  <span>Live tracking active</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 bg-white flex gap-3">
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedContacts.size === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {selectedContacts.size === 0
              ? 'Select Contacts'
              : `Notify ${selectedContacts.size} Contact${selectedContacts.size > 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Component to display contact notification status
interface ContactNotificationStatusProps {
  contacts: Contact[];
  onManage: () => void;
}

export function ContactNotificationStatus({ contacts, onManage }: ContactNotificationStatusProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (contacts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-600" />
          Live Sharing Active
        </h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">Active</span>
        </div>
      </div>

      <div className="space-y-2">
        {contacts.slice(0, 3).map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {contact.name.charAt(0)}
              </div>
              <span className="text-sm text-gray-900">{contact.name}</span>
            </div>
            <Check className="w-4 h-4 text-green-600" />
          </div>
        ))}
        {contacts.length > 3 && (
          <div className="text-xs text-gray-600 text-center">
            +{contacts.length - 3} more contacts
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
        Last updated {lastUpdate.toLocaleTimeString()}
      </div>

      <Button
        onClick={onManage}
        variant="outline"
        size="sm"
        className="w-full"
      >
        Manage Contacts
      </Button>
    </div>
  );
}
