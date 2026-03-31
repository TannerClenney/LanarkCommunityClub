"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/app/actions/admin";

type EventData = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  isPublic: boolean;
  isFeatured: boolean;
};

export default function EventForm({ event }: { event?: EventData }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  function toDatetimeLocal(date: Date | null | undefined): string {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = event
      ? await updateEvent(event.id, formData)
      : await createEvent(formData);

    if (result.success) {
      router.push("/admin/events");
      router.refresh();
    } else {
      setStatus("error");
      setError(result.error ?? "Failed to save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input name="title" type="text" required maxLength={200} defaultValue={event?.title}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea name="description" required maxLength={2000} rows={4} defaultValue={event?.description}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none resize-y" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input name="location" type="text" maxLength={200} defaultValue={event?.location ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date/Time *</label>
          <input name="startDate" type="datetime-local" required defaultValue={toDatetimeLocal(event?.startDate)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time</label>
          <input name="endDate" type="datetime-local" defaultValue={toDatetimeLocal(event?.endDate)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="hidden" name="isPublic" value="false" />
          <input name="isPublic" type="checkbox" value="true" defaultChecked={event?.isPublic ?? true}
            className="rounded border-gray-300" />
          Public event
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="hidden" name="isFeatured" value="false" />
          <input name="isFeatured" type="checkbox" value="true" defaultChecked={event?.isFeatured ?? false}
            className="rounded border-gray-300" />
          Featured
        </label>
      </div>
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={status === "loading"}
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-60 transition-colors">
          {status === "loading" ? "Saving…" : event ? "Save Changes" : "Create Event"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
