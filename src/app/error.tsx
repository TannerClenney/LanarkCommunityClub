"use client";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Something went wrong</h1>
        <p className="text-gray-500 mb-6">We encountered an error. Please try again.</p>
        <button onClick={reset}
          className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}
