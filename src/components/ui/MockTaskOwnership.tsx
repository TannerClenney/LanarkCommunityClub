"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { takeTaskOwnership } from "@/app/actions/member-hub";
import type { MemberTask } from "@/lib/member-hub";

const STORAGE_KEY = "lcc-mock-task-owners";

type MockTaskOwnerMap = Record<string, string>;

type BaseTaskListProps = {
  currentUserName: string;
  emptyMessage: string;
  showEventMeta?: boolean;
  showAreaLink?: boolean;
};

type MockTaskListProps = BaseTaskListProps & {
  tasks: MemberTask[];
};

type DashboardTaskOwnershipBoardProps = {
  currentUserName: string;
  currentUserId?: string;
  needsAHand: MemberTask[];
  whatIOwn: MemberTask[];
};

function getStatusClasses(status: MemberTask["status"]) {
  return status === "done"
    ? "border-zinc-200 bg-zinc-100 text-zinc-600"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getStatusLabel(status: MemberTask["status"]) {
  return status === "done" ? "Done" : "Owned";
}

function getCurrentNeed(task: MemberTask) {
  return task.description ?? `This ${task.areaName.toLowerCase()} item still needs someone to take the next practical step.`;
}

function readStoredOwners(): MockTaskOwnerMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  } catch {
    return {};
  }
}

function writeStoredOwners(ownerMap: MockTaskOwnerMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ownerMap));
}

function applyOwnership(task: MemberTask, ownerMap: MockTaskOwnerMap): MemberTask {
  const storedOwner = ownerMap[task.id];

  if (!storedOwner) {
    return task;
  }

  return {
    ...task,
    ownerName: storedOwner,
    status: "owned",
  };
}

function dedupeTasks(tasks: MemberTask[]): MemberTask[] {
  return Array.from(new Map(tasks.map((task) => [task.id, task])).values());
}

