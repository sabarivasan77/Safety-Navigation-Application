// Simplified Sidebar - Step-by-Step Guided Journey Experience

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { SearchBar } from './SearchBar';
import { RoutePanel } from './RoutePanel';
import { TravelSummary } from './TravelSummary';
import { SOSButton } from './SOSButton';
import { NearbyServices } from './NearbyServices';
import { LiveCrowdMonitor } from './LiveCrowdMonitor';
import { ContactNotificationStatus } from './ContactNotificationSystem';
import { RealTimeMonitor } from './RealTimeMonitor';
import { SearchResult, POI } from '../services/mapService';
import { Route } from '../services/routeService';
import { SafetyScore } from '../services/safetyService';
import { 
  MapPin, 
  Navigation, 
  Play, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Home
} from 'lucide-react';

type JourneyStep = 'planning' | 'reviewing' | 'preparing' | 'traveling';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface SimplifiedSidebarProps {
  // Planning phase
  onSearchSelect: (result: SearchResult, isStart: boolean) => void;
  onMapSelect: (isStart: boolean) => void;
  selectingStart: boolean;
  selectingEnd: boolean;
  startLocation: { lat: number; lon: number } | null;
  endLocation: { lat: number; lon: number } | null;
  
  // Route display
  routes: Array<{ route: Route; safety: SafetyScore }>;
  selectedRoute: number | null;
  onSelectRoute: (index: number) => void;
  
  // Journey control
  onStartJourney: () => void;
  journeyStarted: boolean;
  onReset?: () => void;
  
  // Emergency & Safety
  onSOSActivated: () => void;
  nearbyPolice: Array<{ name: string; distance: string }>;
  notifiedContacts: Contact[];
  onManageContacts: () => void;
  
  // POI data
  pois: POI[];
}

