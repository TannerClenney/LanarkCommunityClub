import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import AreasManager from "./AreasManager";

export const metadata: Metadata = { title: "Admin – Event Areas" };

export default async function AdminEventAreasPage({
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
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      },
    },
  });

  if (!event) notFound();

  const areas = event.areas.map((area) => ({
    id: area.id,
    name: area.name,
    slug: area.slug,
    description: area.description,
    displayOrder: area.displayOrder,
    taskCount: area._count.tasks,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin/events" className="text-green-700 hover:underline">
          ← Back to Events
        </Link>
        <Link href={`/admin/events/${event.id}/tasks`} className="text-green-700 hover:underline">
          Manage Tasks →
        </Link>
        <Link href={`/members/events/${event.slug}`} className="text-green-700 hover:underline">
          View Event Hub →
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-green-800">Manage Areas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up the work areas for <span className="font-medium text-gray-700">{event.title}</span>. Deleting an area will also remove its tasks.
        </p>
      </div>

      <AreasManager eventId={event.id} areas={areas} />
    </div>
  );
}
