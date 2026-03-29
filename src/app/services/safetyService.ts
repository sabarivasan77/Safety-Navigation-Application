// Safety analysis service for calculating safety scores

import { Route } from './routeService';
import { POI } from './mapService';

export interface SafetyScore {
  overall: number;
  crowdDensity: number;
  infrastructure: number;
  proximity: number;
  lighting: number;
}

export interface AreaRisk {
  lat: number;
  lon: number;
  level: 'safe' | 'moderate' | 'risk';
  radius: number;
}

class SafetyService {
  // Mock crime data - In production, this would come from real data sources
  private highRiskAreas: AreaRisk[] = [
    { lat: 11.0168, lon: 76.9558, level: 'risk', radius: 500 },
    { lat: 11.1085, lon: 77.3411, level: 'moderate', radius: 300 },
  ];

  private safeCommunityAreas: AreaRisk[] = [
    { lat: 11.0510, lon: 76.9663, level: 'safe', radius: 800 },
    { lat: 11.1271, lon: 77.3378, level: 'safe', radius: 600 },
  ];

  calculateRouteSafety(route: Route, pois: POI[], currentTime: Date = new Date()): SafetyScore {
    const crowdDensity = this.analyzeCrowdDensity(route, currentTime);
    const infrastructure = this.analyzeInfrastructure(route);
    const proximity = this.analyzeProximityToHelp(route, pois);
    const lighting = this.analyzeLighting(route, currentTime);

    const overall = (crowdDensity * 0.25 + infrastructure * 0.25 + proximity * 0.3 + lighting * 0.2);

    return {
      overall: Math.round(overall),
      crowdDensity: Math.round(crowdDensity),
      infrastructure: Math.round(infrastructure),
      proximity: Math.round(proximity),
      lighting: Math.round(lighting),
    };
  }

  private analyzeCrowdDensity(route: Route, time: Date): number {
    const hour = time.getHours();
    let score = 70;

    // Peak hours have moderate crowds
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
      score -= 15;
    }

    // Night hours are less crowded but potentially less safe
    if (hour >= 22 || hour <= 5) {
      score -= 20;
    }

    // Check if route passes through known crowded areas
    for (const coord of route.coordinates) {
      if (this.isInHighDensityArea(coord[1], coord[0])) {
        score -= 10;
        break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeInfrastructure(route: Route): number {
    let score = 75;

    // Longer routes typically have better infrastructure
    if (route.distance > 5000) {
      score += 10;
    }

    // Check for risk areas along route
    for (const coord of route.coordinates) {
      for (const risk of this.highRiskAreas) {
        if (this.calculateDistance(coord[1], coord[0], risk.lat, risk.lon) < risk.radius) {
          score -= 25;
          break;
        }
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeProximityToHelp(route: Route, pois: POI[]): number {
    let score = 50;
    const checkPoints = this.sampleRoutePoints(route.coordinates, 5);

    for (const point of checkPoints) {
      const nearbyPolice = pois.filter(poi => 
        poi.type === 'police' && 
        this.calculateDistance(point[1], point[0], poi.lat, poi.lon) < 1000
      );
      
      const nearbyHospital = pois.filter(poi => 
        poi.type === 'hospital' && 
        this.calculateDistance(point[1], point[0], poi.lat, poi.lon) < 2000
      );

      if (nearbyPolice.length > 0) score += 8;
      if (nearbyHospital.length > 0) score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeLighting(route: Route, time: Date): number {
    const hour = time.getHours();
    let score = 80;

    // During daylight hours
    if (hour >= 6 && hour <= 18) {
      return 95;
    }

    // Night time - assume main roads have better lighting
    if (route.distance > 3000) {
      score += 10;
    } else {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  getRiskLevel(score: number): 'safe' | 'moderate' | 'risk' {
    if (score >= 70) return 'safe';
    if (score >= 50) return 'moderate';
    return 'risk';
  }

  getRiskColor(level: 'safe' | 'moderate' | 'risk'): string {
    switch (level) {
      case 'safe':
        return '#22C55E';
      case 'moderate':
        return '#EAB308';
      case 'risk':
        return '#EF4444';
    }
  }

  private isInHighDensityArea(lat: number, lon: number): boolean {
    // Coimbatore commercial areas
    const commercialAreas = [
      { lat: 11.0168, lon: 76.9558, radius: 0.01 }, // RS Puram
      { lat: 11.0079, lon: 76.9619, radius: 0.008 }, // Town Hall
    ];

    return commercialAreas.some(area => 
      Math.abs(lat - area.lat) < area.radius && 
      Math.abs(lon - area.lon) < area.radius
    );
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private sampleRoutePoints(coordinates: [number, number][], count: number): [number, number][] {
    if (coordinates.length <= count) return coordinates;
    
    const step = Math.floor(coordinates.length / count);
    const sampled: [number, number][] = [];
    
    for (let i = 0; i < coordinates.length; i += step) {
      if (sampled.length < count) {
        sampled.push(coordinates[i]);
      }
    }
    
    return sampled;
  }

  getAreaRisks(): AreaRisk[] {
    return [...this.highRiskAreas, ...this.safeCommunityAreas];
  }
}

export const safetyService = new SafetyService();
