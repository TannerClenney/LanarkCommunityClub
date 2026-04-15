import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MockTaskList } from "@/components/ui/MockTaskOwnership";
import { db } from "@/lib/db";
import { createAreaTask } from "@/app/actions/member-hub";
import {
  getFallbackMemberEvents,
  getMemberArea,
  getMemberHubEvent,
  memberHubEvents,
} from "@/lib/member-hub";
import { buildMemberHubEventFromDatabase, ensureMemberHubEventData, isSeededMemberHubEventSlug } from "@/lib/member-hub-server";

async function getAreaPageData(eventSlug: string, areaSlug: string) {
  await connection();

  if (isSeededMemberHubEventSlug(eventSlug)) {
    await ensureMemberHubEventData(eventSlug);
  }

  const events = await db.event.findMany({
    where: { archived: false, showInMemberHub: true },
    orderBy: { startDate: "asc" },
  });

  const dbEvent = events.find((event) => event.slug === eventSlug);
  const fallbackPreview = dbEvent
    ? {
        slug: eventSlug,
        title: dbEvent.title,
        description: dbEvent.description,
        location: dbEvent.location ?? undefined,
      }
    : getFallbackMemberEvents().find((event) => event.slug === eventSlug);

  const hasSeededHubData = memberHubEvents.some((event) => event.slug === eventSlug);

  if (!dbEvent && !fallbackPreview && !hasSeededHubData) {
    notFound();
  }

  const dbArea = dbEvent
    ? await db.eventArea.findFirst({
        where: {
          eventId: dbEvent.id,
          slug: areaSlug,
        },
        include: {
          tasks: {
            where: {
              eventId: dbEvent.id,
            },
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            include: { owner: { select: { name: true } } },
          },
        },
      })
    : null;

  const event =
    dbEvent && dbArea
      ? buildMemberHubEventFromDatabase(dbEvent, [dbArea])
      : getMemberHubEvent(eventSlug, fallbackPreview ?? undefined);
  const area = dbArea
    ? event.areas[0] ?? null
    : getMemberArea(eventSlug, areaSlug, fallbackPreview ?? undefined);

  if (!area) {
    notFound();
  }

  return {
    event,
    area,
    eventId: dbEvent?.id ?? null,
    areaId: dbArea?.id ?? null,
  };
}

export default async function EventAreaDetailPage({
  params,
}: {
  params: Promise<{ eventSlug: string; areaSlug: string }>;
}) {
  const session = await auth();
  const { eventSlug, areaSlug } = await params;
  const { event, area, eventId, areaId } = await getAreaPageData(eventSlug, areaSlug);
  const currentUserName = session?.user?.name ?? "You";
  const currentUserId = session?.user?.id;
  const canCreateTask = Boolean(eventId && areaId);

  const areaTasks = area.tasks.map((task) => ({
    ...task,
    eventSlug: event.slug,
    eventTitle: event.title,
    areaSlug: area.slug,
    areaName: area.name,
  }));

  const openTasks = areaTasks.filter((task) => task.status === "open");
  const ownedTasks = areaTasks.filter((task) => task.status === "owned");
  const ownedByUser = areaTasks.filter(
    (task) => task.status === "owned" && ((currentUserId && task.ownerId === currentUserId) || task.ownerName === currentUserName),
  );

  const nextStepMessage = ownedByUser.length > 0
    ? "You have work here. Review your tasks and follow through."
    : openTasks.length > 0
      ? "Open tasks still need attention. Review below and take one if it fits."
      : "All tasks are currently covered. Check back or support another area.";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 text-base">
        <Link href={`/members/events/${event.slug}`} className="font-medium text-green-700 hover:underline">
          ← Back to Event Hub
        </Link>
        <Link href="/my-commitments" className="font-medium text-green-700 hover:underline">
          My Commitments
        </Link>
        <Link href="/dashboard" className="font-medium text-green-700 hover:underline">
          Dashboard
        </Link>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-base font-medium text-emerald-700">{event.title}</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900">{area.name}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-700">{area.description}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Your role in this area</p>
            <p className="mt-1.5 text-base text-emerald-900">
              {ownedByUser.length > 0
                ? `You own ${ownedByUser.length} task${ownedByUser.length === 1 ? "" : "s"} in this area.`
                : "You are not currently assigned in this area."}
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Area summary</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-800">
                {openTasks.length} open
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
                {ownedTasks.length} owned
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">What to do next</h2>
            <p className="mt-1 text-base text-zinc-600">{nextStepMessage}</p>
          </div>
          <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-sm font-medium text-zinc-600">
            Workflow loop
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-base">
          <Link href={`/members/events/${event.slug}`} className="font-medium text-emerald-700 hover:underline">
            Back to Event Hub →
          </Link>
          <Link href="/my-commitments" className="font-medium text-emerald-700 hover:underline">
            Review My Commitments →
          </Link>
          <Link href="/dashboard" className="font-medium text-emerald-700 hover:underline">
            Return to Dashboard →
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {canCreateTask ? (
            <details className="mb-5 rounded-lg" open={openTasks.length === 0 ? true : undefined}>
              <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-zinc-900">Open Tasks</h2>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
                      Add Task
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-800">
                      {openTasks.length} open
                    </span>
                  </div>
                </div>
              </summary>

              <form
                action={createAreaTask.bind(null, eventId!, areaId!, event.slug, area.slug)}
                className="mt-5 rounded-lg border border-stone-200 bg-stone-50 p-5"
              >
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="task-title" className="mb-1.5 block text-base font-medium text-zinc-800">
                      Title
                    </label>
                    <input
                      id="task-title"
                      name="title"
                      type="text"
                      required
                      placeholder="Add a quick task title"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="task-description" className="mb-1.5 block text-base font-medium text-zinc-800">
                      Description <span className="text-zinc-500">(optional)</span>
                    </label>
                    <textarea
                      id="task-description"
                      name="description"
                      rows={3}
                      placeholder="Add a short note or next step"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="task-shiftDate" className="mb-1.5 block text-base font-medium text-zinc-800">
                        Date <span className="text-zinc-500">(optional)</span>
                      </label>
                      <input
                        id="task-shiftDate"
                        name="shiftDate"
                        type="date"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="task-startClockTime" className="mb-1.5 block text-base font-medium text-zinc-800">
                        Start time <span className="text-zinc-500">(optional)</span>
                      </label>
                      <input
                        id="task-startClockTime"
                        name="startClockTime"
                        type="time"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="task-endClockTime" className="mb-1.5 block text-base font-medium text-zinc-800">
                        End time <span className="text-zinc-500">(optional)</span>
                      </label>
                      <input
                        id="task-endClockTime"
                        name="endClockTime"
                        type="time"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-600"
                    >
                      Create Task
                    </button>
                    <p className="text-sm text-zinc-600">New tasks are added as open and unassigned.</p>
                  </div>
                </div>
              </form>
            </details>
          ) : (
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-zinc-900">Open Tasks</h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-800">
                {openTasks.length} open
              </span>
            </div>
          )}

          <MockTaskList
            tasks={openTasks}
            currentUserName={currentUserName}
            emptyMessage="No open tasks in this area right now."
            showEventMeta={false}
            showAreaLink={false}
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">Owned Tasks</h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
              {ownedTasks.length} owned
            </span>
          </div>

          <MockTaskList
            tasks={ownedTasks}
            currentUserName={currentUserName}
            emptyMessage="No owned tasks in this area yet."
            showEventMeta={false}
            showAreaLink={false}
          />
        </section>
      </div>
    </div>
  );
}
