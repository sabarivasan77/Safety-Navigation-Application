// Comprehensive location database for Coimbatore and Tiruppur regions
export interface LocationData {
  name: string;
  type: 'street' | 'area' | 'landmark' | 'village' | 'hospital' | 'police' | 'market' | 'station';
  lat: number;
  lon: number;
  city: 'Coimbatore' | 'Tiruppur';
  importance: number; // 1-10, higher = more important
}

export const COIMBATORE_TIRUPPUR_LOCATIONS: LocationData[] = [
  // Coimbatore - Major Areas
  { name: 'RS Puram', type: 'area', lat: 11.0051, lon: 76.9550, city: 'Coimbatore', importance: 9 },
  { name: 'Gandhipuram', type: 'area', lat: 11.0176, lon: 76.9674, city: 'Coimbatore', importance: 10 },
  { name: 'Saibaba Colony', type: 'area', lat: 11.0206, lon: 76.9486, city: 'Coimbatore', importance: 8 },
  { name: 'Race Course', type: 'area', lat: 11.0020, lon: 76.9694, city: 'Coimbatore', importance: 8 },
  { name: 'Peelamedu', type: 'area', lat: 11.0294, lon: 77.0072, city: 'Coimbatore', importance: 9 },
  { name: 'Singanallur', type: 'area', lat: 11.0058, lon: 77.0319, city: 'Coimbatore', importance: 8 },
  { name: 'Ganapathy', type: 'area', lat: 11.0454, lon: 76.9717, city: 'Coimbatore', importance: 7 },
  { name: 'Saravanampatti', type: 'area', lat: 11.0778, lon: 77.0034, city: 'Coimbatore', importance: 8 },
  { name: 'Kuniyamuthur', type: 'area', lat: 10.9700, lon: 76.9500, city: 'Coimbatore', importance: 7 },
  { name: 'Podanur', type: 'area', lat: 10.9950, lon: 76.9800, city: 'Coimbatore', importance: 7 },
  { name: 'Ukkadam', type: 'area', lat: 11.0147, lon: 76.9733, city: 'Coimbatore', importance: 7 },
  { name: 'Thudiyalur', type: 'area', lat: 11.0714, lon: 76.9203, city: 'Coimbatore', importance: 6 },
  { name: 'Vadavalli', type: 'area', lat: 11.0269, lon: 76.9047, city: 'Coimbatore', importance: 7 },
  { name: 'Nava India', type: 'area', lat: 11.0550, lon: 77.0450, city: 'Coimbatore', importance: 7 },
  { name: 'Hopes College', type: 'area', lat: 11.0189, lon: 76.9947, city: 'Coimbatore', importance: 6 },
  { name: 'Townhall', type: 'area', lat: 11.0065, lon: 76.9619, city: 'Coimbatore', importance: 8 },
  { name: 'Oppanakara Street', type: 'street', lat: 11.0075, lon: 76.9605, city: 'Coimbatore', importance: 7 },
  { name: 'Big Bazaar Street', type: 'street', lat: 11.0085, lon: 76.9615, city: 'Coimbatore', importance: 7 },
  { name: 'Brookefields', type: 'area', lat: 11.0336, lon: 77.0461, city: 'Coimbatore', importance: 8 },
  { name: 'Ramanathapuram', type: 'area', lat: 11.0292, lon: 77.0239, city: 'Coimbatore', importance: 7 },

  // Coimbatore - Landmarks
  { name: 'Coimbatore Junction Railway Station', type: 'station', lat: 11.0078, lon: 76.9633, city: 'Coimbatore', importance: 10 },
  { name: 'Gandhipuram Bus Stand', type: 'station', lat: 11.0175, lon: 76.9670, city: 'Coimbatore', importance: 10 },
  { name: 'Singanallur Bus Stand', type: 'station', lat: 11.0060, lon: 77.0320, city: 'Coimbatore', importance: 8 },
  { name: 'Ukkadam Bus Stand', type: 'station', lat: 11.0150, lon: 76.9730, city: 'Coimbatore', importance: 9 },
  { name: 'Brookefields Mall', type: 'landmark', lat: 11.0333, lon: 77.0466, city: 'Coimbatore', importance: 8 },
  { name: 'Fun Mall', type: 'landmark', lat: 11.0215, lon: 76.9485, city: 'Coimbatore', importance: 7 },
  { name: 'Prozone Mall', type: 'landmark', lat: 11.0060, lon: 76.9700, city: 'Coimbatore', importance: 7 },
  { name: 'VOC Park', type: 'landmark', lat: 11.0022, lon: 76.9686, city: 'Coimbatore', importance: 7 },
  { name: 'Marudhamalai Temple', type: 'landmark', lat: 11.0422, lon: 76.8700, city: 'Coimbatore', importance: 8 },
  { name: 'Perur Temple', type: 'landmark', lat: 11.0211, lon: 76.8947, city: 'Coimbatore', importance: 7 },
  { name: 'Gedee Car Museum', type: 'landmark', lat: 11.0330, lon: 76.8950, city: 'Coimbatore', importance: 6 },
  { name: 'Kovai Kutralam Falls', type: 'landmark', lat: 10.9028, lon: 76.8833, city: 'Coimbatore', importance: 7 },
  { name: 'Gass Forest Museum', type: 'landmark', lat: 11.0058, lon: 76.9550, city: 'Coimbatore', importance: 6 },

  // Coimbatore - Hospitals
  { name: 'Coimbatore Medical College Hospital', type: 'hospital', lat: 11.0040, lon: 76.9560, city: 'Coimbatore', importance: 9 },
  { name: 'PSG Hospital', type: 'hospital', lat: 11.0208, lon: 77.0031, city: 'Coimbatore', importance: 9 },
  { name: 'Kovai Medical Center', type: 'hospital', lat: 11.0089, lon: 76.9736, city: 'Coimbatore', importance: 9 },
  { name: 'GKNM Hospital', type: 'hospital', lat: 11.0008, lon: 76.9717, city: 'Coimbatore', importance: 8 },
  { name: 'Kongunad Hospital', type: 'hospital', lat: 11.0300, lon: 77.0200, city: 'Coimbatore', importance: 7 },
  { name: 'Sri Ramakrishna Hospital', type: 'hospital', lat: 11.0100, lon: 76.9500, city: 'Coimbatore', importance: 8 },

  // Coimbatore - Police Stations
  { name: 'Coimbatore City Police Commissioner Office', type: 'police', lat: 11.0080, lon: 76.9640, city: 'Coimbatore', importance: 9 },
  { name: 'RS Puram Police Station', type: 'police', lat: 11.0060, lon: 76.9540, city: 'Coimbatore', importance: 8 },
  { name: 'Gandhipuram Police Station', type: 'police', lat: 11.0180, lon: 76.9680, city: 'Coimbatore', importance: 8 },
  { name: 'Peelamedu Police Station', type: 'police', lat: 11.0290, lon: 77.0070, city: 'Coimbatore', importance: 7 },
  { name: 'Singanallur Police Station', type: 'police', lat: 11.0050, lon: 77.0310, city: 'Coimbatore', importance: 7 },

  // Coimbatore - Markets
  { name: 'Gandhipuram Market', type: 'market', lat: 11.0170, lon: 76.9665, city: 'Coimbatore', importance: 8 },
  { name: 'Uppilipalayam Flower Market', type: 'market', lat: 11.0344, lon: 76.9678, city: 'Coimbatore', importance: 7 },
  { name: 'Town Hall Market', type: 'market', lat: 11.0070, lon: 76.9610, city: 'Coimbatore', importance: 8 },
  { name: 'Ukkadam Market', type: 'market', lat: 11.0140, lon: 76.9720, city: 'Coimbatore', importance: 7 },

  // Coimbatore - Streets
  { name: 'Avanashi Road', type: 'street', lat: 11.0100, lon: 76.9800, city: 'Coimbatore', importance: 8 },
  { name: 'DB Road', type: 'street', lat: 11.0050, lon: 76.9600, city: 'Coimbatore', importance: 8 },
  { name: 'Trichy Road', type: 'street', lat: 11.0200, lon: 77.0100, city: 'Coimbatore', importance: 8 },
  { name: 'Mettupalayam Road', type: 'street', lat: 11.0400, lon: 76.9600, city: 'Coimbatore', importance: 7 },
  { name: 'Sathy Road', type: 'street', lat: 11.0600, lon: 77.0200, city: 'Coimbatore', importance: 7 },
  { name: 'Palakkad Road', type: 'street', lat: 10.9900, lon: 76.9400, city: 'Coimbatore', importance: 7 },

  // Tiruppur - Major Areas
  { name: 'Tiruppur Town', type: 'area', lat: 11.1085, lon: 77.3411, city: 'Tiruppur', importance: 10 },
  { name: 'Avinashi Road Tiruppur', type: 'area', lat: 11.1050, lon: 77.3500, city: 'Tiruppur', importance: 8 },
  { name: 'Kangeyam Road', type: 'area', lat: 11.1100, lon: 77.3300, city: 'Tiruppur', importance: 7 },
  { name: 'Kumaran Road', type: 'area', lat: 11.1070, lon: 77.3380, city: 'Tiruppur', importance: 7 },
  { name: 'Palladam Road', type: 'area', lat: 11.1000, lon: 77.3200, city: 'Tiruppur', importance: 7 },
  { name: 'Mangalam Road', type: 'area', lat: 11.1120, lon: 77.3450, city: 'Tiruppur', importance: 7 },
  { name: 'Velampalayam', type: 'area', lat: 11.0950, lon: 77.3350, city: 'Tiruppur', importance: 6 },
  { name: 'Tiruppur New Bus Stand', type: 'station', lat: 11.1100, lon: 77.3420, city: 'Tiruppur', importance: 9 },
  { name: 'Tiruppur Railway Station', type: 'station', lat: 11.0977, lon: 77.3432, city: 'Tiruppur', importance: 9 },

  // Tiruppur - Landmarks
  { name: 'Noyyal River', type: 'landmark', lat: 11.1050, lon: 77.3250, city: 'Tiruppur', importance: 7 },
  { name: 'Tiruppur Kumaran Statue', type: 'landmark', lat: 11.1080, lon: 77.3400, city: 'Tiruppur', importance: 8 },
  { name: 'VOC Ground Tiruppur', type: 'landmark', lat: 11.1060, lon: 77.3380, city: 'Tiruppur', importance: 6 },

  // Tiruppur - Hospitals
  { name: 'Tiruppur Government Hospital', type: 'hospital', lat: 11.1090, lon: 77.3390, city: 'Tiruppur', importance: 8 },
  { name: 'G.Kuppuswamy Naidu Memorial Hospital Tiruppur', type: 'hospital', lat: 11.1070, lon: 77.3420, city: 'Tiruppur', importance: 7 },

  // Tiruppur - Police Stations
  { name: 'Tiruppur Town Police Station', type: 'police', lat: 11.1080, lon: 77.3410, city: 'Tiruppur', importance: 8 },
  { name: 'Tiruppur East Police Station', type: 'police', lat: 11.1100, lon: 77.3450, city: 'Tiruppur', importance: 7 },

  // Villages around Coimbatore
  { name: 'Madukkarai', type: 'village', lat: 10.9100, lon: 76.9600, city: 'Coimbatore', importance: 6 },
  { name: 'Sulur', type: 'village', lat: 11.0333, lon: 77.1333, city: 'Coimbatore', importance: 7 },
  { name: 'Irugur', type: 'village', lat: 11.0189, lon: 77.0711, city: 'Coimbatore', importance: 6 },
  { name: 'Karamadai', type: 'village', lat: 11.2419, lon: 76.9608, city: 'Coimbatore', importance: 6 },
  { name: 'Mettupalayam', type: 'village', lat: 11.2989, lon: 76.9444, city: 'Coimbatore', importance: 7 },
  { name: 'Pollachi', type: 'village', lat: 10.6581, lon: 77.0089, city: 'Coimbatore', importance: 8 },
  { name: 'Annur', type: 'village', lat: 11.2342, lon: 77.1061, city: 'Coimbatore', importance: 6 },
  { name: 'Kinathukadavu', type: 'village', lat: 10.7794, lon: 77.0292, city: 'Coimbatore', importance: 5 },
  { name: 'Madathukulam', type: 'village', lat: 10.5522, lon: 77.4478, city: 'Coimbatore', importance: 5 },
  { name: 'Valparai', type: 'village', lat: 10.3267, lon: 76.9500, city: 'Coimbatore', importance: 6 },

  // Villages around Tiruppur
  { name: 'Avinashi', type: 'village', lat: 11.1933, lon: 77.2686, city: 'Tiruppur', importance: 7 },
  { name: 'Palladam', type: 'village', lat: 10.9906, lon: 77.2839, city: 'Tiruppur', importance: 6 },
  { name: 'Kangeyam', type: 'village', lat: 11.0078, lon: 77.5656, city: 'Tiruppur', importance: 6 },
  { name: 'Dharapuram', type: 'village', lat: 10.7372, lon: 77.5314, city: 'Tiruppur', importance: 6 },
  { name: 'Udumalpet', type: 'village', lat: 10.5869, lon: 77.2486, city: 'Tiruppur', importance: 6 },
];

// Helper function to search locations
export function searchLocations(query: string, limit: number = 10): LocationData[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // Filter and score matches
  const matches = COIMBATORE_TIRUPPUR_LOCATIONS.map(location => {
    const nameLower = location.name.toLowerCase();
    let score = 0;
    
    // Exact match (highest priority)
    if (nameLower === lowerQuery) {
      score = 1000 + location.importance;
    }
    // Starts with query
    else if (nameLower.startsWith(lowerQuery)) {
      score = 500 + location.importance;
    }
    // Contains query
    else if (nameLower.includes(lowerQuery)) {
      score = 100 + location.importance;
    }
    
    return { location, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit)
  .map(item => item.location);
  
  return matches;
}
