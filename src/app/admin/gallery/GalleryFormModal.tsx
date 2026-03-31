"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGalleryItem } from "@/app/actions/admin";

export default function GalleryFormModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const result = await createGalleryItem(formData);
    if (result.success) {
      setOpen(false);
      setStatus("idle");
      router.refresh();
    } else {
      setStatus("error");
      setError(result.error ?? "Failed.");
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
        + Add Photo
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Gallery Photo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input name="title" type="text" required maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input name="imageUrl" type="url" required maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <input name="caption" type="text" maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none">
                  <option value="">— Select —</option>
                  <option value="events">Events</option>
                  <option value="projects">Projects</option>
                  <option value="history">History</option>
                  <option value="general">General</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input name="featured" type="checkbox" value="true" className="rounded border-gray-300" />
                Feature this photo
              </label>
              {status === "error" && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={status === "loading"}
                  className="px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-60">
                  {status === "loading" ? "Saving…" : "Add Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
