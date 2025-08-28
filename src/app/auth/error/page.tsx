import { Suspense } from 'react';
import AuthErrorContent from './AuthErrorContent';

// Loading fallback component
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading error page...</p>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthErrorContent />
    </Suspense>
  );
}
