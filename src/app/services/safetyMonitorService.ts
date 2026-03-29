// Safety Monitor Service - Continuous monitoring with escalation
export type SafetyStatus = 'safe' | 'checking' | 'warning' | 'critical' | 'emergency';
export type EscalationLevel = 0 | 1 | 2 | 3 | 4;

export interface SafetyMonitorState {
  status: SafetyStatus;
  isActive: boolean;
  lastCheck: number;
  lastResponse: number;
  escalationLevel: EscalationLevel;
  responded: boolean;
  journeyStartTime: number | null;
  checkCount: number;
}

export interface SafetyMonitorCallbacks {
  onCheck: (level: EscalationLevel) => void;
  onEscalate: (level: EscalationLevel) => void;
  onSOSActivated: () => void;
  onReset: () => void;
}

class SafetyMonitorService {
  private state: SafetyMonitorState = {
    status: 'safe',
    isActive: false,
    lastCheck: Date.now(),
    lastResponse: Date.now(),
    escalationLevel: 0,
    responded: true,
    journeyStartTime: null,
    checkCount: 0,
  };

  private checkInterval: number | null = null;
  private escalationTimeout: number | null = null;
  private callbacks: SafetyMonitorCallbacks | null = null;
  private audioContext: AudioContext | null = null;
  private alarmSound: OscillatorNode | null = null;

