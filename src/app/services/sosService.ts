// SOS Service - Complete emergency response system
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export interface SOSState {
  isActive: boolean;
  activatedAt: number | null;
  method: 'manual' | 'auto' | null;
  currentLocation: LocationData | null;
  trackingInterval: number | null;
  alarmPlaying: boolean;
  contactsNotified: boolean;
  updateCount: number;
}

class SOSService {
  private state: SOSState = {
    isActive: false,
    activatedAt: null,
    method: null,
    currentLocation: null,
    trackingInterval: null,
    alarmPlaying: false,
    contactsNotified: false,
    updateCount: 0,
  };

  private audioContext: AudioContext | null = null;
  private alarmOscillator: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;
  private locationWatchId: number | null = null;
  private emergencyContacts: EmergencyContact[] = [];
  
  private callbacks: {
    onActivated?: () => void;
    onLocationUpdate?: (location: LocationData) => void;
    onContactsNotified?: () => void;
    onDeactivated?: () => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    this.initAudioContext();
    this.loadEmergencyContacts();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }
  }

  // Load emergency contacts from localStorage
  private loadEmergencyContacts() {
    try {
      const stored = localStorage.getItem('emergency_contacts');
      if (stored) {
        this.emergencyContacts = JSON.parse(stored);
      } else {
        // Default demo contacts
        this.emergencyContacts = [
          {
            id: '1',
            name: 'Emergency Contact 1',
            phone: '+91-9876543210',
            relationship: 'Family',
          },
          {
            id: '2',
            name: 'Emergency Contact 2',
            phone: '+91-9876543211',
            relationship: 'Friend',
          },
        ];
        this.saveEmergencyContacts();
      }
    } catch (e) {
      console.error('Error loading contacts:', e);
    }
  }

  private saveEmergencyContacts() {
    try {
      localStorage.setItem('emergency_contacts', JSON.stringify(this.emergencyContacts));
    } catch (e) {
      console.error('Error saving contacts:', e);
    }
  }

  // Add emergency contact
  addContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString(),
    };
    this.emergencyContacts.push(newContact);
    this.saveEmergencyContacts();
    return newContact;
  }

  // Remove emergency contact
  removeContact(id: string) {
    this.emergencyContacts = this.emergencyContacts.filter(c => c.id !== id);
    this.saveEmergencyContacts();
  }

  // Get all contacts
  getContacts(): EmergencyContact[] {
    return [...this.emergencyContacts];
  }

  // Update contact
  updateContact(id: string, updates: Partial<EmergencyContact>) {
    const index = this.emergencyContacts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.emergencyContacts[index] = { ...this.emergencyContacts[index], ...updates };
      this.saveEmergencyContacts();
    }
  }

  // Set callbacks
  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks;
  }

  // Activate SOS (main function)
  async activateSOS(method: 'manual' | 'auto' = 'manual') {
    if (this.state.isActive) {
      console.log('SOS already active');
      return;
    }

    console.log(`🚨 SOS ACTIVATED - Method: ${method}`);
    
    this.state = {
      ...this.state,
      isActive: true,
      activatedAt: Date.now(),
      method,
      updateCount: 0,
    };

    // Execute emergency sequence
    this.playAlarmSound();
    this.vibrateEmergency();
    await this.getCurrentLocation();
    await this.notifyContacts();
    this.startLiveTracking();

    if (this.callbacks.onActivated) {
      this.callbacks.onActivated();
    }
  }

  // Get current location
  private async getCurrentLocation(): Promise<void> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation not supported';
        console.error(error);
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
        resolve();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };

          // Try to get address
          try {
            const address = await this.reverseGeocode(location.lat, location.lng);
            location.address = address;
          } catch (e) {
            console.warn('Could not get address:', e);
          }

          this.state.currentLocation = location;
          
          if (this.callbacks.onLocationUpdate) {
            this.callbacks.onLocationUpdate(location);
          }

          console.log('📍 Location acquired:', location);
          resolve();
        },
        (error) => {
          let errorMessage = 'Could not get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = error.message || 'Unknown location error';
          }
          
          console.error('❌ Error getting location:', {
            code: error.code,
            message: errorMessage,
            error: error
          });
          
          if (this.callbacks.onError) {
            this.callbacks.onError(errorMessage);
          }
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  // Reverse geocode to get address
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SafeRoute-Emergency-App',
          },
        }
      );
      const data = await response.json();
      return data.display_name || 'Address unavailable';
    } catch (e) {
      throw new Error('Geocoding failed');
    }
  }

  // Notify emergency contacts
  private async notifyContacts() {
    if (this.emergencyContacts.length === 0) {
      console.warn('No emergency contacts configured');
      return;
    }

    const location = this.state.currentLocation;
    const locationText = location
      ? `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`
      : 'Location unavailable';

    const message = `🚨 EMERGENCY ALERT!\n\nI need help urgently!\n\nLocation: ${locationText}\n${
      location?.address ? `Address: ${location.address}\n` : ''
    }\nTime: ${new Date().toLocaleString()}\n\nThis is an automated emergency alert from SafeRoute.`;

    console.log('📞 Notifying contacts:', message);

    // In a real app, this would send SMS/push notifications
    // For demo, we'll simulate notifications
    this.emergencyContacts.forEach((contact, index) => {
      setTimeout(() => {
        console.log(`✉️ Alert sent to ${contact.name} (${contact.phone})`);
        
        // Trigger phone call (opens dialer)
        if (index === 0) {
          // Only auto-call the first contact to avoid spam
          this.makeCall(contact.phone);
        }
      }, index * 500);
    });

    this.state.contactsNotified = true;
    
    if (this.callbacks.onContactsNotified) {
      this.callbacks.onContactsNotified();
    }
  }

  // Make phone call
  private makeCall(phoneNumber: string) {
    try {
      // Clean phone number
      const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
      window.location.href = `tel:${cleanNumber}`;
    } catch (e) {
      console.error('Error making call:', e);
    }
  }

  // Start live location tracking (every 10 seconds)
  private startLiveTracking() {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
    }

    // Use watchPosition for continuous tracking
    if (navigator.geolocation) {
      this.locationWatchId = navigator.geolocation.watchPosition(
        async (position) => {
          const location: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };

          // Try to get address
          try {
            const address = await this.reverseGeocode(location.lat, location.lng);
            location.address = address;
          } catch (e) {
            // Address update failed, continue without it
          }

          this.state.currentLocation = location;
          this.state.updateCount++;

          if (this.callbacks.onLocationUpdate) {
            this.callbacks.onLocationUpdate(location);
          }

          console.log(`📍 Location update #${this.state.updateCount}:`, location);

          // Send update to contacts every 5 updates (about 50 seconds)
          if (this.state.updateCount % 5 === 0) {
            this.sendLocationUpdate();
          }
        },
        (error) => {
          let errorMessage = 'Location tracking error';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied during tracking';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable during tracking';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location tracking timeout';
              break;
            default:
              errorMessage = error.message || 'Unknown tracking error';
          }
          
          console.error('❌ Location tracking error:', {
            code: error.code,
            message: errorMessage,
            error: error
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );
    }

    console.log('🔄 Live tracking started');
  }

  // Send location update to contacts
  private sendLocationUpdate() {
    const location = this.state.currentLocation;
    if (!location) return;

    const message = `📍 Location Update #${this.state.updateCount}\n\nLat: ${location.lat.toFixed(
      6
    )}, Lng: ${location.lng.toFixed(6)}\nAccuracy: ${location.accuracy.toFixed(0)}m\n${
      location.address ? `Address: ${location.address}\n` : ''
    }Time: ${new Date().toLocaleString()}`;

    console.log('📡 Sending location update to contacts:', message);
  }

  // Play alarm sound
  private playAlarmSound() {
    if (!this.audioContext) {
      console.warn('Cannot play alarm: AudioContext not available');
      return;
    }

    try {
      // Create oscillator for siren effect
      this.alarmOscillator = this.audioContext.createOscillator();
      this.alarmGain = this.audioContext.createGain();

      this.alarmOscillator.connect(this.alarmGain);
      this.alarmGain.connect(this.audioContext.destination);

      // Siren effect: oscillate between two frequencies
      const now = this.audioContext.currentTime;
      this.alarmOscillator.type = 'sine';
      
      // Create repeating siren pattern
      for (let i = 0; i < 100; i++) {
        const time = now + i * 1.0;
        this.alarmOscillator.frequency.setValueAtTime(800, time);
        this.alarmOscillator.frequency.linearRampToValueAtTime(1200, time + 0.5);
        this.alarmGain.gain.setValueAtTime(0.8, time);
        this.alarmGain.gain.setValueAtTime(0, time + 0.05);
        this.alarmGain.gain.setValueAtTime(0.8, time + 0.1);
      }

      this.alarmOscillator.start(now);
      this.state.alarmPlaying = true;

      console.log('🔊 Alarm sound activated');
    } catch (e) {
      console.error('Error playing alarm:', e);
    }
  }

  // Stop alarm sound
  private stopAlarmSound() {
    if (this.alarmOscillator) {
      try {
        this.alarmOscillator.stop();
      } catch (e) {
        // Already stopped
      }
      this.alarmOscillator = null;
    }
    if (this.alarmGain) {
      this.alarmGain = null;
    }
    this.state.alarmPlaying = false;
    console.log('🔇 Alarm sound stopped');
  }

  // Vibrate emergency pattern
  private vibrateEmergency() {
    if ('vibrate' in navigator) {
      // Long vibration pattern for emergency
      navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
    }
  }

  // Stop SOS
  stopSOS() {
    console.log('🛑 Stopping SOS');

    this.stopAlarmSound();
    
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }

    this.state = {
      isActive: false,
      activatedAt: null,
      method: null,
      currentLocation: null,
      trackingInterval: null,
      alarmPlaying: false,
      contactsNotified: false,
      updateCount: 0,
    };

    if (this.callbacks.onDeactivated) {
      this.callbacks.onDeactivated();
    }
  }

  // Get current state
  getState(): SOSState {
    return { ...this.state };
  }

  // Check if SOS is active
  isActive(): boolean {
    return this.state.isActive;
  }

  // Get duration of active SOS (in seconds)
  getActiveDuration(): number {
    if (!this.state.activatedAt) return 0;
    return Math.floor((Date.now() - this.state.activatedAt) / 1000);
  }

  // Format location for sharing
  getLocationString(): string {
    const loc = this.state.currentLocation;
    if (!loc) return 'Location unavailable';
    
    return `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`;
  }

  // Get Google Maps link
  getMapLink(): string {
    const loc = this.state.currentLocation;
    if (!loc) return '';
    
    return `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
  }
}

// Export singleton instance
export const sosService = new SOSService();