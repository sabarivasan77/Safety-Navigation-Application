import { useState, useEffect, useRef } from "react";
import { SafetyLegend } from "./components/SafetyLegend";
import { Controls3DInfo } from "./components/Controls3DInfo";
import { WelcomeOverlay } from "./components/WelcomeOverlay";
import { QuickStats } from "./components/QuickStats";
import { Scene3DOverlay } from "./components/Scene3DOverlay";
import { Scene3DFallback } from "./3d/Scene3DFallback";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Button } from "./components/ui/button";
import {
  mapService,
  SearchResult,
  Building,
  Road,
  POI,
} from "./services/mapService";
import { routeService, Route } from "./services/routeService";
import {
  safetyService,
  SafetyScore,
} from "./services/safetyService";
import {
  routeSegmentService,
  RouteSegment,
} from "./services/routeSegmentService";
import {
  safetyMonitorService,
  EscalationLevel,
  SafetyMonitorState,
} from "./services/safetyMonitorService";
import { sosService } from "./services/sosService";
import { MapView, MapViewRef } from "./components/MapView";
import { SimplifiedSidebar } from "./components/SimplifiedSidebar";
import { SearchBar } from "./components/SearchBar";
import { RoutePanel } from "./components/RoutePanel";
import { SOSButton } from "./components/SOSButton";
import { AudioSafety } from "./components/AudioSafety";
import { SafetyCheckDialog } from "./components/SafetyCheckDialog";
import { SafetyMonitorControl } from "./components/SafetyMonitorControl";
import { EmergencyActiveScreen } from "./components/EmergencyActiveScreen";
import { EmergencyContactsManager } from "./components/EmergencyContactsManager";
import {
  PreTripInfo,
  TripInfo,
} from "./components/PreTripInfo";
import { TravelSummary } from "./components/TravelSummary";
import {
  SafetyAlertManager,
  SafetyAlertData,
} from "./components/SafetyAlert";
import { RealTimeMonitor } from "./components/RealTimeMonitor";
import { UnifiedChat } from "./components/UnifiedChat";
import {
  ContactNotificationSystem,
  ContactNotificationStatus,
} from "./components/ContactNotificationSystem";
import { ManualSafetyCheck } from "./components/ManualSafetyCheck";
import { LiveCrowdMonitor } from "./components/LiveCrowdMonitor";
import { NearbyServices } from "./components/NearbyServices";
import {
  realtimeService,
  RealTimeData,
} from "./services/realtimeService";
import {
  Shield as ShieldIcon,
  MapPin,
  Box,
  Hospital,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
  Navigation,
  Play,
  CheckCircle,
} from "lucide-react";

// Journey Step System for Progressive UI
type JourneyStep =
  | "idle"
  | "planning"
  | "preparing"
  | "traveling"
  | "complete";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

// Default location: Coimbatore
const DEFAULT_CENTER: [number, number] = [11.0168, 76.9558];