function TaskQuickViewModal({
  task,
  isPending,
  onClose,
  onTakeThis,
}: {
  task: MemberTask | null;
  isPending: boolean;
  onClose: () => void;
  onTakeThis: (task: MemberTask) => void;
}) {
  if (!task) return null;

  const canViewArea = Boolean(task.eventSlug && task.areaSlug);
  const areaHref = canViewArea ? `/members/events/${task.eventSlug}/areas/${task.areaSlug}` : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close task quick view"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Task</p>
            <h3 className="mt-1 text-xl font-semibold text-zinc-900">{task.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-200 px-2.5 py-1 text-sm text-zinc-500 hover:bg-stone-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Event</p>
            <p className="mt-1 text-sm text-zinc-700">{task.eventTitle}</p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Area</p>
            <p className="mt-1 text-sm text-zinc-700">{task.areaName}</p>
          </div>

          {task.timeLabel && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">When</p>
              <p className="mt-1 text-sm font-medium text-amber-800">{task.timeLabel}</p>
            </div>
          )}

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 sm:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Current need</p>
            <p className="mt-1 text-sm text-zinc-700">{getCurrentNeed(task)}</p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 sm:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Next step</p>
            <p className="mt-1 text-sm text-zinc-700">{task.description ?? "Open the area page to confirm the next follow-through step."}</p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 sm:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Status</p>
            <p className="mt-1 text-sm text-zinc-700">
              {task.status === "owned" && task.ownerName ? `Owned by ${task.ownerName}` : "Up for grabs"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {task.status === "open" && (
            <button
              type="button"
              onClick={() => onTakeThis(task)}
              disabled={isPending}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Taking…" : "Take This Shift"}
            </button>
          )}

          {canViewArea && areaHref ? (
            <Link
              href={areaHref}
              onClick={onClose}
              className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-stone-100"
            >
              View Area
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="cursor-not-allowed rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-zinc-400 opacity-70"
            >
              View Area
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onTakeThis,
  onOpenQuickView,
  isPending = false,
  showEventMeta = true,
  showAreaLink = true,
}: {
  task: MemberTask;
  onTakeThis: (task: MemberTask) => void;
  onOpenQuickView: (task: MemberTask) => void;
  isPending?: boolean;
  showEventMeta?: boolean;
  showAreaLink?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpenQuickView(task)}
        className="block w-full rounded-lg border border-stone-200 bg-stone-50 p-3 text-left transition-all hover:border-emerald-300 hover:bg-white hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900">{task.title}</p>
            {task.timeLabel && (
              <p className="mt-0.5 text-xs font-medium text-amber-700">
                🕐 {task.timeLabel}
              </p>
            )}
            {showEventMeta && (
              <p className="mt-1 text-xs text-zinc-500">
                {task.eventTitle} · {task.areaName}
              </p>
            )}
            <p className="mt-1 text-xs text-zinc-500">
              {task.status === "owned" && task.ownerName ? `Owned by ${task.ownerName}` : "Up for grabs"}
            </p>
            {task.description && <p className="mt-1 text-xs text-zinc-600">Next step: {task.description}</p>}
          </div>

          {task.status !== "open" && (
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClasses(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {task.status === "open" && (
            <span className="text-xs font-medium text-zinc-500">
              Tap for details
            </span>
          )}

          {showAreaLink && (
            <span className="text-xs font-medium text-emerald-700">
              View area →
            </span>
          )}
        </div>
      </button>

      {task.status === "open" && (
        <div className="mt-2 flex justify-start">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTakeThis(task);
            }}
            disabled={isPending}
            className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Taking…" : "Take This Shift"}
          </button>
        </div>
      )}
    </li>
  );
}

function useMockTaskOwners(currentUserName: string) {
  const router = useRouter();
  const [ownerMap, setOwnerMap] = useState<MockTaskOwnerMap>(() => readStoredOwners());
  const [pendingTaskIds, setPendingTaskIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const takeTask = async (task: MemberTask) => {
    setErrorMessage("");

    if (task.isPersisted) {
      setOwnerMap((current) => ({
        ...current,
        [task.id]: currentUserName,
      }));
      setPendingTaskIds((current) => [...current, task.id]);

      const result = await takeTaskOwnership(task.id);

      setPendingTaskIds((current) => current.filter((id) => id !== task.id));

      if (!result.success) {
        setOwnerMap((current) => {
          const next = { ...current };
          delete next[task.id];
          return next;
        });
        setErrorMessage(result.error ?? "Could not take this task right now.");
        return;
      }

      router.refresh();
      return;
    }

    setOwnerMap((current) => {
      const next = {
        ...current,
        [task.id]: currentUserName,
      };

      writeStoredOwners(next);
      return next;
    });
  };

  return { ownerMap, takeTask, pendingTaskIds, errorMessage };
}

export function MockTaskList({
  tasks,
  currentUserName,
  emptyMessage,
  showEventMeta = true,
  showAreaLink = true,
}: MockTaskListProps) {
  const { ownerMap, takeTask, pendingTaskIds, errorMessage } = useMockTaskOwners(currentUserName);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const visibleTasks = useMemo(() => tasks.map((task) => applyOwnership(task, ownerMap)), [tasks, ownerMap]);
  const selectedTask = visibleTasks.find((task) => task.id === selectedTaskId) ?? null;

  if (visibleTasks.length === 0) {
    return <p className="text-sm text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <ul className="space-y-3">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onTakeThis={takeTask}
            onOpenQuickView={(selected) => setSelectedTaskId(selected.id)}
            isPending={pendingTaskIds.includes(task.id)}
            showEventMeta={showEventMeta}
            showAreaLink={showAreaLink}
          />
        ))}
      </ul>

      <TaskQuickViewModal
        task={selectedTask}
        isPending={selectedTask ? pendingTaskIds.includes(selectedTask.id) : false}
        onClose={() => setSelectedTaskId(null)}
        onTakeThis={(task) => {
          void takeTask(task);
          setSelectedTaskId(null);
        }}
      />
    </div>
  );
}

