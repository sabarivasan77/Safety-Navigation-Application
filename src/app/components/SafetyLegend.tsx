import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function SafetyLegend() {
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-xs">
      <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
        <Shield className="w-3 h-3 mr-1" />
        Safety Zones
      </h3>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-700">Safe Zone (70%+)</span>
          <CheckCircle className="w-3 h-3 text-green-600 ml-auto flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0" />
          <span className="text-xs text-gray-700">Moderate (50-70%)</span>
          <Shield className="w-3 h-3 text-yellow-600 ml-auto flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-xs text-gray-700">Risk Zone (&lt;50%)</span>
          <AlertTriangle className="w-3 h-3 text-red-600 ml-auto flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}