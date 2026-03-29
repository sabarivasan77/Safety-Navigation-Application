// Crowd Estimation Service - Approximate crowd density based on location with live updates
export interface CrowdData {
  location: { lat: number; lon: number };
  estimatedCount: number;
  density: 'low' | 'medium' | 'high';
  lastUpdate: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

class CrowdEstimationService {
  private previousCounts: Map<string, number> = new Map();
  private updateListeners: Map<string, (data: CrowdData) => void> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private currentLocation: { lat: number; lon: number } | null = null;

  // Start live crowd monitoring
  startLiveMonitoring(location: { lat: number; lon: number }, callback: (data: CrowdData) => void): void {
    this.currentLocation = location;
    const locationKey = `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
    this.updateListeners.set(locationKey, callback);

    // Initial update
    callback(this.estimateCrowd(location.lat, location.lon));

    // Set up periodic updates (every 10 seconds)
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => {
        this.updateAllLocations();
      }, 10000);
    }
  }

  // Stop live monitoring
  stopLiveMonitoring(location: { lat: number; lon: number }): void {
    const locationKey = `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
    this.updateListeners.delete(locationKey);

    if (this.updateListeners.size === 0 && this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Update all monitored locations
  private updateAllLocations(): void {
    this.updateListeners.forEach((callback, locationKey) => {
      const [lat, lon] = locationKey.split(',').map(Number);
      const data = this.estimateCrowd(lat, lon);
      callback(data);
    });
  }

  // Simulate crowd estimation based on location type and time
  estimateCrowd(lat: number, lon: number): CrowdData {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    const locationKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    
    // Base crowd calculation (simulated with more variation)
    let baseCount = Math.floor(Math.random() * 30) + 5; // 5-35 base
    
    // Time-based multiplier
    if (hour >= 8 && hour <= 10) {
      baseCount *= 1.5; // Morning rush
    } else if (hour >= 17 && hour <= 20) {
      baseCount *= 2; // Evening rush
    } else if (hour >= 22 || hour <= 6) {
      baseCount *= 0.3; // Night time
    }
    
    // Weekend multiplier
    if (isWeekend) {
      baseCount *= 1.2;
    }

    // Add random variation for realistic live updates (-5 to +5)
    baseCount += Math.random() * 10 - 5;
    
    // Round to nearest integer
    const estimatedCount = Math.max(0, Math.round(baseCount));
    
    // Determine trend
    const previousCount = this.previousCounts.get(locationKey);
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    if (previousCount !== undefined) {
      const diff = estimatedCount - previousCount;
      if (diff > 2) {
        trend = 'increasing';
      } else if (diff < -2) {
        trend = 'decreasing';
      }
    }
    
    this.previousCounts.set(locationKey, estimatedCount);
    
    // Determine density
    let density: 'low' | 'medium' | 'high';
    if (estimatedCount < 15) {
      density = 'low';
    } else if (estimatedCount < 30) {
      density = 'medium';
    } else {
      density = 'high';
    }
    
    return {
      location: { lat, lon },
      estimatedCount,
      density,
      lastUpdate: Date.now(),
      trend,
    };
  }
  
  // Get crowd estimate for route
  estimateRouteCrowd(coordinates: Array<[number, number]>): CrowdData[] {
    // Sample points along route
    const samplePoints = this.sampleRoutePoints(coordinates, 5);
    
    return samplePoints.map(point => 
      this.estimateCrowd(point[0], point[1])
    );
  }
  
  // Sample points along route
  private sampleRoutePoints(
    coordinates: Array<[number, number]>, 
    count: number
  ): Array<[number, number]> {
    if (coordinates.length <= count) return coordinates;
    
    const step = Math.floor(coordinates.length / count);
    const samples: Array<[number, number]> = [];
    
    for (let i = 0; i < count; i++) {
      const index = Math.min(i * step, coordinates.length - 1);
      samples.push(coordinates[index]);
    }
    
    return samples;
  }
  
  // Get crowd icon based on density
  getCrowdIcon(density: 'low' | 'medium' | 'high'): string {
    switch (density) {
      case 'low':
        return '👤';
      case 'medium':
        return '👥';
      case 'high':
        return '👥👥';
      default:
        return '👤';
    }
  }
  
  // Get crowd color
  getCrowdColor(density: 'low' | 'medium' | 'high'): string {
    switch (density) {
      case 'low':
        return '#22C55E'; // Green
      case 'medium':
        return '#F59E0B'; // Amber
      case 'high':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  }

  // Format crowd message
  formatCrowdMessage(data: CrowdData): string {
    const icon = this.getCrowdIcon(data.density);
    const trendEmoji = data.trend === 'increasing' ? '📈' : data.trend === 'decreasing' ? '📉' : '➡️';
    return `${icon} ~${data.estimatedCount} people nearby ${trendEmoji}`;
  }
}

export const crowdEstimationService = new CrowdEstimationService();