  // Timing configuration (in milliseconds)
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly ESCALATION_STEP_1 = 1 * 60 * 1000; // 1 minute after first check
  private readonly ESCALATION_STEP_2 = 2 * 60 * 1000; // 2 minutes after step 1
  private readonly ESCALATION_STEP_3 = 1 * 60 * 1000; // 1 minute after step 2

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }
  }

  // Start monitoring journey
  startMonitoring(callbacks: SafetyMonitorCallbacks) {
    if (this.state.isActive) {
      console.log('Monitoring already active');
      return;
    }

    this.callbacks = callbacks;
    this.state = {
      ...this.state,
      isActive: true,
      status: 'safe',
      journeyStartTime: Date.now(),
      lastCheck: Date.now(),
      lastResponse: Date.now(),
      checkCount: 0,
    };

    // Start periodic checks
    this.checkInterval = window.setInterval(() => {
      this.triggerSafetyCheck();
    }, this.CHECK_INTERVAL);

    console.log('✅ Safety monitoring started');
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.escalationTimeout) {
      clearTimeout(this.escalationTimeout);
      this.escalationTimeout = null;
    }
    this.stopAlarm();
    
    this.state = {
      ...this.state,
      isActive: false,
      status: 'safe',
      escalationLevel: 0,
      responded: true,
    };

    console.log('🛑 Safety monitoring stopped');
  }

  // Trigger initial safety check
  private triggerSafetyCheck() {
    this.state.checkCount++;
    this.state.lastCheck = Date.now();
    this.state.responded = false;
    this.state.escalationLevel = 1;
    this.state.status = 'checking';

    console.log(`🔔 Safety check #${this.state.checkCount} - Level 1`);

    if (this.callbacks?.onCheck) {
      this.callbacks.onCheck(1);
    }

    // Schedule escalation if no response
    this.scheduleEscalation(2, this.ESCALATION_STEP_1);
  }

  // Schedule next escalation level
  private scheduleEscalation(level: EscalationLevel, delay: number) {
    if (this.escalationTimeout) {
      clearTimeout(this.escalationTimeout);
    }

    this.escalationTimeout = window.setTimeout(() => {
      if (!this.state.responded && this.state.isActive) {
        this.escalate(level);
      }
    }, delay);
  }

  // Escalate to next level
  private escalate(level: EscalationLevel) {
    this.state.escalationLevel = level;

    switch (level) {
      case 2:
        // Level 2: Warning - "We didn't hear from you"
        this.state.status = 'warning';
        console.log('⚠️ Escalation Level 2 - Warning');
        this.playWarningSound();
        if (this.callbacks?.onEscalate) {
          this.callbacks.onEscalate(2);
        }
        // Schedule next escalation
        this.scheduleEscalation(3, this.ESCALATION_STEP_2);
        break;

      case 3:
        // Level 3: Critical - Loud alarm + vibration
        this.state.status = 'critical';
        console.log('🚨 Escalation Level 3 - Critical Alert');
        this.startAlarm();
        this.vibrate([200, 100, 200, 100, 200]);
        if (this.callbacks?.onEscalate) {
          this.callbacks.onEscalate(3);
        }
        // Schedule final escalation (auto SOS)
        this.scheduleEscalation(4, this.ESCALATION_STEP_3);
        break;

      case 4:
        // Level 4: Emergency - Auto activate SOS
        this.state.status = 'emergency';
        console.log('🆘 Escalation Level 4 - AUTO SOS ACTIVATED');
        this.activateAutoSOS();
        break;
    }
  }

  // User responded positively
  userResponded(response: 'ok' | 'help' | 'sos') {
    this.state.responded = true;
    this.state.lastResponse = Date.now();
    this.stopAlarm();

    if (this.escalationTimeout) {
      clearTimeout(this.escalationTimeout);
      this.escalationTimeout = null;
    }

    switch (response) {
      case 'ok':
        // Reset to safe state
        this.state.status = 'safe';
        this.state.escalationLevel = 0;
        console.log('✅ User responded: I\'m OK');
        if (this.callbacks?.onReset) {
          this.callbacks.onReset();
        }
        break;

      case 'help':
        // User needs help but not emergency
        this.state.status = 'warning';
        console.log('⚠️ User needs help');
        break;

      case 'sos':
        // Manual SOS activation
        this.activateAutoSOS();
        break;
    }
  }

  // Activate SOS automatically
  private activateAutoSOS() {
    this.state.status = 'emergency';
    this.state.escalationLevel = 4;
    this.startAlarm();
    this.vibrate([500, 200, 500, 200, 500]);

    if (this.callbacks?.onSOSActivated) {
      this.callbacks.onSOSActivated();
    }

    // Stop monitoring after SOS
    setTimeout(() => {
      this.stopMonitoring();
    }, 5000);
  }

  // Audio alert methods
  private playWarningSound() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (e) {
      console.warn('Could not play warning sound:', e);
    }
  }

  private startAlarm() {
    if (!this.audioContext || this.alarmSound) return;

    try {
      this.alarmSound = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      this.alarmSound.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      this.alarmSound.frequency.value = 1000;
      this.alarmSound.type = 'square';
      gainNode.gain.value = 0.5;

      // Create pulsing effect
      const now = this.audioContext.currentTime;
      for (let i = 0; i < 10; i++) {
        gainNode.gain.setValueAtTime(0.5, now + i * 0.5);
        gainNode.gain.setValueAtTime(0, now + i * 0.5 + 0.25);
      }

      this.alarmSound.start(this.audioContext.currentTime);
      this.alarmSound.stop(this.audioContext.currentTime + 5);

      // Restart alarm after it stops
      setTimeout(() => {
        if (this.state.status === 'critical' || this.state.status === 'emergency') {
          this.alarmSound = null;
          this.startAlarm();
        }
      }, 5000);
    } catch (e) {
      console.warn('Could not play alarm:', e);
    }
  }

  private stopAlarm() {
    if (this.alarmSound) {
      try {
        this.alarmSound.stop();
      } catch (e) {
        // Already stopped
      }
      this.alarmSound = null;
    }
  }

  private vibrate(pattern: number[]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Vibration not supported:', e);
      }
    }
  }

  // Get current state
  getState(): SafetyMonitorState {
    return { ...this.state };
  }

  // Check if monitoring is active
  isMonitoring(): boolean {
    return this.state.isActive;
  }

  // Get time until next check (in seconds)
  getTimeUntilNextCheck(): number {
    if (!this.state.isActive) return 0;
    const elapsed = Date.now() - this.state.lastCheck;
    const remaining = Math.max(0, this.CHECK_INTERVAL - elapsed);
    return Math.floor(remaining / 1000);
  }

  // Get journey duration (in seconds)
  getJourneyDuration(): number {
    if (!this.state.journeyStartTime) return 0;
    return Math.floor((Date.now() - this.state.journeyStartTime) / 1000);
  }
}

// Export singleton instance
export const safetyMonitorService = new SafetyMonitorService();
