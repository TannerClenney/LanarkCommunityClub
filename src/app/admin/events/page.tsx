import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { archiveEvent } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Admin – Events" };

async function getEvents() {
  await connection();
  return db.event.findMany({
    where: { archived: false },
    orderBy: { startDate: "asc" },
  });
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
        >
          + New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-400">No events. Create one to get started.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Visibility</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${event.id}`} className="font-medium text-green-700 hover:underline">
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(event.startDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      event.isPublic ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {event.isPublic ? "Public" : "Members"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ArchiveButton id={event.id} action={archiveEvent} label="Archive" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
