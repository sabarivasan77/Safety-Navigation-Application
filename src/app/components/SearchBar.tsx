import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { mapService, SearchResult } from '../services/mapService';
import { searchLocations, LocationData } from '../data/locations';

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
}

export function SearchBar({ onSelect, placeholder = 'Search location...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [localResults, setLocalResults] = useState<LocationData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLocalResults([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setLoading(true);
    
    // First, search local database (instant)
    const localMatches = searchLocations(query, 15);
    setLocalResults(localMatches);
    
    // Then search Nominatim API (with debounce)
    debounceRef.current = setTimeout(async () => {
      try {
        const searchResults = await mapService.search(query);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setQuery(result.display_name);
    setShowResults(false);
  };

  const handleLocalSelect = (location: LocationData) => {
    const result: SearchResult = {
      place_id: `local_${location.name.replace(/\s+/g, '_')}`,
      lat: location.lat.toString(),
      lon: location.lon.toString(),
      display_name: `${location.name}, ${location.city}, Tamil Nadu, India`,
      type: location.type,
    };
    onSelect(result);
    setQuery(location.name);
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setLocalResults([]);
    setShowResults(false);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'police': return '🚔';
      case 'station': return '🚉';
      case 'market': return '🏪';
      case 'landmark': return '📍';
      case 'village': return '🏘️';
      case 'street': return '🛣️';
      case 'area': return '📌';
      default: return '📍';
    }
  };

  const hasResults = localResults.length > 0 || results.length > 0;

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && hasResults && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          {/* Local Database Results (Priority) */}
          {localResults.length > 0 && (
            <>
              <div className="px-3 py-2 bg-blue-50 border-b border-blue-200">
                <span className="text-xs font-semibold text-blue-900">📍 Coimbatore & Tiruppur</span>
              </div>
              {localResults.map((location) => (
                <button
                  key={`local_${location.name}`}
                  onClick={() => handleLocalSelect(location)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLocationIcon(location.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {location.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {location.type.charAt(0).toUpperCase() + location.type.slice(1)} • {location.city}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Nominatim API Results */}
          {results.length > 0 && (
            <>
              {localResults.length > 0 && (
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-700">🌐 Other Results</span>
                </div>
              )}
              {results.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {result.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.display_name}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {loading && !localResults.length && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-500">Searching...</div>
        </div>
      )}
    </div>
  );
}