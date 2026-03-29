import { useState } from 'react';
import { Button } from './ui/button';
import { Car, Bike, PersonStanding, X, Check } from 'lucide-react';

export interface TripInfo {
  travelMode: 'walking' | 'bike' | 'car';
  vehicleNumber?: string;
  dressColor?: string;
  description?: string;
}

interface PreTripInfoProps {
  onSubmit: (info: TripInfo) => void;
  onSkip: () => void;
}

export function PreTripInfo({ onSubmit, onSkip }: PreTripInfoProps) {
  const [travelMode, setTravelMode] = useState<'walking' | 'bike' | 'car' | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [dressColor, setDressColor] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!travelMode) {
      alert('Please select a travel mode');
      return;
    }

    const info: TripInfo = {
      travelMode,
      dressColor: dressColor || undefined,
      description: description || undefined,
    };

    if ((travelMode === 'bike' || travelMode === 'car') && vehicleNumber) {
      info.vehicleNumber = vehicleNumber;
    }

    onSubmit(info);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Trip Information</h2>
          <Button onClick={onSkip} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Help us track your safety by providing these details
        </p>

        {/* Travel Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Travel Mode *
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTravelMode('walking')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                travelMode === 'walking'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <PersonStanding className={`w-8 h-8 ${travelMode === 'walking' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${travelMode === 'walking' ? 'text-blue-900' : 'text-gray-700'}`}>
                Walking
              </span>
            </button>

            <button
              onClick={() => setTravelMode('bike')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                travelMode === 'bike'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <Bike className={`w-8 h-8 ${travelMode === 'bike' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${travelMode === 'bike' ? 'text-blue-900' : 'text-gray-700'}`}>
                Bike
              </span>
            </button>

            <button
              onClick={() => setTravelMode('car')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                travelMode === 'car'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <Car className={`w-8 h-8 ${travelMode === 'car' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${travelMode === 'car' ? 'text-blue-900' : 'text-gray-700'}`}>
                Car
              </span>
            </button>
          </div>
        </div>

        {/* Vehicle Number (if bike or car) */}
        {(travelMode === 'bike' || travelMode === 'car') && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Vehicle Number
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g., TN-38-AB-1234"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        )}

        {/* Dress Color */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Dress Color (Optional)
          </label>
          <input
            type="text"
            value={dressColor}
            onChange={(e) => setDressColor(e.target.value)}
            placeholder="e.g., Blue shirt, Black pants"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Additional Description */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any other identifying information..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-900">
            🔒 This information is stored locally for safety tracking and emergency assistance
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1 py-3"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 font-semibold"
            disabled={!travelMode}
          >
            <Check className="w-4 h-4 mr-2" />
            Start Journey
          </Button>
        </div>
      </div>
    </div>
  );
}