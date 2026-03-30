import { useState } from "react";
import {
  Box,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";

interface Scene3DOverlayProps {
  buildingCount: number;
  roadCount: number;
  poiCount: number;
}

export function Scene3DOverlay({
  buildingCount,
  roadCount,
  poiCount,
}: Scene3DOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute left-4 top-20 z-[500] w-[320px] max-w-[calc(100vw-2rem)]">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-sm">
        <button
          onClick={() => setIsOpen((current) => !current)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2">
              <Box className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Simple 3D City View
              </h2>
              <p className="text-xs text-gray-500">
                Stats and route colors
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              {isOpen ? "Hide" : "Show"}
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-gray-200 px-4 py-4">
            <p className="mb-4 text-xs text-gray-600">
              Drag to rotate, scroll to zoom, and move freely around the route.
            </p>

            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Buildings</p>
                <p className="text-lg font-semibold text-slate-900">
                  {buildingCount}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Roads</p>
                <p className="text-lg font-semibold text-slate-900">
                  {roadCount}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Markers</p>
                <p className="text-lg font-semibold text-slate-900">
                  {poiCount}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Route Safety Colors
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-8 rounded-full bg-blue-600" />
                  <span>Normal route</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-8 rounded-full bg-yellow-500" />
                  <span>Medium risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-8 rounded-full bg-red-500" />
                  <span>High risk</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
