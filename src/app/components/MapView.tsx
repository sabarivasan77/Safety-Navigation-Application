import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Route } from '../services/routeService';
import { POI } from '../services/mapService';
import { AreaRisk, SafetyScore } from '../services/safetyService';
import { RouteSegment } from '../services/routeSegmentService';

interface MapViewProps {
  center: [number, number];
  routes: Route[];
  pois: POI[];
  risks: AreaRisk[];
  selectedRoute: number | null;
  routeSafetyScores?: SafetyScore[]; // Add safety scores for route coloring
  routeSegments?: RouteSegment[][]; // NEW: Multi-segment routes
  onMapClick?: (lat: number, lon: number) => void;
}

export interface MapViewRef {
  flyTo: (lat: number, lon: number, zoom?: number) => void;
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
}

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const MapView = forwardRef<MapViewRef, MapViewProps>(({ center, routes, pois, risks, selectedRoute, routeSafetyScores, routeSegments, onMapClick }, ref) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const poiLayersRef = useRef<L.Marker[]>([]);
  const riskLayersRef = useRef<L.Circle[]>([]);

  // Expose map control methods to parent
  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lon: number, zoom: number = 15) => {
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lon], zoom, {
          duration: 2, // 2 seconds animation
          easeLinearity: 0.25
        });
      }
    },
    fitBounds: (bounds: [[number, number], [number, number]]) => {
      if (mapRef.current) {
        mapRef.current.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 2,
          easeLinearity: 0.25
        });
      }
    }
  }));

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map center
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, mapRef.current.getZoom());
    }
  }, [center]);

  // Update routes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing routes
    routeLayersRef.current.forEach((layer) => layer.remove());
    routeLayersRef.current = [];

    // Add new routes
    routes.forEach((route, index) => {
      // Check if we have segments for this route
      const hasSegments = routeSegments && routeSegments[index] && routeSegments[index].length > 0;
      
      if (index === selectedRoute && hasSegments) {
        // 🎨 SMART SEGMENTED ROUTE - Multi-color based on risk
        const segments = routeSegments[index];
        
        console.log(`🎨 Rendering route ${index} with ${segments.length} segments`);
        
        segments.forEach((segment, segIdx) => {
          const latLngs: [number, number][] = segment.coordinates.map((coord) => [coord[1], coord[0]]);
          
          const polyline = L.polyline(latLngs, {
            color: segment.color,
            weight: 6,
            opacity: 1,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(mapRef.current!);

          // Add popup showing segment risk
          const riskEmoji = segment.riskLevel === 'safe' ? '🔵' : segment.riskLevel === 'moderate' ? '🟡' : '🔴';
          polyline.bindPopup(`${riskEmoji} ${segment.riskLevel.toUpperCase()} ZONE<br/>Score: ${segment.safetyScore}/100`);

          routeLayersRef.current.push(polyline);
        });
      } else {
        // Default single-color route rendering
        const latLngs: [number, number][] = route.coordinates.map((coord) => [coord[1], coord[0]]);
        
        let color = '#9CA3AF'; // Default gray for non-selected
        const weight = index === selectedRoute ? 6 : 4;
        const opacity = index === selectedRoute ? 1 : 0.5;

        if (index === selectedRoute) {
          color = '#2563EB'; // Blue for selected route without segments
        }

        const polyline = L.polyline(latLngs, {
          color,
          weight,
          opacity,
        }).addTo(mapRef.current!);

        routeLayersRef.current.push(polyline);
      }
    });
  }, [routes, selectedRoute, routeSafetyScores, routeSegments]);

  // Update POIs
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing POIs
    poiLayersRef.current.forEach((layer) => layer.remove());
    poiLayersRef.current = [];

    // Add new POIs
    pois.forEach((poi) => {
      let iconUrl = '';
      if (poi.type === 'police') {
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
      } else if (poi.type === 'hospital') {
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
      } else if (poi.type === 'petrol') {
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
      }

      const icon = L.icon({
        iconUrl,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([poi.lat, poi.lon], { icon })
        .bindPopup(`<strong>${poi.name}</strong><br/>${poi.type}`)
        .addTo(mapRef.current!);

      poiLayersRef.current.push(marker);
    });
  }, [pois]);

  // Update risk areas
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing risks
    riskLayersRef.current.forEach((layer) => layer.remove());
    riskLayersRef.current = [];

    // Add new risks
    risks.forEach((risk) => {
      let color = '#22C55E';
      if (risk.level === 'moderate') color = '#EAB308';
      if (risk.level === 'risk') color = '#EF4444';

      const circle = L.circle([risk.lat, risk.lon], {
        color,
        fillColor: color,
        fillOpacity: 0.2,
        radius: risk.radius,
      }).addTo(mapRef.current!);

      riskLayersRef.current.push(circle);
    });
  }, [risks]);

  return <div ref={mapContainerRef} className="w-full h-full" style={{ position: 'relative', zIndex: 1 }} />;
});