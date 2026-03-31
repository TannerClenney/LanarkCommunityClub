import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and recent events hosted by the Lanark Community Club.",
};

export default function EventsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Events</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-gray-700">Events page test is rendering.</p>
      </div>
    </div>
  );
}