export function DashboardTaskOwnershipBoard({
  currentUserName,
  currentUserId,
  needsAHand,
  whatIOwn,
}: DashboardTaskOwnershipBoardProps) {
  const { ownerMap, takeTask, pendingTaskIds, errorMessage } = useMockTaskOwners(currentUserName);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [recentlyTakenShiftLabel, setRecentlyTakenShiftLabel] = useState<string | null>(null);

  const normalizedNeeds = useMemo(
    () => {
      const filtered = needsAHand.map((task) => applyOwnership(task, ownerMap)).filter((task) => task.status === "open");
      // Prioritize tasks with time info, sort by startTime ascending, then non-timed tasks
      return filtered.sort((a, b) => {
        const aHasTime = Boolean(a.startTime || a.timeLabel);
        const bHasTime = Boolean(b.startTime || b.timeLabel);
        if (aHasTime && !bHasTime) return -1;
        if (!aHasTime && bHasTime) return 1;
        // Among timed tasks, sort by startTime when available
        if (a.startTime && b.startTime) {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        return 0;
      });
    },
    [needsAHand, ownerMap],
  );

  const normalizedOwned = useMemo(() => {
    const combinedTasks = dedupeTasks([...whatIOwn, ...needsAHand]).map((task) => applyOwnership(task, ownerMap));

    return combinedTasks.filter(
      (task) =>
        task.status === "owned" &&
        ((currentUserId && task.ownerId === currentUserId) || task.ownerName === currentUserName),
    );
  }, [needsAHand, ownerMap, whatIOwn, currentUserId, currentUserName]);

  // Group visible tasks: consecutive tasks with the same timeLabel get a shared header
  const visibleNeeds = normalizedNeeds.slice(0, 4);

  const groupedNeeds = useMemo(() => {
    const groups: { label: string | null; tasks: MemberTask[] }[] = [];
    for (const task of visibleNeeds) {
      const label = task.timeLabel ?? null;
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.tasks.push(task);
      } else {
        groups.push({ label, tasks: [task] });
      }
    }
    return groups;
  }, [visibleNeeds]);

  const selectedTask = [...normalizedNeeds, ...normalizedOwned].find((task) => task.id === selectedTaskId) ?? null;

  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-800">Pick a Time to Help</h2>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            Open
          </span>
        </div>
        <p className="mb-4 text-xs text-zinc-500">Choose a shift that works for you.</p>

        {errorMessage && <p className="mb-3 text-sm text-red-600">{errorMessage}</p>}
        {recentlyTakenShiftLabel && (
          <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            You&apos;re helping {recentlyTakenShiftLabel} 👍
          </p>
        )}
        {normalizedNeeds.length === 0 ? (
          <p className="text-sm text-zinc-400">Nothing needed right now — check back closer to event time.</p>
        ) : (
          <>
            <div className="space-y-5">
              {groupedNeeds.map((group) => (
                <div key={group.label ?? "__no-time"}>
                  {group.label && (
                    <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-amber-900">🕐 {group.label}</p>
                        {group.tasks.length > 1 && (
                          <p className="text-xs font-medium text-amber-700">{group.tasks.length} tasks</p>
                        )}
                      </div>
                      {group.tasks.length > 1 && (
                        <p className="mt-1 text-xs text-amber-600">This time slot needs help</p>
                      )}
                    </div>
                  )}
                  <ul className="space-y-3">
                    {group.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onTakeThis={(selectedTask) => {
                          void takeTask(selectedTask);
                          if (selectedTask.timeLabel) {
                            setRecentlyTakenShiftLabel(selectedTask.timeLabel);
                            setTimeout(() => setRecentlyTakenShiftLabel(null), 3500);
                          }
                        }}
                        onOpenQuickView={(selected) => setSelectedTaskId(selected.id)}
                        isPending={pendingTaskIds.includes(task.id)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {normalizedNeeds.length > 4 && (
              <p className="mt-3 text-center">
                <Link href="/my-commitments" className="text-xs font-medium text-emerald-700 hover:underline">
                  See more →
                </Link>
              </p>
            )}
          </>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-800">You&apos;ve Got These Covered</h2>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            You
          </span>
        </div>
        <p className="mb-4 text-xs text-zinc-500">Nice work staying on top of these.</p>

        {normalizedOwned.length === 0 ? (
          <p className="text-sm text-zinc-400">You haven&apos;t picked anything up yet — no rush.</p>
        ) : (
          <ul className="space-y-3">
            {normalizedOwned.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onTakeThis={takeTask}
                onOpenQuickView={(selected) => setSelectedTaskId(selected.id)}
                isPending={pendingTaskIds.includes(task.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <TaskQuickViewModal
        task={selectedTask}
        isPending={selectedTask ? pendingTaskIds.includes(selectedTask.id) : false}
        onClose={() => setSelectedTaskId(null)}
        onTakeThis={(task) => {
          void takeTask(task);
          setSelectedTaskId(null);
        }}
      />
    </>
  );
}
