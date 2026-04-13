"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { createEventArea, deleteEventArea, updateEventArea } from "@/app/actions/admin";

type AreaData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  taskCount: number;
};

type AreaFormState = {
  name: string;
  slug: string;
  description: string;
  displayOrder: string;
};

const EMPTY_FORM: AreaFormState = {
  name: "",
  slug: "",
  description: "",
  displayOrder: "0",
};

function slugifyInput(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AreasManager({
  eventId,
  areas,
}: {
  eventId: string;
  areas: AreaData[];
}) {
  const router = useRouter();
  const [editingArea, setEditingArea] = useState<AreaData | null>(null);
  const [form, setForm] = useState<AreaFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  function resetForm() {
    setEditingArea(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setStatus("idle");
    setError("");
  }

  function startEditing(area: AreaData) {
    setEditingArea(area);
    setForm({
      name: area.name,
      slug: area.slug,
      description: area.description,
      displayOrder: String(area.displayOrder),
    });
    setSlugTouched(true);
    setStatus("idle");
    setError("");
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: !slugTouched || current.slug.trim().length === 0 ? slugifyInput(value) : current.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const formData = new FormData();
    formData.set("name", form.name);
    formData.set("slug", form.slug.trim() || slugifyInput(form.name));
    formData.set("description", form.description);
    formData.set("displayOrder", form.displayOrder || "0");

    const result = editingArea
      ? await updateEventArea(editingArea.id, eventId, formData)
      : await createEventArea(eventId, formData);

    if (result.success) {
      resetForm();
      router.refresh();
      return;
    }

    setStatus("error");
    setError(result.error ?? "Could not save the area.");
  }

  return (
    <div className="space-y-6">
      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {editingArea ? `Edit ${editingArea.name}` : "Add Area"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.currentTarget.value)}
                required
                maxLength={120}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setForm((current) => ({ ...current, slug: e.currentTarget.value }));
                  setSlugTouched(e.currentTarget.value.trim().length > 0);
                }}
                required
                maxLength={120}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.currentTarget.value }))}
              required
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="max-w-xs">
            <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
            <input
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={(e) => setForm((current) => ({ ...current, displayOrder: e.currentTarget.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {status === "error" && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
            >
              {status === "loading" ? "Saving…" : editingArea ? "Save Area" : "Add Area"}
            </button>
            {(editingArea || form.name || form.slug || form.description) && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {areas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
            No areas yet. Add the first work area for this event.
          </div>
        ) : (
          areas.map((area) => (
            <div key={area.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{area.name}</h3>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">/{area.slug}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                      {area.taskCount} task{area.taskCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{area.description}</p>
                  <p className="mt-2 text-xs text-gray-400">Display order: {area.displayOrder}</p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(area)}
                    className="text-xs font-medium text-green-700 hover:underline"
                  >
                    Edit
                  </button>
                  <ArchiveButton
                    id={area.id}
                    action={deleteEventArea}
                    label="Delete"
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
