"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { createEventTask, deleteEventTask, updateEventTask } from "@/app/actions/admin";

type AreaOption = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
};

type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: "OPEN" | "OWNED" | "DONE";
  displayOrder: number;
  ownerId: string | null;
  ownerName: string | null;
  eventAreaId: string;
  eventAreaName: string;
  eventAreaSlug: string;
};

type UserOption = {
  id: string;
  name: string | null;
  email: string;
};

type TaskFormState = {
  title: string;
  description: string;
  eventAreaId: string;
  status: "OPEN" | "OWNED" | "DONE";
  ownerId: string;
  displayOrder: string;
};

const EMPTY_FORM: TaskFormState = {
  title: "",
  description: "",
  eventAreaId: "",
  status: "OPEN",
  ownerId: "",
  displayOrder: "0",
};

function statusClasses(status: TaskItem["status"]) {
  switch (status) {
    case "DONE":
      return "bg-stone-200 text-stone-700";
    case "OWNED":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function TasksManager({
  eventId,
  areas,
  tasks,
  users,
}: {
  eventId: string;
  areas: AreaOption[];
  tasks: TaskItem[];
  users: UserOption[];
}) {
  const router = useRouter();
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [form, setForm] = useState<TaskFormState>({
    ...EMPTY_FORM,
    eventAreaId: areas[0]?.id ?? "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const groupedTasks = useMemo(
    () =>
      areas.map((area) => ({
        area,
        tasks: tasks
          .filter((task) => task.eventAreaId === area.id)
          .sort((left, right) => left.displayOrder - right.displayOrder || left.title.localeCompare(right.title)),
      })),
    [areas, tasks],
  );

  function resetForm() {
    setEditingTask(null);
    setForm({
      ...EMPTY_FORM,
      eventAreaId: areas[0]?.id ?? "",
    });
    setStatus("idle");
    setError("");
  }

  function startEditing(task: TaskItem) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      eventAreaId: task.eventAreaId,
      status: task.status,
      ownerId: task.ownerId ?? "",
      displayOrder: String(task.displayOrder),
    });
    setStatus("idle");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const formData = new FormData();
    formData.set("title", form.title);
    formData.set("description", form.description);
    formData.set("eventAreaId", form.eventAreaId);
    formData.set("status", form.status);
    formData.set("ownerId", form.ownerId);
    formData.set("displayOrder", form.displayOrder || "0");

    const result = editingTask
      ? await updateEventTask(editingTask.id, eventId, formData)
      : await createEventTask(eventId, formData);

    if (result.success) {
      resetForm();
      router.refresh();
      return;
    }

    setStatus("error");
    setError(result.error ?? "Could not save the task.");
  }

  if (areas.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Add at least one area before creating tasks for this event.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {editingTask ? `Edit ${editingTask.title}` : "Add Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.currentTarget.value }))}
              required
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description / Next Step</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.currentTarget.value }))}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Area *</label>
              <select
                value={form.eventAreaId}
                onChange={(e) => setForm((current) => ({ ...current, eventAreaId: e.currentTarget.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((current) => ({ ...current, status: e.currentTarget.value as TaskFormState["status"] }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="OPEN">Open</option>
                <option value="OWNED">Owned</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Owner</label>
              <select
                value={form.ownerId}
                onChange={(e) => setForm((current) => ({ ...current, ownerId: e.currentTarget.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name ?? user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
              <input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={(e) => setForm((current) => ({ ...current, displayOrder: e.currentTarget.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {status === "error" && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
            >
              {status === "loading" ? "Saving…" : editingTask ? "Save Task" : "Add Task"}
            </button>
            {(editingTask || form.title || form.description) && (
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

      <div className="space-y-4">
        {groupedTasks.map(({ area, tasks: areaTasks }) => (
          <section key={area.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{area.name}</h3>
                <p className="text-xs text-gray-500">/{area.slug}</p>
              </div>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                {areaTasks.length} task{areaTasks.length === 1 ? "" : "s"}
              </span>
            </div>

            {areaTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks in this area yet.</p>
            ) : (
              <div className="space-y-3">
                {areaTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(task.status)}`}>
                            {task.status === "OPEN" ? "Open" : task.status === "OWNED" ? "Owned" : "Done"}
                          </span>
                        </div>
                        {task.description && <p className="mt-1 text-sm text-gray-600">{task.description}</p>}
                        <p className="mt-2 text-xs text-gray-400">
                          {task.ownerName ? `Owner: ${task.ownerName}` : "Owner: Unassigned"} · Display order: {task.displayOrder}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => startEditing(task)}
                          className="text-xs font-medium text-green-700 hover:underline"
                        >
                          Edit
                        </button>
                        <ArchiveButton
                          id={task.id}
                          action={deleteEventTask}
                          label="Delete"
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
