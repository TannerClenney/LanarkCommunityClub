import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MockTaskList } from "@/components/ui/MockTaskOwnership";
import { getOwnedTasksForUser } from "@/lib/member-hub-server";
import type { MemberTask } from "@/lib/member-hub";

export const metadata: Metadata = { title: "My Commitments" };

type GroupedCommitments = Array<{
  eventTitle: string;
  eventSlug: string;
  areas: Array<{
    areaName: string;
    areaSlug: string;
    tasks: MemberTask[];
  }>;
}>;

function groupTasksByEventAndArea(tasks: MemberTask[]): GroupedCommitments {
  const grouped = new Map<string, { eventTitle: string; eventSlug: string; areas: Map<string, { areaName: string; areaSlug: string; tasks: MemberTask[] }> }>();

  for (const task of tasks) {
    const eventKey = task.eventSlug;
    const areaKey = `${task.eventSlug}:${task.areaSlug}`;

    if (!grouped.has(eventKey)) {
      grouped.set(eventKey, {
        eventTitle: task.eventTitle,
        eventSlug: task.eventSlug,
        areas: new Map(),
      });
    }

    const eventGroup = grouped.get(eventKey)!;

    if (!eventGroup.areas.has(areaKey)) {
      eventGroup.areas.set(areaKey, {
        areaName: task.areaName,
        areaSlug: task.areaSlug,
        tasks: [],
      });
    }

    eventGroup.areas.get(areaKey)!.tasks.push(task);
  }

  return Array.from(grouped.values()).map((eventGroup) => ({
    eventTitle: eventGroup.eventTitle,
    eventSlug: eventGroup.eventSlug,
    areas: Array.from(eventGroup.areas.values()),
  }));
}

export default async function MyCommitmentsPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.name ?? "You";

  const tasks = currentUserId ? await getOwnedTasksForUser(currentUserId, currentUserName) : [];
  const groupedTasks = groupTasksByEventAndArea(tasks);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-700">My Commitments</h1>
        <p className="mt-1 text-sm text-zinc-500">
          A simple view of what you currently own, grouped by event and work area.
        </p>
      </div>

      {groupedTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-zinc-500">You do not have any active commitments yet.</p>
          <Link href="/calendar" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
            Browse events and open needs →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTasks.map((eventGroup) => (
            <section key={eventGroup.eventSlug} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">{eventGroup.eventTitle}</h2>
                  <p className="text-sm text-zinc-500">{eventGroup.areas.reduce((count, area) => count + area.tasks.length, 0)} commitment(s)</p>
                </div>
                <Link href={`/members/events/${eventGroup.eventSlug}`} className="text-sm font-medium text-emerald-700 hover:underline">
                  View event →
                </Link>
              </div>

              <div className="space-y-5">
                {eventGroup.areas.map((area) => (
                  <div key={`${eventGroup.eventSlug}-${area.areaSlug}`} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">{area.areaName}</h3>
                        <p className="text-xs text-zinc-500">Owned tasks in this area</p>
                      </div>
                      <Link
                        href={`/members/events/${eventGroup.eventSlug}/areas/${area.areaSlug}`}
                        className="text-xs font-medium text-emerald-700 hover:underline"
                      >
                        Open area →
                      </Link>
                    </div>

                    <MockTaskList
                      tasks={area.tasks}
                      currentUserName={currentUserName}
                      emptyMessage="No owned tasks in this area."
                      showEventMeta={false}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
