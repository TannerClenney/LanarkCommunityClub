"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/admin";

type ProjectData = {
  id: string;
  title: string;
  description: string;
  status: string;
  year: number | null;
  imageUrl: string | null;
  isFeatured: boolean;
};

export default function ProjectForm({ project }: { project?: ProjectData }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const result = await createProject(formData);
    if (result.success) {
      router.push("/admin/projects");
      router.refresh();
    } else {
      setStatus("error");
      setError(result.error ?? "Failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input name="title" type="text" required maxLength={200} defaultValue={project?.title}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea name="description" required maxLength={2000} rows={4} defaultValue={project?.description}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none resize-y" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" defaultValue={project?.status ?? "completed"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none">
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
            <option value="planned">Planned</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input name="year" type="number" min="1900" max="2100" defaultValue={project?.year ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input name="imageUrl" type="url" maxLength={500} defaultValue={project?.imageUrl ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input name="isFeatured" type="checkbox" value="true" defaultChecked={project?.isFeatured} className="rounded border-gray-300" />
        Feature on homepage
      </label>
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={status === "loading"}
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-60 transition-colors">
          {status === "loading" ? "Saving…" : "Save Project"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