export function SimplifiedSidebar({
  onSearchSelect,
  onMapSelect,
  selectingStart,
  selectingEnd,
  startLocation,
  endLocation,
  routes,
  selectedRoute,
  onSelectRoute,
  onStartJourney,
  journeyStarted,
  onReset,
  onSOSActivated,
  nearbyPolice,
  notifiedContacts,
  onManageContacts,
  pois
}: SimplifiedSidebarProps) {
  // Determine current step based on state
  const getCurrentStep = (): JourneyStep => {
    if (journeyStarted) return 'traveling';
    if (routes.length > 0 && selectedRoute !== null) return 'reviewing';
    if (startLocation || endLocation) return 'planning';
    return 'planning';
  };

  const currentStep = getCurrentStep();
  
  // Navigation history
  const [stepHistory, setStepHistory] = useState<JourneyStep[]>(['planning']);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  // Collapsible sections
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNearbyServices, setShowNearbyServices] = useState(false);

  // Update history when step changes
  useEffect(() => {
    const newStep = getCurrentStep();
    if (newStep !== stepHistory[currentHistoryIndex]) {
      const newHistory = [...stepHistory.slice(0, currentHistoryIndex + 1), newStep];
      setStepHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    }
  }, [currentStep]);

  const canGoBack = currentHistoryIndex > 0;
  const canGoForward = currentHistoryIndex < stepHistory.length - 1;

  const handleBack = () => {
    if (canGoBack) {
      setCurrentHistoryIndex(prev => prev - 1);
      // Implement state rollback logic here based on previous step
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      setCurrentHistoryIndex(prev => prev + 1);
      // Implement state forward logic here
    }
  };

  const handleHome = () => {
    if (onReset) {
      onReset();
      setStepHistory(['planning']);
      setCurrentHistoryIndex(0);
    }
  };

  // Step indicator
  const steps = [
    { id: 'planning', label: 'Plan Route', icon: MapPin },
    { id: 'reviewing', label: 'Review', icon: Navigation },
    { id: 'traveling', label: 'Travel', icon: Play },
  ];

  const getStepIndex = (step: JourneyStep) => {
    if (step === 'planning') return 0;
    if (step === 'reviewing') return 1;
    if (step === 'traveling') return 2;
    return 0;
  };

  return (
    <aside className="w-full md:w-96 bg-white border-b md:border-r md:border-b-0 border-gray-200 flex flex-col overflow-hidden z-50 relative shadow-lg md:shadow-none">
      {/* Navigation Controls - Back/Forward/Home */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={!canGoBack}
            className={`p-2 rounded-md transition-colors ${
              canGoBack
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleForward}
            disabled={!canGoForward}
            className={`p-2 rounded-md transition-colors ${
              canGoForward
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Go forward"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleHome}
          className="p-2 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
          title="Start new journey"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === getStepIndex(currentStep);
            const isCompleted = index < getStepIndex(currentStep);
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-center text-blue-900 font-medium">
          {currentStep === 'planning' && 'Step 1: Choose your locations'}
          {currentStep === 'reviewing' && 'Step 2: Review your route'}
          {currentStep === 'traveling' && 'Step 3: Traveling safely'}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* ========== STEP 1: PLANNING ========== */}
        {currentStep === 'planning' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Let's plan your safe journey</p>
                  <p className="text-blue-700 text-xs mt-1">
                    Enter your start and destination points to get the safest route
                  </p>
                </div>
              </div>
            </div>

            {/* Start Location */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block flex items-center gap-2">
                {startLocation ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
                )}
                Start Location
              </label>
              <SearchBar
                onSelect={(result) => onSearchSelect(result, true)}
                placeholder="Where are you starting from?"
              />
              {!startLocation && (
                <Button
                  onClick={() => onMapSelect(true)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  disabled={selectingStart}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectingStart ? 'Click on map...' : 'Or select on map'}
                </Button>
              )}
              {startLocation && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Start location set
                </div>
              )}
            </div>

            {/* Destination */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block flex items-center gap-2">
                {endLocation ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
                )}
                Destination
              </label>
              <SearchBar
                onSelect={(result) => onSearchSelect(result, false)}
                placeholder="Where are you going?"
              />
              {!endLocation && (
                <Button
                  onClick={() => onMapSelect(false)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  disabled={selectingEnd}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectingEnd ? 'Click on map...' : 'Or select on map'}
                </Button>
              )}
              {endLocation && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Destination set
                </div>
              )}
            </div>

            {startLocation && endLocation && routes.length === 0 && (
              <div className="text-center py-4">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Finding safest routes...</p>
              </div>
            )}
          </div>
        )}

        {/* ========== STEP 2: REVIEWING ========== */}
        {currentStep === 'reviewing' && routes.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900">Routes found!</p>
                  <p className="text-green-700 text-xs mt-1">
                    Review the options and select the safest route for your journey
                  </p>
                </div>
              </div>
            </div>

            <RoutePanel
              routes={routes}
              selectedRoute={selectedRoute}
              onSelectRoute={onSelectRoute}
            />

            {selectedRoute !== null && (
              <>
                <TravelSummary
                  route={routes[selectedRoute].route}
                  safety={routes[selectedRoute].safety}
                  nearbyPOIs={pois}
                />

                {/* Start Journey CTA */}
                <div className="sticky bottom-0 bg-white pt-3 border-t border-gray-200 -mx-4 px-4 pb-4">
                  <Button
                    onClick={onStartJourney}
                    className="w-full bg-green-600 hover:bg-green-700 py-4 text-lg font-bold shadow-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Journey
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    You'll be guided step-by-step
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========== STEP 3: TRAVELING ========== */}
        {currentStep === 'traveling' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Journey active</p>
                  <p className="text-blue-700 text-xs mt-1">
                    We're monitoring your safety in real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency SOS - Always visible during travel */}
            <SOSButton
              currentLocation={startLocation}
              nearbyPolice={nearbyPolice}
              onSOSActivated={onSOSActivated}
            />

            {/* Contact Status */}
            {notifiedContacts.length > 0 && (
              <ContactNotificationStatus
                contacts={notifiedContacts}
                onManage={onManageContacts}
              />
            )}

            {/* Real-Time Monitor */}
            {startLocation && (
              <RealTimeMonitor
                currentLocation={startLocation}
                onDataUpdate={(data) => {
                  console.log('Real-time data:', data);
                }}
              />
            )}

            {/* Live Crowd Monitor */}
            {startLocation && (
              <LiveCrowdMonitor currentLocation={startLocation} />
            )}

            {/* Collapsible: Nearby Services */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowNearbyServices(!showNearbyServices)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  Nearby Emergency Services
                </span>
                {showNearbyServices ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
              {showNearbyServices && (
                <div className="p-3 border-t border-gray-200">
                  <NearbyServices
                    pois={pois}
                    currentLocation={startLocation}
                    maxDistance={5}
                  />
                </div>
              )}
            </div>

            {/* Route Summary (Collapsible) */}
            {selectedRoute !== null && routes[selectedRoute] && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-gray-600" />
                    Route Details
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {showAdvanced && (
                  <div className="p-3 border-t border-gray-200">
                    <TravelSummary
                      route={routes[selectedRoute].route}
                      safety={routes[selectedRoute].safety}
                      nearbyPOIs={pois}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions - Always visible (Emergency access) */}
      {journeyStarted && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <p className="text-xs text-center text-gray-600 mb-2">
            Emergency assistance
          </p>
          <div className="flex gap-2">
            <Button
              onClick={onSOSActivated}
              variant="destructive"
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              SOS
            </Button>
            <Button
              onClick={onManageContacts}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-1" />
              Contacts
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
