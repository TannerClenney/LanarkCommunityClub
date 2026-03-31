import type { Metadata } from "next";
import EventForm from "../EventForm";

export const metadata: Metadata = { title: "Admin – New Event" };

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">New Event</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-2xl">
        <EventForm />
      </div>
    </div>
  );
}
