import { Info } from 'lucide-react';

export function Controls3DInfo() {
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-xs backdrop-blur-sm bg-white/95">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-gray-900">3D Controls</p>
          <ul className="text-gray-600 space-y-0.5">
            <li>• <strong>Rotate:</strong> Left click + drag</li>
            <li>• <strong>Pan:</strong> Right click + drag</li>
            <li>• <strong>Zoom:</strong> Scroll wheel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}