"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/app/actions/admin";

type EventData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  isPublic: boolean;
  isFeatured: boolean;
  showInMemberHub: boolean;
  archived: boolean;
};

function slugifyInput(value: string): string {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue.includes("old settlers")) return "old-settlers-days";
  if (normalizedValue.includes("fall fest")) return "fall-fest";
  if (normalizedValue.includes("say no to snow")) return "say-no-to-snow";
  if (normalizedValue.includes("haunted house")) return "haunted-house";

  return normalizedValue.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function EventForm({ event }: { event?: EventData }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(event?.slug));

  function toDatetimeLocal(date: Date | null | undefined): string {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);

    if (!slugTouched || slug.trim().length === 0) {
      setSlug(slugifyInput(nextTitle));
    }
  }

  function handleSlugChange(nextSlug: string) {
    setSlug(nextSlug);
    setSlugTouched(nextSlug.trim().length > 0);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const formData = new FormData(e.currentTarget);

    if (!String(formData.get("slug") ?? "").trim()) {
      formData.set("slug", slugifyInput(String(formData.get("title") ?? "")));
    }

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
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => handleTitleChange(e.currentTarget.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
        <input
          name="slug"
          type="text"
          required
          maxLength={120}
          value={slug}
          onChange={(e) => handleSlugChange(e.currentTarget.value)}
          onBlur={() => {
            if (!slug.trim()) {
              setSlug(slugifyInput(title));
              setSlugTouched(false);
            }
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">Used in the event link. If you leave it blank while typing a title, it will auto-fill.</p>
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
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="hidden" name="membersOnly" value="false" />
          <input name="membersOnly" type="checkbox" value="true" defaultChecked={event ? !event.isPublic : false}
            className="rounded border-gray-300" />
          Members only
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="hidden" name="isFeatured" value="false" />
          <input name="isFeatured" type="checkbox" value="true" defaultChecked={event?.isFeatured ?? false}
            className="rounded border-gray-300" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="hidden" name="showInMemberHub" value="false" />
          <input name="showInMemberHub" type="checkbox" value="true" defaultChecked={event?.showInMemberHub ?? true}
            className="rounded border-gray-300" />
          Show in member hub
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="hidden" name="archived" value="false" />
          <input name="archived" type="checkbox" value="true" defaultChecked={event?.archived ?? false}
            className="rounded border-gray-300" />
          Archived
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
