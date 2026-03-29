import { Shield, Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <Shield className="w-20 h-20 text-blue-600 mx-auto" />
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">SafeRoute</h1>
        <p className="text-gray-600">Loading your safety navigation system...</p>
      </div>
    </div>
  );
}
