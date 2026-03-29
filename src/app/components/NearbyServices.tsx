import { useState, useEffect, useMemo } from 'react';
import { Hospital, ShieldCheck, Fuel, MapPin, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { POI } from '../services/mapService';

interface NearbyServicesProps {
  pois: POI[];
  currentLocation: { lat: number; lon: number } | null;
  maxDistance?: number; // km
}

interface POIWithDistance extends POI {
  distance: number;
  distanceText: string;
}

export function NearbyServices({ pois, currentLocation, maxDistance = 5 }: NearbyServicesProps) {
  const [expandedType, setExpandedType] = useState<'police' | 'hospital' | 'petrol' | null>(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  // Filter and sort POIs by distance
  const nearbyPOIs = useMemo(() => {
    if (!currentLocation) return [];

    const poisWithDistance: POIWithDistance[] = pois.map((poi) => {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lon,
        poi.lat,
        poi.lon
      );
      return {
        ...poi,
        distance,
        distanceText: formatDistance(distance),
      };
    });

    // Filter by max distance and sort by distance
    return poisWithDistance
      .filter((poi) => poi.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }, [pois, currentLocation, maxDistance]);

  // Group by type
  const groupedPOIs = useMemo(() => {
    return {
      police: nearbyPOIs.filter((p) => p.type === 'police'),
      hospital: nearbyPOIs.filter((p) => p.type === 'hospital'),
      petrol: nearbyPOIs.filter((p) => p.type === 'petrol'),
    };
  }, [nearbyPOIs]);

  const getTypeIcon = (type: 'police' | 'hospital' | 'petrol') => {
    switch (type) {
      case 'police':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'hospital':
        return <Hospital className="w-4 h-4 text-red-600" />;
      case 'petrol':
        return <Fuel className="w-4 h-4 text-green-600" />;
    }
  };

  const getTypeColor = (type: 'police' | 'hospital' | 'petrol') => {
    switch (type) {
      case 'police':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'hospital':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'petrol':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
    }
  };

  const getTypeLabel = (type: 'police' | 'hospital' | 'petrol') => {
    switch (type) {
      case 'police':
        return 'Police Stations';
      case 'hospital':
        return 'Hospitals';
      case 'petrol':
        return 'Petrol Bunks';
    }
  };

  const handleNavigate = (poi: POIWithDistance) => {
    // In real app, this would open navigation app
    const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lon}`;
    window.open(url, '_blank');
  };

  const toggleExpand = (type: 'police' | 'hospital' | 'petrol') => {
    setExpandedType(expandedType === type ? null : type);
  };

  if (!currentLocation) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          Nearby Services
        </h3>
        <div className="text-xs text-gray-500 text-center py-4">
          Set your location to see nearby services
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          Nearby Services
        </h3>
        <span className="text-xs text-gray-500">Within {maxDistance}km</span>
      </div>

      <div className="space-y-2">
        {/* Police Stations */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleExpand('police')}
            className={`w-full flex items-center justify-between p-3 transition-colors ${getTypeColor('police')}`}
          >
            <div className="flex items-center gap-2">
              {getTypeIcon('police')}
              <span className="text-sm font-medium text-gray-900">{getTypeLabel('police')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-700">{groupedPOIs.police.length}</span>
              {expandedType === 'police' ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </button>
          {expandedType === 'police' && (
            <div className="bg-white border-t border-blue-200">
              {groupedPOIs.police.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {groupedPOIs.police.slice(0, 5).map((poi) => (
                    <div key={poi.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {poi.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {poi.distanceText} away
                          </div>
                        </div>
                        <button
                          onClick={() => handleNavigate(poi)}
                          className="flex-shrink-0 p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                          title="Navigate"
                        >
                          <Navigation className="w-3 h-3 text-blue-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {groupedPOIs.police.length > 5 && (
                    <div className="p-2 text-xs text-center text-gray-500">
                      +{groupedPOIs.police.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No police stations within {maxDistance}km
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hospitals */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleExpand('hospital')}
            className={`w-full flex items-center justify-between p-3 transition-colors ${getTypeColor('hospital')}`}
          >
            <div className="flex items-center gap-2">
              {getTypeIcon('hospital')}
              <span className="text-sm font-medium text-gray-900">{getTypeLabel('hospital')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-700">{groupedPOIs.hospital.length}</span>
              {expandedType === 'hospital' ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </button>
          {expandedType === 'hospital' && (
            <div className="bg-white border-t border-red-200">
              {groupedPOIs.hospital.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {groupedPOIs.hospital.slice(0, 5).map((poi) => (
                    <div key={poi.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {poi.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {poi.distanceText} away
                          </div>
                        </div>
                        <button
                          onClick={() => handleNavigate(poi)}
                          className="flex-shrink-0 p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                          title="Navigate"
                        >
                          <Navigation className="w-3 h-3 text-red-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {groupedPOIs.hospital.length > 5 && (
                    <div className="p-2 text-xs text-center text-gray-500">
                      +{groupedPOIs.hospital.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No hospitals within {maxDistance}km
                </div>
              )}
            </div>
          )}
        </div>

        {/* Petrol Bunks */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleExpand('petrol')}
            className={`w-full flex items-center justify-between p-3 transition-colors ${getTypeColor('petrol')}`}
          >
            <div className="flex items-center gap-2">
              {getTypeIcon('petrol')}
              <span className="text-sm font-medium text-gray-900">{getTypeLabel('petrol')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-700">{groupedPOIs.petrol.length}</span>
              {expandedType === 'petrol' ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </button>
          {expandedType === 'petrol' && (
            <div className="bg-white border-t border-green-200">
              {groupedPOIs.petrol.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {groupedPOIs.petrol.slice(0, 5).map((poi) => (
                    <div key={poi.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {poi.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {poi.distanceText} away
                          </div>
                        </div>
                        <button
                          onClick={() => handleNavigate(poi)}
                          className="flex-shrink-0 p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                          title="Navigate"
                        >
                          <Navigation className="w-3 h-3 text-green-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {groupedPOIs.petrol.length > 5 && (
                    <div className="p-2 text-xs text-center text-gray-500">
                      +{groupedPOIs.petrol.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No petrol bunks within {maxDistance}km
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600 text-center">
        {nearbyPOIs.length} total services found nearby
      </div>
    </div>
  );
}
