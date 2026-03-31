import type { Metadata } from "next";
import ProjectForm from "../ProjectForm";

export const metadata: Metadata = { title: "Admin – New Project" };

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">New Project</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-2xl">
        <ProjectForm />
      </div>
    </div>
  );
}
