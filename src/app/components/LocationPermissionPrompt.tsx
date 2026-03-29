import { MapPin, AlertCircle, Info, X } from "lucide-react";
import { Button } from "./ui/button";

interface LocationPermissionPromptProps {
  onRequestPermission: () => void;
  onDismiss: () => void;
  error?: string;
}

export function LocationPermissionPrompt({
  onRequestPermission,
  onDismiss,
  error,
}: LocationPermissionPromptProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Location Access Required
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                For your safety monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-red-900">
                  Permission Denied
                </p>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Why we need this
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  SafeRoute needs your location to:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Track your journey in real-time</li>
                  <li>Monitor nearby safety conditions</li>
                  <li>Alert emergency contacts if needed</li>
                  <li>
                    Find nearby police stations & hospitals
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to enable */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">
              How to enable:
            </h4>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>
                Click the location icon in your browser's
                address bar
              </li>
              <li>Select "Allow" or "Always allow"</li>
              <li>
                Click "Enable Location" below to try again
              </li>
            </ol>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 italic">
            🔒 Your location is only used for safety features
            and is never shared without your permission.
          </p>

          {/* Works without location note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡{" "}
              <strong>
                You can still use SafeRoute without location
                access
              </strong>{" "}
              by manually selecting your start and destination
              points on the map or via search.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            onClick={onDismiss}
            variant="outline"
            className="flex-1"
          >
            Continue Without
          </Button>
          <Button
            onClick={onRequestPermission}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Enable Location
          </Button>
        </div>
      </div>
    </div>
  );
}