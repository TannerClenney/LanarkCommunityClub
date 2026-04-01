import type { Metadata } from "next";
import { mockProjects } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Community impact projects completed by the Lanark Community Club.",
};

export default function ProjectsPage() {
  const projects = mockProjects;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 bg-stone-50 text-zinc-800">
      <section className="bg-stone-100 border border-emerald-200 rounded-2xl px-6 py-16 md:px-10">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-700 mb-4">Community Projects</h1>
        <p className="text-lg text-zinc-700 max-w-3xl leading-relaxed">
          Here is a look at the community improvement projects the Lanark Community Club has
          undertaken over the years. From park improvements to youth recreation, we are proud
          of what neighbors can build together.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-5">Project Archive</h2>

        {projects.length === 0 ? (
          <p className="text-zinc-600">Project history coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {project.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-[calc(100%+3rem)] h-48 object-cover -mx-6 -mt-6 mb-4 rounded-t-xl"
                  />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-zinc-900 text-lg">{project.title}</h3>
                  {project.isFeatured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>
                {project.year && (
                  <p className="text-xs text-emerald-700 font-semibold mb-2">{project.year}</p>
                )}
                <p className="text-sm text-zinc-700 leading-relaxed">{project.description}</p>
                <span
                  className={`mt-3 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                    project.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : project.status === "ongoing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
