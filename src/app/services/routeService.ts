// Route service for handling OSRM routing

export interface RoutePoint {
  lat: number;
  lon: number;
}

export interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  geometry: string;
}

class RouteService {
  private osrmUrl = 'https://router.project-osrm.org/route/v1/driving';

  async getRoute(start: RoutePoint, end: RoutePoint): Promise<Route | null> {
    try {
      const url = `${this.osrmUrl}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        return null;
      }

      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
        geometry: JSON.stringify(route.geometry),
      };
    } catch (error) {
      console.error('Route error:', error);
      return null;
    }
  }

  async getAlternativeRoutes(start: RoutePoint, end: RoutePoint): Promise<Route[]> {
    try {
      const url = `${this.osrmUrl}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson&alternatives=3`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes) {
        return [];
      }

      return data.routes.map((route: any) => ({
        coordinates: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
        geometry: JSON.stringify(route.geometry),
      }));
    } catch (error) {
      console.error('Alternative routes error:', error);
      return [];
    }
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }
}

export const routeService = new RouteService();
