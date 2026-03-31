import type { Metadata } from "next";
import { db } from "@/lib/db";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { archiveProject } from "@/app/actions/admin";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin – Projects" };

async function getProjects() {
  return db.project.findMany({
    where: { archived: false },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Projects</h1>
        <Link href="/admin/projects/new"
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400">No projects yet.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400">{p.status} {p.year ? `· ${p.year}` : ""}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/projects/${p.id}`} className="text-xs text-green-700 hover:underline">Edit</Link>
                <ArchiveButton id={p.id} action={archiveProject} label="Archive" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
