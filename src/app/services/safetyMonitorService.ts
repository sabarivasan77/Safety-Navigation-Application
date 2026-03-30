import { sosService } from "./sosService";

// Safety Monitor Service - Continuous monitoring with escalation
export type SafetyStatus =
  | "safe"
  | "checking"
  | "warning"
  | "critical"
  | "emergency";
export type EscalationLevel = 0 | 1 | 2 | 3 | 4;

export interface SafetyMonitorState {
  status: SafetyStatus;
  isActive: boolean;
  isPaused: boolean;
  lastCheck: number;
  lastResponse: number;
  escalationLevel: EscalationLevel;
  responded: boolean;
  journeyStartTime: number | null;
  checkCount: number;
  demoMode: boolean;
  nextCheckAt: number | null;
}

export interface SafetyMonitorCallbacks {
  onCheck: (level: EscalationLevel) => void;
  onEscalate: (level: EscalationLevel) => void;
  onSOSActivated: () => void;
  onReset: () => void;
}

interface StartMonitoringOptions {
  immediateCheck?: boolean;
}

class SafetyMonitorService {
  private state: SafetyMonitorState = {
    status: "safe",
    isActive: false,
    isPaused: false,
    lastCheck: Date.now(),
    lastResponse: Date.now(),
    escalationLevel: 0,
    responded: true,
    journeyStartTime: null,
    checkCount: 0,
    demoMode: false,
    nextCheckAt: null,
  };

  private nextCheckTimeout: number | null = null;
  private escalationTimeout: number | null = null;
  private callbacks: SafetyMonitorCallbacks | null = null;
  private audioContext: AudioContext | null = null;
  private alarmSound: OscillatorNode | null = null;

