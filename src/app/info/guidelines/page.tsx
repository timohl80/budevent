import { Suspense } from 'react';
import GuidelinesPageContent from './GuidelinesPageContent';

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111827] to-[#1F2937] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-300">Loading Event Guidelines...</p>
      </div>
    </main>
  );
}

export default function GuidelinesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GuidelinesPageContent />
    </Suspense>
  );
}