export default function App() {
  const [activeTab, setActiveTab] = useState<"map" | "3d">(
    "map",
  );
  const [center, setCenter] =
    useState<[number, number]>(DEFAULT_CENTER);
  const [startLocation, setStartLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [endLocation, setEndLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [routes, setRoutes] = useState<
    Array<{ route: Route; safety: SafetyScore }>
  >([]);
  const [selectedRoute, setSelectedRoute] = useState<
    number | null
  >(null);
  const [routeSegments, setRouteSegments] = useState<
    RouteSegment[][]
  >([]); // NEW: Smart route segments
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectingStart, setSelectingStart] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Map reference for animations
  const mapViewRef = useRef<MapViewRef>(null);

  // Safety Monitor states
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [checkEscalationLevel, setCheckEscalationLevel] =
    useState<EscalationLevel>(0);
  const [sosActivated, setSOSActivated] = useState(false);
  const [escalationLevel, setEscalationLevel] =
    useState<EscalationLevel>("normal");
  const [showContactsManager, setShowContactsManager] =
    useState(false);

  // New feature states
  const [showPreTripInfo, setShowPreTripInfo] = useState(false);
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(
    null,
  );
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [safetyAlerts, setSafetyAlerts] = useState<
    SafetyAlertData[]
  >([]);

  // Contact notification states
  const [showContactNotification, setShowContactNotification] =
    useState(false);
  const [notifiedContacts, setNotifiedContacts] = useState<
    Contact[]
  >([]);
  const [showManageContacts, setShowManageContacts] =
    useState(false);

  const [monitorState, setMonitorState] =
    useState<SafetyMonitorState>(
      safetyMonitorService.getState(),
    );

  const refreshMonitorState = () => {
    setMonitorState(safetyMonitorService.getState());
  };

  // Load map data only once on mount to avoid rate limiting
  useEffect(() => {
    if (!dataLoaded) {
      loadMapData();
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshMonitorState();
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    const bounds = {
      north: center[0] + 0.01,
      south: center[0] - 0.01,
      east: center[1] + 0.01,
      west: center[1] - 0.01,
    };

    try {
      // Load data sequentially to avoid rate limiting
      const buildingsData =
        await mapService.getBuildingsInBounds(bounds);
      setBuildings(buildingsData);

      const roadsData =
        await mapService.getRoadsInBounds(bounds);
      setRoads(roadsData);

      const poisData = await mapService.getPOIsInBounds(bounds);
      setPois(poisData);
    } catch (error) {
      console.error("Error loading map data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSelect = (
    result: SearchResult,
    isStart: boolean,
  ) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (isStart) {
      setStartLocation({ lat, lon });
      setSelectingStart(false);
    } else {
      setEndLocation({ lat, lon });
      setSelectingEnd(false);
    }

    setCenter([lat, lon]);
  };

  const handleMapClick = (lat: number, lon: number) => {
    if (selectingStart) {
      setStartLocation({ lat, lon });
      setSelectingStart(false);
    } else if (selectingEnd) {
      setEndLocation({ lat, lon });
      setSelectingEnd(false);
    }
  };

  const calculateRoutes = async () => {
    if (!startLocation || !endLocation) return;

    setLoading(true);
    try {
      const alternativeRoutes =
        await routeService.getAlternativeRoutes(
          startLocation,
          endLocation,
        );

      const routesWithSafety = alternativeRoutes.map(
        (route) => ({
          route,
          safety: safetyService.calculateRouteSafety(
            route,
            pois,
          ),
        }),
      );

      setRoutes(routesWithSafety);

      // 🎨 ANALYZE ROUTES INTO SEGMENTS - Smart color system
      const segmentedRoutes = alternativeRoutes.map((route) =>
        routeSegmentService.analyzeRouteSegments(route, pois),
      );
      setRouteSegments(segmentedRoutes);

      console.log(
        `✅ Analyzed ${segmentedRoutes.length} routes into colored segments`,
      );

      // Auto-select safest route
      const safestIndex = routesWithSafety.reduce(
        (maxIndex, curr, index, arr) =>
          curr.safety.overall > arr[maxIndex].safety.overall
            ? index
            : maxIndex,
        0,
      );
      setSelectedRoute(safestIndex);
    } catch (error) {
      console.error("Error calculating routes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startLocation && endLocation) {
      calculateRoutes();
    }
  }, [startLocation, endLocation]);

  const nearbyPolice = pois
    .filter((poi) => poi.type === "police")
    .slice(0, 3)
    .map((poi) => ({
      name: poi.name,
      distance: "850m", // In real app, calculate actual distance
    }));

  const currentSafetyScore =
    routes[selectedRoute ?? 0]?.safety.overall ?? 75;

  // Safety Monitor Callbacks
  const handleStartMonitoring = () => {
    safetyMonitorService.startMonitoring({
      onCheck: (level) => {
        setCheckEscalationLevel(level);
        setShowSafetyCheck(true);
      },
      onEscalate: (level) => {
        setCheckEscalationLevel(level);
        setShowSafetyCheck(true);
      },
      onSOSActivated: () => {
        setSOSActivated(true);
        setShowSafetyCheck(true);
        setCheckEscalationLevel(4);
      },
      onReset: () => {
        setShowSafetyCheck(false);
        setCheckEscalationLevel(0);
      },
    });
    refreshMonitorState();
  };

  const handleStopMonitoring = () => {
    safetyMonitorService.stopMonitoring();
    setShowSafetyCheck(false);
    setCheckEscalationLevel(0);
    refreshMonitorState();
  };

  const handlePauseMonitoring = () => {
    if (!monitorState.isActive) {
      return;
    }

    if (monitorState.isPaused) {
      safetyMonitorService.resumeMonitoring();
    } else {
      safetyMonitorService.pauseMonitoring();
      setShowSafetyCheck(false);
      setCheckEscalationLevel(0);
    }

    refreshMonitorState();
  };

  const handleResetMonitoring = () => {
    safetyMonitorService.resetMonitoring();
    setShowSafetyCheck(false);
    setCheckEscalationLevel(0);
    refreshMonitorState();
  };

  const handleToggleDemoMode = () => {
    safetyMonitorService.setDemoMode(!monitorState.demoMode);
    refreshMonitorState();
  };

  const handleSkipLevel = () => {
    safetyMonitorService.skipToNextLevel();
    refreshMonitorState();
  };

  const handleSafetyResponse = (
    response: "ok" | "help" | "sos",
  ) => {
    safetyMonitorService.userResponded(response);

    if (response === "ok") {
      setShowSafetyCheck(false);
      setCheckEscalationLevel(0);
    } else if (response === "sos") {
      setSOSActivated(true);
    } else if (response === "help") {
      setShowSafetyCheck(false);
      setCheckEscalationLevel(0);
      setShowManageContacts(true);

      const alertId = `help-request-${Date.now()}`;
      setSafetyAlerts((prev) => [
        ...prev,
        {
          id: alertId,
          type: "warning",
          title: "Support Opened",
          message:
            "Safety monitoring has been reset and your support options are ready.",
          suggestedAction:
            "Use SOS for emergencies or manage contacts for a quick outreach.",
          onReroute: () => {
            setSafetyAlerts((current) =>
              current.filter((alert) => alert.id !== alertId),
            );
          },
        },
      ]);
    }

    refreshMonitorState();
  };

  useEffect(() => {
    if (journeyStarted && !safetyMonitorService.isMonitoring()) {
      handleStartMonitoring();
    }
  }, [journeyStarted]);

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-50 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              SafeRoute
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="hidden md:inline">
              Coimbatore & Tiruppur
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Simplified Sidebar - Step-by-Step Guide */}
        <SimplifiedSidebar
          onSearchSelect={handleSearchSelect}
          onMapSelect={(isStart) => {
            if (isStart) {
              setSelectingStart(true);
            } else {
              setSelectingEnd(true);
            }
          }}
          selectingStart={selectingStart}
          selectingEnd={selectingEnd}
          startLocation={startLocation}
          endLocation={endLocation}
          routes={routes}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
          onStartJourney={() => setShowPreTripInfo(true)}
          journeyStarted={journeyStarted}
          onSOSActivated={() => setSOSActivated(true)}
          nearbyPolice={nearbyPolice}
          notifiedContacts={notifiedContacts}
          onManageContacts={() => setShowManageContacts(true)}
          pois={pois}
        />

        {/* Main View */}
        <main className="flex-1 relative overflow-hidden bg-gray-100 z-10">
          {/* 2D/3D Toggle Buttons - Maximum visibility */}
          <div className="absolute top-4 left-4 z-[1000]">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-1 flex gap-1">
              <button
                onClick={() => setActiveTab("map")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold transition-all ${
                  activeTab === "map"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="hidden sm:inline">2D Map</span>
                <span className="sm:hidden">2D</span>
              </button>
              <button
                onClick={() => setActiveTab("3d")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold transition-all ${
                  activeTab === "3d"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Box className="w-5 h-5" />
                <span className="hidden sm:inline">
                  3D View
                </span>
                <span className="sm:hidden">3D</span>
              </button>
            </div>
          </div>

          <div className="absolute right-4 top-4 z-[1000]">
            <SafetyMonitorControl
              isActive={monitorState.isActive}
              isPaused={monitorState.isPaused}
              demoMode={monitorState.demoMode}
              escalationLevel={monitorState.escalationLevel}
              nextCheckInSeconds={safetyMonitorService.getTimeUntilNextCheck()}
              onStart={handleStartMonitoring}
              onPause={handlePauseMonitoring}
              onReset={handleResetMonitoring}
              onToggleDemoMode={handleToggleDemoMode}
              onSkipLevel={handleSkipLevel}
            />
          </div>

          {/* Map View */}
          {activeTab === "map" && (
            <div className="w-full h-full relative">
              <MapView
                center={center}
                routes={routes.map((r) => r.route)}
                pois={pois}
                risks={safetyService.getAreaRisks()}
                selectedRoute={selectedRoute}
                routeSafetyScores={routes.map((r) => r.safety)}
                routeSegments={routeSegments}
                onMapClick={handleMapClick}
                ref={mapViewRef}
              />
              <div className="absolute bottom-4 left-4 z-[500]">
                <SafetyLegend />
              </div>
            </div>
          )}

          {/* 3D View */}
          {activeTab === "3d" && (
            <div className="w-full h-full bg-gradient-to-b from-blue-100 to-blue-50 relative">
              <ErrorBoundary>
                <Scene3DFallback
                  buildings={buildings}
                  roads={roads}
                  centerLat={center[0]}
                  centerLon={center[1]}
                  isNightMode={
                    new Date().getHours() >= 18 ||
                    new Date().getHours() <= 6
                  }
                />
              </ErrorBoundary>
              <Scene3DOverlay
                buildingCount={buildings.length}
                roadCount={roads.length}
                isNightMode={
                  new Date().getHours() >= 18 ||
                  new Date().getHours() <= 6
                }
              />
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[2000]">
              <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-gray-900">
                  Loading...
                </span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Chat Assistant */}
      <UnifiedChat
        currentLocation={startLocation}
        destination={endLocation}
        currentSafetyScore={currentSafetyScore}
        nearbyHelp={
          pois.filter((p) => p.type === "police").length
        }
      />

      {/* Welcome Overlay */}
      <WelcomeOverlay />

      {/* Safety Check Dialog */}
      <SafetyCheckDialog
        level={checkEscalationLevel}
        onResponse={handleSafetyResponse}
        isVisible={showSafetyCheck}
        onNextLevel={handleSkipLevel}
        showNextLevelButton={monitorState.demoMode}
      />

      {/* Emergency Active Screen - Full screen overlay */}
      {sosActivated && (
        <EmergencyActiveScreen
          onClose={() => setSOSActivated(false)}
        />
      )}

      {/* Emergency Contacts Manager Dialog */}
      {showContactsManager && (
        <div className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EmergencyContactsManager
              onClose={() => setShowContactsManager(false)}
            />
          </div>
        </div>
      )}

      {/* Pre-Trip Information Collection */}
      {showPreTripInfo && (
        <PreTripInfo
          onSubmit={(info) => {
            setTripInfo(info);
            setShowPreTripInfo(false);
            // Show contact notification system after pre-trip info
            setShowContactNotification(true);
            // Store trip info in localStorage for safety tracking
            localStorage.setItem(
              "safeRouteTripInfo",
              JSON.stringify(info),
            );
          }}
          onSkip={() => {
            setShowPreTripInfo(false);
            // Still show contact notification even if skipped
            setShowContactNotification(true);
          }}
        />
      )}

      {/* Contact Notification System - NEW */}
      {showContactNotification &&
        startLocation &&
        endLocation &&
        routes.length > 0 &&
        selectedRoute !== null && (
          <ContactNotificationSystem
            onConfirm={(contacts) => {
              setNotifiedContacts(contacts);
              setShowContactNotification(false);
              setJourneyStarted(true);

              // 🎬 ANIMATE MAP TO STARTING LOCATION - Like Google Maps!
              if (startLocation && mapViewRef.current) {
                // Switch to map view if not already
                setActiveTab("map");
                // Fly to starting location with smooth animation
                setTimeout(() => {
                  mapViewRef.current?.flyTo(
                    startLocation.lat,
                    startLocation.lon,
                    16,
                  );
                }, 100);
              }

              // Simulate sending notifications (in real app, send SMS/push notifications)
              console.log("Notifying contacts:", contacts);

              // Show success message
              const alertId = `contact-notified-${Date.now()}`;
              setSafetyAlerts((prev) => [
                ...prev,
                {
                  id: alertId,
                  type: "info",
                  title: "Contacts Notified",
                  message: `${contacts.length} contact${contacts.length > 1 ? "s have" : " has"} been notified of your journey.`,
                  suggestedAction:
                    "They will receive live location updates.",
                  onReroute: () => {
                    setSafetyAlerts((prev) =>
                      prev.filter((a) => a.id !== alertId),
                    );
                  },
                },
              ]);
            }}
            onSkip={() => {
              setShowContactNotification(false);
              setJourneyStarted(true);

              // 🎬 ANIMATE MAP TO STARTING LOCATION - Like Google Maps!
              if (startLocation && mapViewRef.current) {
                // Switch to map view if not already
                setActiveTab("map");
                // Fly to starting location with smooth animation
                setTimeout(() => {
                  mapViewRef.current?.flyTo(
                    startLocation.lat,
                    startLocation.lon,
                    16,
                  );
                }, 100);
              }
            }}
            currentLocation={startLocation}
            destination={endLocation}
            routeInfo={
              selectedRoute !== null
                ? {
                    distance:
                      routes[selectedRoute].route.distance,
                    duration:
                      routes[selectedRoute].route.duration,
                    safetyScore:
                      routes[selectedRoute].safety.overall,
                  }
                : undefined
            }
          />
        )}

      {/* Manage Contacts Dialog - NEW */}
      {showManageContacts && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ContactNotificationSystem
              onConfirm={(contacts) => {
                setNotifiedContacts(contacts);
                setShowManageContacts(false);
              }}
              onSkip={() => {
                setShowManageContacts(false);
              }}
              currentLocation={startLocation}
              destination={endLocation}
              routeInfo={
                selectedRoute !== null && routes.length > 0
                  ? {
                      distance:
                        routes[selectedRoute].route.distance,
                      duration:
                        routes[selectedRoute].route.duration,
                      safetyScore:
                        routes[selectedRoute].safety.overall,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {/* Safety Alerts Manager */}
      <SafetyAlertManager
        alerts={safetyAlerts}
        onDismiss={(id) => {
          setSafetyAlerts((prev) =>
            prev.filter((alert) => alert.id !== id),
          );
        }}
      />
    </div>
  );
}
