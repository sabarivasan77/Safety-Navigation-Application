// Real-time data update service for live monitoring
import { crowdEstimationService } from './crowdEstimationService';
import { SafetyScore } from './safetyService';

export interface RealTimeData {
  timestamp: number;
  crowdDensity: number;
  safetyScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  activeAlerts: number;
}

class RealTimeService {
  private updateInterval: number = 5000; // Update every 5 seconds
  private listeners: Map<string, (data: RealTimeData) => void> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private currentLocation: { lat: number; lon: number } | null = null;

  // Start real-time monitoring
  startMonitoring(location: { lat: number; lon: number }): void {
    this.currentLocation = location;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Initial update
    this.update();

    // Set up periodic updates
    this.intervalId = setInterval(() => {
      this.update();
    }, this.updateInterval);

    console.log('Real-time monitoring started');
  }

  // Stop real-time monitoring
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Real-time monitoring stopped');
  }

  // Subscribe to real-time updates
  subscribe(id: string, callback: (data: RealTimeData) => void): void {
    this.listeners.set(id, callback);
  }

  // Unsubscribe from updates
  unsubscribe(id: string): void {
    this.listeners.delete(id);
  }

  // Perform data update
  private update(): void {
    if (!this.currentLocation) return;

    const data = this.generateRealTimeData();
    
    // Notify all listeners
    this.listeners.forEach(callback => {
      callback(data);
    });
  }

  // Update current location
  updateLocation(location: { lat: number; lon: number }): void {
    this.currentLocation = location;
    this.update(); // Immediate update on location change
  }

  // Generate real-time data
  private generateRealTimeData(): RealTimeData {
    if (!this.currentLocation) {
      return this.getDefaultData();
    }

    const crowdData = crowdEstimationService.estimateCrowd(
      this.currentLocation.lat,
      this.currentLocation.lon
    );

    // Calculate dynamic safety score based on current conditions
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 6;
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);

    let safetyScore = 80; // Base score

    // Adjust for crowd density
    if (crowdData.density === 'High') {
      safetyScore -= 20;
    } else if (crowdData.density === 'Medium') {
      safetyScore -= 10;
    }

    // Adjust for time of day
    if (isNight) {
      safetyScore -= 15;
    }

    // Adjust for rush hour (slightly safer due to more people)
    if (isRushHour && !isNight) {
      safetyScore += 5;
    }

    // Add random variation for realism (-5 to +5)
    safetyScore += Math.random() * 10 - 5;
    safetyScore = Math.max(0, Math.min(100, safetyScore));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (safetyScore >= 70) {
      riskLevel = 'low';
    } else if (safetyScore >= 40) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    // Count active alerts
    const activeAlerts = riskLevel === 'high' ? Math.floor(Math.random() * 3) + 1 : 
                        riskLevel === 'medium' ? Math.floor(Math.random() * 2) : 0;

    return {
      timestamp: Date.now(),
      crowdDensity: crowdData.estimatedCount,
      safetyScore: Math.round(safetyScore),
      riskLevel,
      activeAlerts,
    };
  }

  private getDefaultData(): RealTimeData {
    return {
      timestamp: Date.now(),
      crowdDensity: 0,
      safetyScore: 75,
      riskLevel: 'low',
      activeAlerts: 0,
    };
  }

  // Get current data without waiting for next update
  getCurrentData(): RealTimeData {
    return this.generateRealTimeData();
  }

  // Set update interval (in milliseconds)
  setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
    
    // Restart monitoring if active
    if (this.intervalId && this.currentLocation) {
      this.startMonitoring(this.currentLocation);
    }
  }
}

export const realtimeService = new RealTimeService();