  // Timing configuration (in milliseconds)
  private readonly CHECK_INTERVAL = 5 * 60 * 1000;
  private readonly ESCALATION_STEP_1 = 1 * 60 * 1000;
  private readonly ESCALATION_STEP_2 = 2 * 60 * 1000;
  private readonly ESCALATION_STEP_3 = 1 * 60 * 1000;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      )();
    } catch (error) {
      console.warn("AudioContext not supported:", error);
    }
  }

  startMonitoring(
    callbacks: SafetyMonitorCallbacks,
    options: StartMonitoringOptions = {},
  ) {
    this.callbacks = callbacks;

    if (this.state.isActive && !this.state.isPaused) {
      return;
    }

    const now = Date.now();

    this.clearTimers();
    this.stopAlarm();

    this.state = {
      ...this.state,
      isActive: true,
      isPaused: false,
      status: "safe",
      escalationLevel: 0,
      responded: true,
      journeyStartTime: this.state.journeyStartTime ?? now,
      lastCheck: now,
      lastResponse: now,
      nextCheckAt: null,
    };

    if (options.immediateCheck) {
      this.triggerSafetyCheck();
    } else {
      this.scheduleNextCheck(this.CHECK_INTERVAL);
      this.callbacks?.onReset();
    }
  }

  stopMonitoring() {
    this.clearTimers();
    this.stopAlarm();

    this.state = {
      ...this.state,
      isActive: false,
      isPaused: false,
      status: "safe",
      escalationLevel: 0,
      responded: true,
      nextCheckAt: null,
    };

    this.callbacks?.onReset();
  }

  pauseMonitoring() {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.clearTimers();
    this.stopAlarm();

    this.state = {
      ...this.state,
      isPaused: true,
      status: "safe",
      escalationLevel: 0,
      responded: true,
      nextCheckAt: null,
    };

    this.callbacks?.onReset();
  }

  resumeMonitoring() {
    if (!this.state.isActive || !this.state.isPaused) {
      return;
    }

    this.state = {
      ...this.state,
      isPaused: false,
      status: "safe",
      escalationLevel: 0,
      responded: true,
    };

    this.scheduleNextCheck(this.CHECK_INTERVAL);
    this.callbacks?.onReset();
  }

  resetMonitoring() {
    if (!this.state.isActive) {
      return;
    }

    this.clearTimers();
    this.stopAlarm();

    const now = Date.now();

    this.state = {
      ...this.state,
      isPaused: false,
      status: "safe",
      escalationLevel: 0,
      responded: true,
      lastResponse: now,
      nextCheckAt: null,
    };

    this.scheduleNextCheck(this.CHECK_INTERVAL);
    this.callbacks?.onReset();
  }

  setDemoMode(enabled: boolean) {
    this.state = {
      ...this.state,
      demoMode: enabled,
    };
  }

  skipToNextLevel() {
    if (!this.state.demoMode || !this.state.isActive || this.state.isPaused) {
      return;
    }

    if (this.state.escalationLevel === 0) {
      this.triggerSafetyCheck();
      return;
    }

    if (this.state.escalationLevel < 4) {
      this.clearEscalationTimer();
      this.escalate((this.state.escalationLevel + 1) as EscalationLevel);
    }
  }

  userResponded(response: "ok" | "help" | "sos") {
    this.state = {
      ...this.state,
      responded: true,
      lastResponse: Date.now(),
    };

    this.clearEscalationTimer();
    this.stopAlarm();

    switch (response) {
      case "ok":
        this.resetMonitoring();
        break;
      case "help":
        this.state = {
          ...this.state,
          status: "warning",
        };
        this.scheduleNextCheck(this.CHECK_INTERVAL);
        break;
      case "sos":
        this.activateAutoSOS();
        break;
    }
  }

  getState(): SafetyMonitorState {
    return { ...this.state };
  }

  isMonitoring(): boolean {
    return this.state.isActive && !this.state.isPaused;
  }

  getTimeUntilNextCheck(): number {
    if (
      !this.state.isActive ||
      this.state.isPaused ||
      !this.state.nextCheckAt
    ) {
      return 0;
    }

    const remaining = Math.max(0, this.state.nextCheckAt - Date.now());
    return Math.floor(remaining / 1000);
  }

  getJourneyDuration(): number {
    if (!this.state.journeyStartTime) {
      return 0;
    }

    return Math.floor((Date.now() - this.state.journeyStartTime) / 1000);
  }

  private triggerSafetyCheck() {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.clearTimers();

    const now = Date.now();

    this.state = {
      ...this.state,
      checkCount: this.state.checkCount + 1,
      lastCheck: now,
      responded: false,
      escalationLevel: 1,
      status: "checking",
      nextCheckAt: null,
    };

    this.speak("Are you okay?");
    this.playWarningSound();
    this.callbacks?.onCheck(1);
    this.scheduleEscalation(2, this.ESCALATION_STEP_1);
  }

  private scheduleNextCheck(delay: number) {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.clearNextCheckTimer();

    this.state = {
      ...this.state,
      nextCheckAt: Date.now() + delay,
    };

    this.nextCheckTimeout = window.setTimeout(() => {
      this.triggerSafetyCheck();
    }, delay);
  }

  private scheduleEscalation(level: EscalationLevel, delay: number) {
    this.clearEscalationTimer();

    this.escalationTimeout = window.setTimeout(() => {
      if (!this.state.responded && this.state.isActive && !this.state.isPaused) {
        this.escalate(level);
      }
    }, delay);
  }

  private escalate(level: EscalationLevel) {
    this.state = {
      ...this.state,
      escalationLevel: level,
    };

    switch (level) {
      case 2:
        this.state = {
          ...this.state,
          status: "warning",
        };
        this.speak("We did not hear from you. Are you okay?");
        this.playWarningSound();
        this.callbacks?.onEscalate(2);
        this.scheduleEscalation(3, this.ESCALATION_STEP_2);
        break;
      case 3:
        this.state = {
          ...this.state,
          status: "critical",
        };
        this.speak("Please respond. Emergency will be triggered.");
        this.startAlarm();
        this.vibrate([200, 100, 200, 100, 200]);
        this.callbacks?.onEscalate(3);
        this.scheduleEscalation(4, this.ESCALATION_STEP_3);
        break;
      case 4:
        this.state = {
          ...this.state,
          status: "emergency",
        };
        this.activateAutoSOS();
        break;
    }
  }

  private async activateAutoSOS() {
    this.clearTimers();

    this.state = {
      ...this.state,
      status: "emergency",
      escalationLevel: 4,
      nextCheckAt: null,
    };

    this.startAlarm();
    this.vibrate([500, 200, 500, 200, 500]);
    this.speak("Emergency activated. Sending your location now.");

    try {
      await sosService.activateSOS("auto");
    } catch (error) {
      console.error("Failed to activate SOS automatically:", error);
    }

    this.callbacks?.onSOSActivated();
  }

  private playWarningSound() {
    if (!this.audioContext) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.25;

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn("Could not play warning sound:", error);
    }
  }

  private startAlarm() {
    if (!this.audioContext || this.alarmSound) {
      return;
    }

    try {
      this.alarmSound = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      this.alarmSound.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      this.alarmSound.frequency.value = 1000;
      this.alarmSound.type = "square";
      gainNode.gain.value = 0.45;

      const now = this.audioContext.currentTime;
      for (let index = 0; index < 10; index++) {
        gainNode.gain.setValueAtTime(0.45, now + index * 0.5);
        gainNode.gain.setValueAtTime(0, now + index * 0.5 + 0.25);
      }

      this.alarmSound.start(now);
      this.alarmSound.stop(now + 5);

      window.setTimeout(() => {
        if (
          this.state.status === "critical" ||
          this.state.status === "emergency"
        ) {
          this.alarmSound = null;
          this.startAlarm();
        }
      }, 5000);
    } catch (error) {
      console.warn("Could not play alarm:", error);
      this.alarmSound = null;
    }
  }

  private stopAlarm() {
    if (!this.alarmSound) {
      return;
    }

    try {
      this.alarmSound.stop();
    } catch (error) {
      // Already stopped
    }

    this.alarmSound = null;
  }

  private speak(message: string) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn("Voice prompt not available:", error);
    }
  }

  private vibrate(pattern: number[]) {
    if (!("vibrate" in navigator)) {
      return;
    }

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn("Vibration not supported:", error);
    }
  }

  private clearTimers() {
    this.clearNextCheckTimer();
    this.clearEscalationTimer();
  }

  private clearNextCheckTimer() {
    if (this.nextCheckTimeout) {
      clearTimeout(this.nextCheckTimeout);
      this.nextCheckTimeout = null;
    }
  }

  private clearEscalationTimer() {
    if (this.escalationTimeout) {
      clearTimeout(this.escalationTimeout);
      this.escalationTimeout = null;
    }
  }
}

// Export singleton instance
export const safetyMonitorService = new SafetyMonitorService();
