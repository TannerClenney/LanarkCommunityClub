import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Projects",
  description: "Community impact projects completed by the Lanark Community Club.",
};

async function getProjects() {
  await connection();
  return db.project.findMany({
    where: { archived: false },
    orderBy: [{ isFeatured: "desc" }, { year: "desc" }, { createdAt: "desc" }],
  });
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Community Projects</h1>
      <p className="text-gray-600 mb-8">
        Here is a look at the community improvement projects the Lanark Community Club has
        undertaken over the years. From park improvements to youth recreation, we are proud
        of what neighbors can build together.
      </p>

      {projects.length === 0 ? (
        <p className="text-gray-500">Project history coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              {project.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{project.title}</h3>
                  {project.isFeatured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>
                {project.year && (
                  <p className="text-xs text-green-600 font-semibold mb-2">{project.year}</p>
                )}
                <p className="text-sm text-gray-600">{project.description}</p>
                <span
                  className={`mt-3 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                    project.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : project.status === "ongoing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
