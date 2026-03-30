import { useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  SkipForward,
} from "lucide-react";

interface SafetyMonitorControlProps {
  isActive: boolean;
  isPaused: boolean;
  demoMode: boolean;
  escalationLevel: 0 | 1 | 2 | 3 | 4;
  nextCheckInSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onToggleDemoMode: () => void;
  onSkipLevel: () => void;
}

const levelStyles = {
  0: {
    badge: "Ready",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
  },
  1: {
    badge: "Level 1",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
  },
  2: {
    badge: "Level 2",
    tone: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  3: {
    badge: "Level 3",
    tone: "bg-orange-50 text-orange-700 border-orange-200",
  },
  4: {
    badge: "SOS",
    tone: "bg-red-50 text-red-700 border-red-200",
  },
} as const;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function SafetyMonitorControl({
  isActive,
  isPaused,
  demoMode,
  escalationLevel,
  nextCheckInSeconds,
  onStart,
  onPause,
  onReset,
  onToggleDemoMode,
  onSkipLevel,
}: SafetyMonitorControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const statusStyle = levelStyles[escalationLevel];
  const isRunning = isActive && !isPaused;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm transition-colors hover:bg-slate-50"
      >
        <div className="rounded-xl bg-blue-50 p-2">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <div className="text-left">
          <div className="text-sm font-bold text-gray-900">
            Safety Monitor
          </div>
          <div className="text-xs text-gray-500">
            Open controls
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.tone}`}
        >
          {statusStyle.badge}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>
    );
  }

  return (
    <div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Safety Monitor
            </h3>
          </div>
          <p className="mt-1 text-xs text-gray-600">
            5-minute check-ins with automatic escalation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.tone}`}
          >
            {statusStyle.badge}
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-slate-100 hover:text-gray-700"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">State</p>
          <p className="mt-1 font-semibold text-slate-800">
            {!isActive ? "Stopped" : isPaused ? "Paused" : "Active"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Next Check</p>
          <p className="mt-1 font-semibold text-slate-800">
            {isRunning ? formatTime(nextCheckInSeconds) : "--:--"}
          </p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Button
          onClick={onStart}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Play className="mr-2 h-4 w-4" />
          {isActive ? "Restart" : "Start"}
        </Button>
        <Button
          onClick={onPause}
          variant="outline"
          disabled={!isActive}
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-50"
        >
          <Pause className="mr-2 h-4 w-4" />
          {isPaused ? "Resume" : "Pause"}
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          disabled={!isActive}
          className="border-slate-300 hover:bg-slate-50"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button
          onClick={onToggleDemoMode}
          variant={demoMode ? "default" : "outline"}
          className={
            demoMode
              ? "bg-violet-600 text-white hover:bg-violet-700"
              : "border-violet-300 text-violet-800 hover:bg-violet-50"
          }
        >
          <ShieldAlert className="mr-2 h-4 w-4" />
          Demo {demoMode ? "On" : "Off"}
        </Button>
      </div>

      <Button
        onClick={onSkipLevel}
        disabled={!demoMode || !isActive || escalationLevel === 4}
        className="w-full bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-500"
      >
        <SkipForward className="mr-2 h-4 w-4" />
        Demo / Skip To Next Level
      </Button>

      <p className="mt-3 text-[11px] leading-5 text-gray-500">
        Demo skip only works when demo mode is on and does not change the real
        timing configuration.
      </p>
    </div>
  );
}
