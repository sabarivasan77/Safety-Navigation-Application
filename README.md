# SafeRoute - Smart Safety Navigation System

A production-grade, mobile-first safety navigation application focused on the Coimbatore and Tiruppur regions. This app combines real-world map data, realistic 3D simulation, and intelligent safety analysis to recommend the safest routes.

## 🎯 Features

### Core Functionality
- **Real-time 2D Map Navigation** - Powered by OpenStreetMap and Leaflet
- **Realistic 3D City Simulation** - Built with React Three Fiber
- **Intelligent Safety Analysis** - Multi-factor route safety scoring
- **Alternative Route Suggestions** - Multiple routes with safety comparisons

### Safety Features
- **SOS Emergency System** - One-tap emergency alert with location sharing
- **Audio Safety Check** - Voice-based safety verification
- **AI Chat Assistant** - Quick answers to safety questions
- **Risk Zone Visualization** - Color-coded safety zones (Green/Yellow/Red)
- **Nearby Services** - Real-time display of police stations, hospitals, and petrol stations

### Technical Highlights
- **Mobile-First Design** - Fully responsive across all devices
- **Performance Optimized** - Lazy loading, instancing, and efficient rendering
- **Real Map Data** - Live data from OpenStreetMap and OSRM
- **3D Visualization** - Buildings, roads, street lights, people, and vehicles

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **2D Maps**: Leaflet.js + React Leaflet
- **3D Graphics**: React Three Fiber + Three.js + Drei
- **Routing**: OSRM (Open Source Routing Machine)
- **Search**: Nominatim (OpenStreetMap)
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── 3d/                    # 3D visualization components
│   │   ├── Scene.tsx          # Main 3D scene
│   │   ├── Buildings.tsx      # Building meshes
│   │   ├── Roads.tsx          # Road visualization
│   │   ├── StreetLights.tsx   # Street lighting
│   │   ├── People.tsx         # Animated people
│   │   └── Vehicles.tsx       # Moving vehicles
│   │
│   ├── components/            # UI components
│   │   ├── MapView.tsx        # 2D map interface
│   │   ├── SearchBar.tsx      # Location search
│   │   ├── RoutePanel.tsx     # Route comparison
│   │   ├── SOSButton.tsx      # Emergency SOS
│   │   ├── AudioSafety.tsx    # Audio check
│   │   ├── ChatAssistant.tsx  # AI chat helper
│   │   └── SafetyLegend.tsx   # Map legend
│   │
│   ├── services/              # Business logic
│   │   ├── mapService.ts      # OSM data fetching
│   │   ├── routeService.ts    # Route calculation
│   │   └── safetyService.ts   # Safety analysis
│   │
│   ├── utils/                 # Utility functions
│   │   └── geolocation.ts     # Location utilities
│   │
│   └── App.tsx                # Main application
│
└── styles/                    # Global styles
```

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 🎨 Design System

- **Background**: `#F8FAFC`
- **Primary**: `#2563EB` (Blue)
- **Success/Safe**: `#22C55E` (Green)
- **Warning/Moderate**: `#EAB308` (Yellow)
- **Danger/Risk**: `#EF4444` (Red)

## 🔒 Safety Analysis

The safety score is calculated based on:
- **Crowd Density** (25%) - Time-based and location-based analysis
- **Infrastructure** (25%) - Road quality and area development
- **Proximity to Help** (30%) - Distance to emergency services
- **Lighting** (20%) - Street lighting and time of day

## 📱 Key User Flows

1. **Search & Navigate**
   - Enter start and destination
   - View multiple route options
   - Compare safety scores
   - Select safest route

2. **Emergency SOS**
   - Tap SOS button
   - View current location
   - See nearby police stations
   - Call emergency services

3. **Safety Check**
   - Audio safety verification
   - Chat with AI assistant
   - View risk zones
   - Get safety recommendations

## 🌐 APIs Used

- **OpenStreetMap Overpass API** - Building and road data
- **Nominatim** - Location search and geocoding
- **OSRM** - Route calculation and directions

## 📊 3D Simulation Accuracy

The 3D environment achieves ≥50% real-world resemblance through:
- Real building footprints from OSM
- Accurate road alignments
- Realistic height estimation
- Dynamic street lighting
- Animated people and vehicles

## 🔮 Future Enhancements

- Real-time crime data integration
- User-contributed safety reports
- Historical safety analytics
- Offline map support
- Multi-language support
- Dark mode support

## 📄 License

This project is created as a prototype for safety navigation demonstration.

## 🙏 Acknowledgments

- OpenStreetMap contributors
- OSRM project
- React Three Fiber community
- Leaflet.js team
