import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EventForm from "../EventForm";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Edit Event</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-2xl">
        <EventForm event={event} />
      </div>
    </div>
  );
}
