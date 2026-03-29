// Route Segment Service - Smart dynamic route coloring based on risk levels

import { Route } from './routeService';
import { POI } from './mapService';

export interface RouteSegment {
  coordinates: [number, number][];
  color: string;
  riskLevel: 'safe' | 'moderate' | 'high';
  safetyScore: number;
}

export interface SegmentRiskArea {
  lat: number;
  lon: number;
  level: 'high' | 'moderate';
  radius: number; // meters
}

class RouteSegmentService {
  // High risk areas - specific dangerous zones
  private highRiskAreas: SegmentRiskArea[] = [
    // Coimbatore risk zones
    { lat: 11.0168, lon: 76.9558, level: 'high', radius: 400 },
    { lat: 11.0200, lon: 76.9600, level: 'moderate', radius: 300 },
    { lat: 11.0100, lon: 76.9500, level: 'high', radius: 350 },
    
    // Tiruppur risk zones
    { lat: 11.1085, lon: 77.3411, level: 'moderate', radius: 300 },
    { lat: 11.1200, lon: 77.3500, level: 'high', radius: 400 },
  ];

  // Analyze entire route and break into colored segments
  analyzeRouteSegments(route: Route, pois: POI[]): RouteSegment[] {
    const segments: RouteSegment[] = [];
    const coords = route.coordinates;
    
    if (coords.length === 0) return segments;

    let currentSegment: [number, number][] = [];
    let currentRiskLevel: 'safe' | 'moderate' | 'high' = 'safe';

    for (let i = 0; i < coords.length; i++) {
      const coord = coords[i];
      const [lon, lat] = coord;
      
      // Check risk level at this point
      const riskLevel = this.getRiskLevelAtPoint(lat, lon, pois);
      
      // If risk level changed, finalize current segment and start new one
      if (riskLevel !== currentRiskLevel && currentSegment.length > 0) {
        segments.push({
          coordinates: [...currentSegment],
          color: this.getColorForRiskLevel(currentRiskLevel),
          riskLevel: currentRiskLevel,
          safetyScore: this.getScoreForRiskLevel(currentRiskLevel),
        });
        
        // Start new segment with current point
        currentSegment = [coord];
        currentRiskLevel = riskLevel;
      } else {
        // Continue current segment
        currentSegment.push(coord);
      }
    }

    // Add final segment
    if (currentSegment.length > 0) {
      segments.push({
        coordinates: currentSegment,
        color: this.getColorForRiskLevel(currentRiskLevel),
        riskLevel: currentRiskLevel,
        safetyScore: this.getScoreForRiskLevel(currentRiskLevel),
      });
    }

    console.log(`🎨 Route analyzed: ${segments.length} segments created`);
    this.logSegmentSummary(segments);

    return segments;
  }

  // Determine risk level at a specific point
  private getRiskLevelAtPoint(lat: number, lon: number, pois: POI[]): 'safe' | 'moderate' | 'high' {
    // Check high risk areas
    for (const area of this.highRiskAreas) {
      const distance = this.calculateDistance(lat, lon, area.lat, area.lon);
      
      if (distance <= area.radius) {
        return area.level === 'high' ? 'high' : 'moderate';
      }
    }

    // Check proximity to safety services (police stations)
    const nearbyPolice = pois.filter(
      poi => poi.type === 'police' && 
      this.calculateDistance(lat, lon, poi.lat, poi.lon) < 500
    );

    // Close to police = safer
    if (nearbyPolice.length > 0) {
      return 'safe';
    }

    // Default is safe
    return 'safe';
  }

  // Get color based on risk level
  private getColorForRiskLevel(level: 'safe' | 'moderate' | 'high'): string {
    switch (level) {
      case 'safe':
        return '#2563EB'; // Blue - safe
      case 'moderate':
        return '#EAB308'; // Yellow - moderate risk
      case 'high':
        return '#EF4444'; // Red - high risk
    }
  }

  // Get safety score based on risk level
  private getScoreForRiskLevel(level: 'safe' | 'moderate' | 'high'): number {
    switch (level) {
      case 'safe':
        return 85;
      case 'moderate':
        return 60;
      case 'high':
        return 30;
    }
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Log segment summary for debugging
  private logSegmentSummary(segments: RouteSegment[]) {
    const summary = segments.map((seg, idx) => ({
      segment: idx + 1,
      points: seg.coordinates.length,
      risk: seg.riskLevel,
      color: seg.color === '#2563EB' ? '🔵' : seg.color === '#EAB308' ? '🟡' : '🔴',
    }));

    console.table(summary);
    
    const flow = segments.map(s => 
      s.color === '#2563EB' ? 'Blue' : 
      s.color === '#EAB308' ? 'Yellow' : 'Red'
    ).join(' → ');
    
    console.log(`📍 Route flow: ${flow}`);
  }

  // Get all risk areas for visualization
  getRiskAreas(): SegmentRiskArea[] {
    return [...this.highRiskAreas];
  }

  // Add custom risk area (for dynamic updates)
  addRiskArea(area: SegmentRiskArea) {
    this.highRiskAreas.push(area);
  }

  // Remove risk area
  removeRiskArea(lat: number, lon: number) {
    this.highRiskAreas = this.highRiskAreas.filter(
      area => !(Math.abs(area.lat - lat) < 0.0001 && Math.abs(area.lon - lon) < 0.0001)
    );
  }
}

export const routeSegmentService = new RouteSegmentService();
