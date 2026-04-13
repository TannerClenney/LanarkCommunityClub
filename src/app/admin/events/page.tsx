import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import ArchiveButton from "@/components/ui/ArchiveButton";
import {
  archiveEvent,
  hideEventFromMemberHub,
  restoreEvent,
  showEventInMemberHub,
} from "@/app/actions/admin";

export const metadata: Metadata = { title: "Admin – Events" };

async function getEvents() {
  await connection();
  return db.event.findMany({
    orderBy: [{ archived: "asc" }, { startDate: "asc" }],
  });
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage real events, hide placeholder or draft items from members, and archive older items without opening the full editor.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
        >
          + New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-400">No events yet. Create one to get started.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Event</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Flags</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr
                  key={event.id}
                  className={
                    event.archived
                      ? "bg-stone-50"
                      : event.showInMemberHub
                        ? "bg-emerald-50/30 hover:bg-emerald-50/50"
                        : "hover:bg-gray-50"
                  }
                >
                  <td className="px-4 py-3 align-top">
                    <div
                      className={`rounded-lg border px-3 py-2 ${
                        event.showInMemberHub
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-stone-200 bg-stone-50"
                      }`}
                    >
                      <Link href={`/admin/events/${event.id}`} className="font-medium text-green-700 hover:underline">
                        {event.title}
                      </Link>
                      <p
                        className={`mt-1 text-xs font-medium ${
                          event.showInMemberHub ? "text-emerald-700" : "text-stone-600"
                        }`}
                      >
                        {event.showInMemberHub ? "Visible to Members" : "Hidden from Members"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">/{event.slug}</p>
                      {event.location && <p className="mt-1 text-xs text-gray-500">{event.location}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-gray-500">
                    <p>{formatDateTime(event.startDate)}</p>
                    {event.endDate && <p className="text-xs text-gray-400">→ {formatDateTime(event.endDate)}</p>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          event.isPublic ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {event.isPublic ? "Public" : "Private"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          event.showInMemberHub ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {event.showInMemberHub ? "Visible to Members" : "Hidden from Members"}
                      </span>
                      {event.isFeatured && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Featured
                        </span>
                      )}
                      {event.archived && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                          Archived
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    <div className="flex flex-wrap justify-end gap-3">
                      <Link href={`/admin/events/${event.id}`} className="text-xs font-medium text-green-700 hover:underline">
                        Edit
                      </Link>
                      <Link href={`/admin/events/${event.id}/areas`} className="text-xs font-medium text-green-700 hover:underline">
                        Manage Areas
                      </Link>
                      <Link href={`/admin/events/${event.id}/tasks`} className="text-xs font-medium text-green-700 hover:underline">
                        Manage Tasks
                      </Link>
                      <Link href={`/members/events/${event.slug}`} className="text-xs font-medium text-emerald-700 hover:underline">
                        View Event Hub
                      </Link>
                      <ArchiveButton
                        id={event.id}
                        action={event.showInMemberHub ? hideEventFromMemberHub : showEventInMemberHub}
                        label={event.showInMemberHub ? "Hide from Members" : "Show to Members"}
                        className="text-xs text-sky-700 hover:underline disabled:opacity-50"
                      />
                      <ArchiveButton
                        id={event.id}
                        action={event.archived ? restoreEvent : archiveEvent}
                        label={event.archived ? "Restore" : "Archive"}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      />
                    </div>
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
