// Map service for handling OpenStreetMap data and Nominatim search

export interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

export interface Building {
  id: string;
  coordinates: [number, number][];
  height: number;
  type: string;
}

export interface Road {
  id: string;
  coordinates: [number, number][];
  type: string;
  width: number;
}

export interface POI {
  id: string;
  lat: number;
  lon: number;
  name: string;
  type: 'police' | 'hospital' | 'petrol';
}

class MapService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org';
  private overpassUrl = 'https://overpass-api.de/api/interpreter';
  private lastRequestTime = 0;
  private minRequestInterval = 2000; // 2 seconds between requests

  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    // Rate limiting: ensure minimum time between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private generateMockBuildings(bounds: { north: number; south: number; east: number; west: number }): Building[] {
    const buildings: Building[] = [];
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLon = (bounds.east + bounds.west) / 2;
    
    // Generate 20-30 mock buildings in a grid pattern
    for (let i = 0; i < 25; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.008;
      const offsetLon = (Math.random() - 0.5) * 0.008;
      const lat = centerLat + offsetLat;
      const lon = centerLon + offsetLon;
      
      // Create a rectangular building footprint
      const size = 0.0001 + Math.random() * 0.0002;
      buildings.push({
        id: `mock-building-${i}`,
        coordinates: [
          [lon - size, lat - size],
          [lon + size, lat - size],
          [lon + size, lat + size],
          [lon - size, lat + size],
          [lon - size, lat - size],
        ],
        height: 8 + Math.random() * 20,
        type: ['residential', 'commercial', 'apartments', 'house'][Math.floor(Math.random() * 4)],
      });
    }
    
    return buildings;
  }

  private generateMockRoads(bounds: { north: number; south: number; east: number; west: number }): Road[] {
    const roads: Road[] = [];
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLon = (bounds.east + bounds.west) / 2;
    
    // Generate main roads in a grid pattern
    for (let i = 0; i < 8; i++) {
      const offset = (i - 4) * 0.002;
      
      // Horizontal road
      roads.push({
        id: `mock-road-h-${i}`,
        coordinates: [
          [bounds.west, centerLat + offset],
          [bounds.east, centerLat + offset],
        ],
        type: i % 2 === 0 ? 'primary' : 'secondary',
        width: i % 2 === 0 ? 10 : 8,
      });
      
      // Vertical road
      roads.push({
        id: `mock-road-v-${i}`,
        coordinates: [
          [centerLon + offset, bounds.south],
          [centerLon + offset, bounds.north],
        ],
        type: i % 2 === 0 ? 'primary' : 'secondary',
        width: i % 2 === 0 ? 10 : 8,
      });
    }
    
    return roads;
  }

  private generateMockPOIs(bounds: { north: number; south: number; east: number; west: number }): POI[] {
    const pois: POI[] = [];
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLon = (bounds.east + bounds.west) / 2;
    
    // Add some mock POIs
    const poiTypes: Array<'police' | 'hospital' | 'petrol'> = ['police', 'hospital', 'petrol'];
    const poiNames = {
      police: ['RS Puram Police Station', 'Gandhipuram Police Station', 'Race Course Police Station'],
      hospital: ['Coimbatore Medical College', 'PSG Hospital', 'GEM Hospital'],
      petrol: ['Indian Oil Petrol Pump', 'HP Petrol Bunk', 'Bharat Petroleum'],
    };
    
    poiTypes.forEach((type, typeIndex) => {
      for (let i = 0; i < 3; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.015;
        const offsetLon = (Math.random() - 0.5) * 0.015;
        
        pois.push({
          id: `mock-poi-${type}-${i}`,
          lat: centerLat + offsetLat,
          lon: centerLon + offsetLon,
          name: poiNames[type][i],
          type,
        });
      }
    });
    
    return pois;
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await this.makeRequest(
        `${this.nominatimUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=10&countrycodes=in&viewbox=76.8,11.4,77.8,10.8&bounded=1`,
        { method: 'GET' }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<SearchResult | null> {
    try {
      const response = await this.makeRequest(
        `${this.nominatimUrl}/reverse?lat=${lat}&lon=${lon}&format=json`,
        { method: 'GET' }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return null;
    }
  }

  async getBuildingsInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<Building[]> {
    // Use mock data to avoid rate limiting from Overpass API
    console.log('Using mock buildings data to avoid API rate limits');
    return this.generateMockBuildings(bounds);
    
    /* Commented out to avoid rate limiting - uncomment for production with proper API key
    const query = `
      [out:json];
      (
        way["building"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        relation["building"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out geom;
    `;

    try {
      const response = await this.makeRequest(this.overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      // Check if response is ok and is JSON
      if (!response.ok) {
        console.error('Buildings fetch failed:', response.status, response.statusText);
        return this.generateMockBuildings(bounds);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Buildings fetch error: Expected JSON but got', contentType);
        return this.generateMockBuildings(bounds);
      }

      const data = await response.json();
      
      if (!data.elements || !Array.isArray(data.elements)) {
        console.error('Buildings fetch error: Invalid response structure');
        return this.generateMockBuildings(bounds);
      }
      
      return data.elements.map((element: any, index: number) => ({
        id: `building-${element.id || index}`,
        coordinates: element.geometry?.map((node: any) => [node.lon, node.lat]) || [],
        height: this.estimateBuildingHeight(element.tags),
        type: element.tags?.building || 'yes',
      })).filter((b: Building) => b.coordinates.length > 0);
    } catch (error) {
      console.error('Buildings fetch error:', error);
      return this.generateMockBuildings(bounds);
    }
    */
  }

  async getRoadsInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<Road[]> {
    // Use mock data to avoid rate limiting from Overpass API
    console.log('Using mock roads data to avoid API rate limits');
    return this.generateMockRoads(bounds);
    
    /* Commented out to avoid rate limiting - uncomment for production with proper API key
    const query = `
      [out:json];
      way["highway"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      out geom;
    `;

    try {
      const response = await this.makeRequest(this.overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      // Check if response is ok and is JSON
      if (!response.ok) {
        console.error('Roads fetch failed:', response.status, response.statusText);
        return this.generateMockRoads(bounds);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Roads fetch error: Expected JSON but got', contentType);
        return this.generateMockRoads(bounds);
      }

      const data = await response.json();
      
      if (!data.elements || !Array.isArray(data.elements)) {
        console.error('Roads fetch error: Invalid response structure');
        return this.generateMockRoads(bounds);
      }
      
      return data.elements.map((element: any, index: number) => ({
        id: `road-${element.id || index}`,
        coordinates: element.geometry?.map((node: any) => [node.lon, node.lat]) || [],
        type: element.tags?.highway || 'unclassified',
        width: this.getRoadWidth(element.tags?.highway),
      })).filter((r: Road) => r.coordinates.length > 1);
    } catch (error) {
      console.error('Roads fetch error:', error);
      return this.generateMockRoads(bounds);
    }
    */
  }

  async getPOIsInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<POI[]> {
    // Use mock data to avoid rate limiting from Overpass API
    console.log('Using mock POIs data to avoid API rate limits');
    return this.generateMockPOIs(bounds);
    
    /* Commented out to avoid rate limiting - uncomment for production with proper API key
    const query = `
      [out:json];
      (
        node["amenity"="police"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["amenity"="hospital"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["amenity"="fuel"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out;
    `;

    try {
      const response = await this.makeRequest(this.overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      // Check if response is ok and is JSON
      if (!response.ok) {
        console.error('POIs fetch failed:', response.status, response.statusText);
        return this.generateMockPOIs(bounds);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('POIs fetch error: Expected JSON but got', contentType);
        return this.generateMockPOIs(bounds);
      }

      const data = await response.json();
      
      if (!data.elements || !Array.isArray(data.elements)) {
        console.error('POIs fetch error: Invalid response structure');
        return this.generateMockPOIs(bounds);
      }
      
      return data.elements.map((element: any) => ({
        id: `poi-${element.id}`,
        lat: element.lat,
        lon: element.lon,
        name: element.tags?.name || 'Unknown',
        type: element.tags?.amenity === 'police' ? 'police' : 
              element.tags?.amenity === 'hospital' ? 'hospital' : 'petrol',
      }));
    } catch (error) {
      console.error('POIs fetch error:', error);
      return this.generateMockPOIs(bounds);
    }
    */
  }

  private estimateBuildingHeight(tags: any): number {
    if (tags?.height) {
      return parseFloat(tags.height);
    }
    if (tags?.['building:levels']) {
      return parseInt(tags['building:levels']) * 3.5;
    }
    
    // Estimate based on building type
    const type = tags?.building;
    switch (type) {
      case 'apartments':
      case 'commercial':
        return 15 + Math.random() * 15;
      case 'house':
      case 'residential':
        return 5 + Math.random() * 5;
      case 'industrial':
        return 8 + Math.random() * 7;
      case 'retail':
        return 6 + Math.random() * 4;
      default:
        return 8 + Math.random() * 12;
    }
  }

  private getRoadWidth(type: string): number {
    switch (type) {
      case 'motorway':
      case 'trunk':
        return 12;
      case 'primary':
        return 10;
      case 'secondary':
        return 8;
      case 'tertiary':
        return 6;
      case 'residential':
      case 'unclassified':
        return 4;
      case 'service':
        return 3;
      default:
        return 4;
    }
  }
}

export const mapService = new MapService();