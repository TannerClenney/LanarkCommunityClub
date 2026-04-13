import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import TasksManager from "./TasksManager";

export const metadata: Metadata = { title: "Admin – Event Tasks" };

export default async function AdminEventTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      areas: {
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          displayOrder: true,
        },
      },
      tasks: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        include: {
          eventArea: {
            select: { id: true, name: true, slug: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!event) notFound();

  const users = await db.user.findMany({
    where: { role: { not: "PENDING" } },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const tasks = event.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    displayOrder: task.displayOrder,
    ownerId: task.ownerId,
    ownerName: task.owner?.name ?? null,
    eventAreaId: task.eventArea.id,
    eventAreaName: task.eventArea.name,
    eventAreaSlug: task.eventArea.slug,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin/events" className="text-green-700 hover:underline">
          ← Back to Events
        </Link>
        <Link href={`/admin/events/${event.id}/areas`} className="text-green-700 hover:underline">
          Manage Areas →
        </Link>
        <Link href={`/members/events/${event.slug}`} className="text-green-700 hover:underline">
          View Event Hub →
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-green-800">Manage Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track the work list for <span className="font-medium text-gray-700">{event.title}</span>, grouped by event area.
        </p>
      </div>

      <TasksManager eventId={event.id} areas={event.areas} tasks={tasks} users={users} />
    </div>
  );
}
