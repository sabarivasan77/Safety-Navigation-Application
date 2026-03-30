import { useEffect, useState } from "react";
import { EscalationLevel } from "../services/safetyMonitorService";
import { Button } from "./ui/button";
import {
  AlertOctagon,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface SafetyCheckDialogProps {
  level: EscalationLevel;
  onResponse: (response: "ok" | "help" | "sos") => void;
  isVisible: boolean;
  onNextLevel?: () => void;
  showNextLevelButton?: boolean;
}

const countdownByLevel: Record<EscalationLevel, number> = {
  0: 0,
  1: 60,
  2: 120,
  3: 60,
  4: 0,
};

export function SafetyCheckDialog({
  level,
  onResponse,
  isVisible,
  onNextLevel,
  showNextLevelButton = false,
}: SafetyCheckDialogProps) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setCountdown(countdownByLevel[level]);

    const interval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, level]);

  if (!isVisible || level === 0) {
    return null;
  }

  const content = {
    1: {
      icon: <ShieldCheck className="h-14 w-14 text-blue-600" />,
      title: "Are you okay?",
      message:
        "This is your regular 5-minute safety check. Let us know how you are doing.",
      tone: "bg-blue-50 border-blue-200",
      titleTone: "text-blue-900",
      ringTone: "border-blue-300 bg-blue-100 text-blue-800",
      showHelp: true,
      showSos: false,
    },
    2: {
      icon: <ShieldAlert className="h-14 w-14 text-yellow-600" />,
      title: "We didn't hear from you",
      message:
        "Please respond now so we can confirm you are safe before the system escalates.",
      tone: "bg-yellow-50 border-yellow-200",
      titleTone: "text-yellow-900",
      ringTone: "border-yellow-300 bg-yellow-100 text-yellow-800",
      showHelp: false,
      showSos: true,
    },
    3: {
      icon: (
        <AlertTriangle className="h-16 w-16 animate-pulse text-red-600" />
      ),
      title: "Please respond immediately",
      message:
        "Emergency actions are about to start. Confirm you are safe or activate SOS now.",
      tone: "bg-red-50 border-red-200",
      titleTone: "text-red-900",
      ringTone: "border-red-300 bg-red-100 text-red-800",
      showHelp: false,
      showSos: true,
    },
    4: {
      icon: (
        <AlertOctagon className="h-16 w-16 animate-pulse text-red-700" />
      ),
      title: "Emergency activated",
      message:
        "SOS is active. Live location, contacts, and emergency actions have been triggered.",
      tone: "bg-red-100 border-red-300",
      titleTone: "text-red-900",
      ringTone: "border-red-400 bg-red-200 text-red-900",
      showHelp: false,
      showSos: false,
    },
  }[level];

  return (
    <>
      <div className="fixed inset-0 z-[3000] bg-slate-950/40 backdrop-blur-sm" />
      <div className="fixed inset-x-0 bottom-0 z-[3001] flex justify-center p-4 md:bottom-6">
        <div
          className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${content.tone}`}
        >
          <div className="mb-5 flex items-start gap-4">
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              {content.icon}
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${content.titleTone}`}>
                {content.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {content.message}
              </p>
            </div>
          </div>

          {countdown > 0 && level < 4 && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white/70 p-3">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-bold ${content.ringTone}`}
              >
                {countdown}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Escalation countdown
                </p>
                <p className="text-xs text-gray-600">
                  Respond before the timer reaches zero.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {level < 4 && (
              <Button
                onClick={() => onResponse("ok")}
                className="w-full bg-green-600 py-6 text-base font-semibold text-white hover:bg-green-700"
              >
                I'm Safe
              </Button>
            )}

            {content.showHelp && (
              <Button
                onClick={() => onResponse("help")}
                variant="outline"
                className="w-full border-blue-300 py-6 text-base font-semibold text-blue-800 hover:bg-blue-100"
              >
                Need Help
              </Button>
            )}

            {content.showSos && (
              <Button
                onClick={() => onResponse("sos")}
                variant="destructive"
                className="w-full py-6 text-base font-semibold"
              >
                Activate SOS
              </Button>
            )}

            {showNextLevelButton && onNextLevel && level < 4 && (
              <Button
                onClick={onNextLevel}
                variant="outline"
                className="w-full border-violet-300 py-6 text-base font-semibold text-violet-800 hover:bg-violet-100"
              >
                Go Next Level
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
