import { TaskStatus } from "@/generated/prisma/enums";
import { db, hasDatabase } from "@/lib/db";
import {
  getDashboardTaskLists,
  getMemberHubEvent,
  memberHubEvents,
  type MemberEventArea,
  type MemberHubEvent,
  type MemberTask,
  type MemberTaskStatus,
} from "@/lib/member-hub";
import { formatDateShort } from "@/lib/utils";

import { formatTimeRange } from "@/lib/utils";

const OSD_EVENT_SLUG = "old-settlers-days";

type EventAreaSeed = {
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  tasks: Array<{
    title: string;
    description?: string;
    displayOrder: number;
    status?: TaskStatus;
    ownerEmail?: string;
  }>;
};

const OSD_AREA_SEEDS: EventAreaSeed[] = [
  {
    name: "Entrance",
    slug: "entrance",
    description: "Welcome table, wristbands, signs, and first-contact flow for guests.",
    displayOrder: 0,
    tasks: [
      {
        title: "Refresh entrance signs and wristband table plan",
        description: "[time:Setup day, morning] Make sure the signs are easy to read and the welcome setup is ready to go.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
      {
        title: "Check the entrance supply bin before setup",
        description: "[time:Day before event] Give the supply tote a quick once-over so setup is not scrambling day-of.",
        displayOrder: 1,
        status: TaskStatus.OWNED,
        ownerEmail: "member@lanarkcommunityclub.com",
      },
    ],
  },
  {
    name: "Beer Service",
    slug: "beer-service",
    description: "Serving flow, cooler restock, and keeping the line moving smoothly.",
    displayOrder: 1,
    tasks: [
      {
        title: "Confirm beer tent restock plan for Saturday",
        description: "[time:Saturday, 1:00\u20132:00 PM] Write down the simple restock handoff so volunteers know what to watch.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
    ],
  },
  {
    name: "Logistics",
    slug: "logistics",
    description: "Vendor coordination, support items, delivery timing, and paperwork follow-through.",
    displayOrder: 2,
    tasks: [
      {
        title: "Portable toilets for the event",
        description: "[time:2 weeks before event] Check rental options, confirm delivery/service timing, and keep the baseline count in mind.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
      {
        title: "Share vendor paperwork with the treasurer",
        description: "Make sure receipts or forms make it back to the treasurer without a separate chase-down.",
        displayOrder: 1,
        status: TaskStatus.OWNED,
        ownerEmail: "officer@lanarkcommunityclub.com",
      },
    ],
  },
];

type MemberHubEventSeed = {
  slug: string;
  title: string;
  description: string;
  location: string;
  isPublic: boolean;
  isFeatured: boolean;
  buildDates: (year: number) => { startDate: Date; endDate: Date };
  areas: EventAreaSeed[];
};

const LCC_MONTHLY_MEETING_AREA_SEEDS: EventAreaSeed[] = [
  {
    name: "Agenda Planning",
    slug: "agenda-planning",
    description: "Collect agenda items, set meeting flow, and keep decisions focused.",
    displayOrder: 0,
    tasks: [
      {
        title: "Collect agenda items from officers",
        description: "Gather key updates and open issues before meeting night.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
      {
        title: "Draft and share meeting agenda",
        description: "Publish a simple agenda so members arrive prepared.",
        displayOrder: 1,
        status: TaskStatus.OWNED,
        ownerEmail: "officer@lanarkcommunityclub.com",
      },
    ],
  },
  {
    name: "Attendance & Setup",
    slug: "attendance-setup",
    description: "Room setup, attendance check-in, and practical meeting readiness.",
    displayOrder: 1,
    tasks: [
      {
        title: "Set up chairs and sign-in table",
        description: "[time:Meeting night, 6:00 PM] Quick setup before members arrive.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
    ],
  },
  {
    name: "Follow-Up",
    slug: "follow-up",
    description: "Capture notes and track action items after the meeting.",
    displayOrder: 2,
    tasks: [
      {
        title: "Post summary notes for members",
        description: "[time:Day after meeting] Share key decisions and next steps after adjournment.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
    ],
  },
];

const FALL_FEST_AREA_SEEDS: EventAreaSeed[] = [
  {
    name: "Vendor Row",
    slug: "vendor-row",
    description: "Local vendors, layout support, and booth communication.",
    displayOrder: 0,
    tasks: [
      {
        title: "Confirm vendor booth map",
        description: "[time:Week before event] Make sure setup locations are clear before load-in.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
      {
        title: "Send vendor arrival reminders",
        description: "Share simple arrival timing and parking notes.",
        displayOrder: 1,
        status: TaskStatus.OWNED,
        ownerEmail: "member@lanarkcommunityclub.com",
      },
    ],
  },
  {
    name: "Family Activities",
    slug: "family-activities",
    description: "Games, kid-friendly stations, and volunteer handoff.",
    displayOrder: 1,
    tasks: [
      {
        title: "Assign volunteers to activity stations",
        description: "[time:Morning (10 AM\u201312 PM)] Keep at least one person assigned to each activity block.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
    ],
  },
  {
    name: "Food & Beverage",
    slug: "food-beverage",
    description: "Food support, beverage supplies, and cleanup planning.",
    displayOrder: 2,
    tasks: [
      {
        title: "Review beverage and snack restock plan",
        description: "[time:Afternoon (12\u20132 PM)] Confirm coverage for peak foot traffic windows.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
    ],
  },
];

const HAUNTED_HOUSE_AREA_SEEDS: EventAreaSeed[] = [
  {
    name: "Set Design",
    slug: "set-design",
    description: "Decor zones, prop placement, and setup safety checks.",
    displayOrder: 0,
    tasks: [
      {
        title: "Finalize room-by-room setup checklist",
        description: "[time:Setup weekend, Saturday AM] Keep setup simple and repeatable for volunteers.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
    ],
  },
  {
    name: "Volunteer Rotation",
    slug: "volunteer-rotation",
    description: "Shift coverage for greeters, actors, and line support.",
    displayOrder: 1,
    tasks: [
      {
        title: "Publish volunteer shift rotation",
        description: "[time:1 week before event] Share clear start/end windows for each role.",
        displayOrder: 0,
        status: TaskStatus.OWNED,
        ownerEmail: "officer@lanarkcommunityclub.com",
      },
    ],
  },
  {
    name: "Safety & Flow",
    slug: "safety-flow",
    description: "Entry/exit flow, lighting checks, and safety readiness.",
    displayOrder: 2,
    tasks: [
      {
        title: "Walk through emergency exit path",
        description: "[time:Opening night, 5:00 PM] Confirm routes are clear and volunteers know procedures.",
        displayOrder: 0,
        status: TaskStatus.OPEN,
      },
    ],
  },
];

const MEMBER_HUB_EVENT_SEEDS: MemberHubEventSeed[] = [
  {
    slug: "lcc-monthly-meeting",
    title: "LCC Monthly Meeting",
    description:
      "A simple planning hub for monthly club operations, member updates, and practical follow-through between meetings.",
    location: "Lanark Community Center",
    isPublic: false,
    isFeatured: false,
    buildDates: (year) => ({
      startDate: new Date(year, 0, 20, 18, 30),
      endDate: new Date(year, 0, 20, 20, 0),
    }),
    areas: LCC_MONTHLY_MEETING_AREA_SEEDS,
  },
  {
    slug: OSD_EVENT_SLUG,
    title: "Old Settlers Days / Beer Tent",
    description:
      "A simple working hub for the OSD beer tent so members can see what is open, what is owned, and what still needs follow-through.",
    location: "Lanark Community Grounds",
    isPublic: true,
    isFeatured: true,
    buildDates: (year) => ({
      startDate: new Date(year, 5, 26, 17, 0),
      endDate: new Date(year, 5, 27, 23, 0),
    }),
    areas: OSD_AREA_SEEDS,
  },
  {
    slug: "fall-fest",
    title: "Fall Fest",
    description:
      "A practical coordination hub for vendor support, family activities, and day-of volunteer follow-through.",
    location: "Downtown Lanark",
    isPublic: true,
    isFeatured: false,
    buildDates: (year) => ({
      startDate: new Date(year, 8, 28, 10, 0),
      endDate: new Date(year, 8, 28, 18, 0),
    }),
    areas: FALL_FEST_AREA_SEEDS,
  },
  {
    slug: "haunted-house",
    title: "Haunted House",
    description:
      "A lightweight work hub for setup, volunteer rotations, and safe event flow through the haunted house weekend.",
    location: "Lanark Community Hall",
    isPublic: true,
    isFeatured: false,
    buildDates: (year) => ({
      startDate: new Date(year, 9, 25, 17, 30),
      endDate: new Date(year, 9, 26, 22, 0),
    }),
    areas: HAUNTED_HOUSE_AREA_SEEDS,
  },
];

function normalizeTaskStatus(status: string): MemberTaskStatus {
  switch (status.toLowerCase()) {
    case "owned":
      return "owned";
    case "done":
      return "done";
    default:
      return "open";
  }
}

/**
 * Extracts an optional time label from a task description.
 * Convention: descriptions starting with `[time:Label]` encode a UI-only time hint.
 * Returns { timeLabel, description } where description has the prefix stripped.
 */
function parseTimeLabel(description: string | null | undefined): { timeLabel: string | null; description: string | null } {
  if (!description) return { timeLabel: null, description: description ?? null };
  const match = description.match(/^\[time:([^\]]+)\]\s*/);
  if (!match) return { timeLabel: null, description };
  return { timeLabel: match[1].trim(), description: description.slice(match[0].length) || null };
}

export async function ensureMemberHubEventData(eventSlug: string) {
  if (!hasDatabase()) return null;

  const seed = MEMBER_HUB_EVENT_SEEDS.find((item) => item.slug === eventSlug);
  if (!seed) return null;

  const now = new Date();
  const pilotYear = now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
  const { startDate, endDate } = seed.buildDates(pilotYear);

  let event = await db.event.findFirst({
    where: {
      OR: [{ slug: seed.slug }, { title: seed.title }],
      archived: false,
    },
    orderBy: { startDate: "asc" },
  });

  if (!event) {
    event = await db.event.create({
      data: {
        title: seed.title,
        slug: seed.slug,
        description: seed.description,
        location: seed.location,
        startDate,
        endDate,
        isPublic: seed.isPublic,
        isFeatured: seed.isFeatured,
        showInMemberHub: true,
      },
    });
  } else if (event.slug !== seed.slug || !event.showInMemberHub) {
    event = await db.event.update({
      where: { id: event.id },
      data: {
        slug: seed.slug,
        title: seed.title,
        description: seed.description,
        location: seed.location,
        isPublic: seed.isPublic,
        isFeatured: seed.isFeatured,
        startDate,
        endDate,
        showInMemberHub: true,
      },
    });
  }

  for (const areaSeed of seed.areas) {
    const area = await db.eventArea.upsert({
      where: {
        eventId_slug: {
          eventId: event.id,
          slug: areaSeed.slug,
        },
      },
      update: {
        name: areaSeed.name,
        description: areaSeed.description,
        displayOrder: areaSeed.displayOrder,
      },
      create: {
        eventId: event.id,
        name: areaSeed.name,
        slug: areaSeed.slug,
        description: areaSeed.description,
        displayOrder: areaSeed.displayOrder,
      },
    });

    for (const [taskIndex, taskSeed] of areaSeed.tasks.entries()) {
      const owner = taskSeed.ownerEmail
        ? await db.user.findUnique({
            where: { email: taskSeed.ownerEmail },
            select: { id: true },
          })
        : null;

      await db.task.upsert({
        where: {
          eventAreaId_title: {
            eventAreaId: area.id,
            title: taskSeed.title,
          },
        },
        update: {
          description: taskSeed.description ?? null,
          displayOrder: taskSeed.displayOrder ?? taskIndex,
          eventId: event.id,
        },
        create: {
          eventId: event.id,
          eventAreaId: area.id,
          title: taskSeed.title,
          description: taskSeed.description ?? null,
          displayOrder: taskSeed.displayOrder ?? taskIndex,
          status: owner ? taskSeed.status ?? TaskStatus.OWNED : TaskStatus.OPEN,
          ownerId: owner?.id,
        },
      });
    }
  }

  return event;
}

export async function ensureOsdPilotData() {
  return ensureMemberHubEventData(OSD_EVENT_SLUG);
}

type DbTaskRecord = {
  id: string;
  title: string;
  description: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  status: string;
  ownerId?: string | null;
  owner: { name: string | null } | null;
  event: { title: string; slug: string };
  eventArea: { slug: string; name: string };
};

function deriveTimeLabel(task: { startTime?: Date | null; endTime?: Date | null; description: string | null }): string | null {
  if (task.startTime && task.endTime) {
    return formatTimeRange(task.startTime, task.endTime);
  }
  const parsed = parseTimeLabel(task.description);
  return parsed.timeLabel;
}

function deriveDescription(task: { startTime?: Date | null; endTime?: Date | null; description: string | null }): string | null {
  // Only strip [time:...] prefix if there are no real startTime/endTime fields
  if (task.startTime && task.endTime) return task.description;
  return parseTimeLabel(task.description).description;
}

export function mapDbTaskToMemberTask(task: DbTaskRecord): MemberTask {
  return {
    id: task.id,
    title: task.title,
    description: deriveDescription(task),
    timeLabel: deriveTimeLabel(task),
    startTime: task.startTime?.toISOString() ?? null,
    endTime: task.endTime?.toISOString() ?? null,
    ownerId: task.ownerId ?? null,
    ownerName: task.owner?.name ?? null,
    status: normalizeTaskStatus(task.status),
    eventSlug: task.event.slug,
    eventTitle: task.event.title,
    areaSlug: task.eventArea.slug,
    areaName: task.eventArea.name,
    isPersisted: true,
  };
}

type DbAreaRecord = {
  slug: string;
  name: string;
  description: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    startTime?: Date | null;
    endTime?: Date | null;
    status: string;
    ownerId?: string | null;
    owner: { name: string | null } | null;
  }>;
};

type DbEventRecord = {
  title: string;
  slug: string;
  description: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
};

export function buildMemberHubEventFromDatabase(event: DbEventRecord, areas: DbAreaRecord[]): MemberHubEvent {
  const eventSlug = event.slug;
  const knownEvent = memberHubEvents.find((item) => item.slug === eventSlug);

  const mappedAreas: MemberEventArea[] = areas.map((area) => ({
    slug: area.slug,
    name: area.name,
    description: area.description,
    tasks: area.tasks.map((task) => {
      return {
        id: task.id,
        title: task.title,
        description: deriveDescription(task),
        timeLabel: deriveTimeLabel(task),
        startTime: task.startTime?.toISOString() ?? null,
        endTime: task.endTime?.toISOString() ?? null,
        ownerId: task.ownerId ?? null,
        ownerName: task.owner?.name ?? null,
        status: normalizeTaskStatus(task.status),
        isPersisted: true,
      };
    }),
  }));

  const openNeeds: MemberTask[] = areas.flatMap((area) =>
    area.tasks
      .filter((task) => normalizeTaskStatus(task.status) === "open")
      .map((task) => {
        return {
          id: task.id,
          title: task.title,
          description: deriveDescription(task),
          timeLabel: deriveTimeLabel(task),
          startTime: task.startTime?.toISOString() ?? null,
          endTime: task.endTime?.toISOString() ?? null,
          ownerId: task.ownerId ?? null,
          ownerName: task.owner?.name ?? null,
          status: "open" as const,
          eventSlug,
          eventTitle: event.title,
          areaSlug: area.slug,
          areaName: area.name,
          isPersisted: true,
        };
      }),
  );

  return {
    slug: eventSlug,
    title: event.title,
    description: event.description,
    dateLabel: event.endDate
      ? `${formatDateShort(event.startDate)} – ${formatDateShort(event.endDate)}`
      : formatDateShort(event.startDate),
    location: event.location ?? undefined,
    image: knownEvent?.image,
    areas: mappedAreas,
    openNeeds,
    discussion:
      knownEvent?.discussion ?? [
        {
          id: `${eventSlug}-discussion-1`,
          title: `Quick planning notes for ${event.title}`,
          updatedLabel: "Use the discussion board when needed",
          href: "/forum",
        },
      ],
  };
}

export async function getOwnedTasksForUser(userId: string, memberName?: string | null) {
  if (!hasDatabase()) {
    return getDashboardTaskLists(memberName).whatIOwn;
  }

  const ownedTasks = await db.task.findMany({
    where: { status: TaskStatus.OWNED, ownerId: userId, event: { archived: false, showInMemberHub: true } },
    orderBy: [{ event: { startDate: "asc" } }, { eventArea: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    include: {
      owner: { select: { name: true } },
      event: { select: { title: true, slug: true } },
      eventArea: { select: { slug: true, name: true } },
    },
  });

  if (ownedTasks.length === 0) {
    return getDashboardTaskLists(memberName).whatIOwn;
  }

  return ownedTasks.map(mapDbTaskToMemberTask);
}

export async function getDashboardTaskListsForUser(userId: string, memberName?: string | null) {
  if (!hasDatabase()) {
    return getDashboardTaskLists(memberName);
  }

  const [openTasks, ownedTasks] = await Promise.all([
    db.task.findMany({
      where: { status: TaskStatus.OPEN, event: { archived: false, showInMemberHub: true } },
      orderBy: [{ startTime: { sort: "asc", nulls: "last" } }, { displayOrder: "asc" }, { createdAt: "asc" }],
      take: 6,
      include: {
        owner: { select: { name: true } },
        event: { select: { title: true, slug: true } },
        eventArea: { select: { slug: true, name: true } },
      },
    }),
    getOwnedTasksForUser(userId, memberName),
  ]);

  if (openTasks.length === 0 && ownedTasks.length === 0) {
    return getDashboardTaskLists(memberName);
  }

  return {
    needsAHand: openTasks.map(mapDbTaskToMemberTask),
    whatIOwn: ownedTasks,
  };
}

export function isOsdPilotEventSlug(eventSlug: string) {
  return eventSlug === OSD_EVENT_SLUG;
}

export function isSeededMemberHubEventSlug(eventSlug: string) {
  return MEMBER_HUB_EVENT_SEEDS.some((seed) => seed.slug === eventSlug);
}

export function getFallbackHubEvent(eventSlug: string) {
  return getMemberHubEvent(eventSlug);
}
