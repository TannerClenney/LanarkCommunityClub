import { mockEvents } from "@/lib/mock-data";

export type MemberTaskStatus = "open" | "owned" | "done";

export type MemberTask = {
  id: string;
  title: string;
  description?: string | null;
  timeLabel?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
  status: MemberTaskStatus;
  eventSlug: string;
  eventTitle: string;
  areaSlug: string;
  areaName: string;
  isPersisted?: boolean;
};

export type MemberAreaTask = Pick<
  MemberTask,
  "id" | "title" | "description" | "timeLabel" | "startTime" | "endTime" | "ownerId" | "ownerName" | "status" | "isPersisted"
>;

export type MemberEventArea = {
  slug: string;
  name: string;
  description: string;
  tasks: MemberAreaTask[];
};

export type MemberDiscussionItem = {
  id: string;
  title: string;
  updatedLabel: string;
  href?: string;
};

export type MemberEventPreview = {
  slug: string;
  title: string;
  description: string;
  dateLabel: string;
  location?: string;
};

export type MemberHubEvent = MemberEventPreview & {
  image?: string;
  areas: MemberEventArea[];
  openNeeds: MemberTask[];
  discussion: MemberDiscussionItem[];
};

export function slugifyEventTitle(title: string): string {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("old settlers")) return "old-settlers-days";
  if (normalizedTitle.includes("fall fest")) return "fall-fest";
  if (normalizedTitle.includes("say no to snow")) return "say-no-to-snow";
  if (normalizedTitle.includes("haunted house")) return "haunted-house";

  return normalizedTitle.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildGenericAreas(): MemberEventArea[] {
  return [];
}

function buildGenericOpenNeeds(): MemberTask[] {
  return [];
}

export function getFallbackMemberEvents(): MemberEventPreview[] {
  return mockEvents.map((event) => ({
    slug: event.id,
    title: event.title,
    description: event.description,
    dateLabel: event.dateLabel,
    location: event.location,
  }));
}

export function getDashboardTaskLists(memberName?: string | null) {
  const displayName = memberName?.split(" ")[0] ?? "You";

  return {
    needsAHand: [
      {
        id: "need-portable-toilets",
        title: "Portable toilets for the event",
        timeLabel: "2 weeks before event",
        status: "open" as const,
        eventSlug: "old-settlers-days",
        eventTitle: "Old Settlers Days / Beer Tent",
        areaSlug: "raffle-licensing",
        areaName: "Raffle / Licensing",
      },
      {
        id: "need-entrance-signs",
        title: "Refresh entrance signs and wristband table plan",
        timeLabel: "Setup day, morning",
        status: "open" as const,
        eventSlug: "old-settlers-days",
        eventTitle: "Old Settlers Days / Beer Tent",
        areaSlug: "tent-setup",
        areaName: "Tent / Setup",
      },
      {
        id: "need-restock-plan",
        title: "Confirm beer tent restock plan for Saturday",
        timeLabel: "Saturday, 1:00\u20132:00 PM",
        status: "open" as const,
        eventSlug: "old-settlers-days",
        eventTitle: "Old Settlers Days / Beer Tent",
        areaSlug: "beer-service",
        areaName: "Beer Service",
      },
    ],
    whatIOwn: [
      {
        id: "own-paperwork",
        title: "Share vendor paperwork with the treasurer",
        ownerName: displayName,
        status: "owned" as const,
        eventSlug: "old-settlers-days",
        eventTitle: "Old Settlers Days / Beer Tent",
        areaSlug: "raffle-licensing",
        areaName: "Raffle / Licensing",
      },
      {
        id: "own-supply-bin",
        title: "Check the entrance supply bin before setup",
        ownerName: displayName,
        status: "owned" as const,
        eventSlug: "old-settlers-days",
        eventTitle: "Old Settlers Days / Beer Tent",
        areaSlug: "tent-setup",
        areaName: "Tent / Setup",
      },
    ],
  };
}

export const memberHubEvents: MemberHubEvent[] = [
  {
    slug: "old-settlers-days",
    title: "Old Settlers Days / Beer Tent",
    description:
      "A practical planning hub for the beer tent and surrounding event support work. Keep ownership visible, note what is still open, and help people stay coordinated without extra meetings.",
    dateLabel: "June 26–27",
    location: "Lanark Community Grounds",
    image: "/images/events/band-crop-2.jpg",
    areas: [
      {
        slug: "tent-setup",
        name: "Tent / Setup",
        description: "Tent layout, entrance table, wristbands, signs, and first-contact flow for guests.",
        tasks: [
          {
            id: "tent-setup-checklist",
            title: "Refresh entrance signs and wristband table plan",
            status: "open",
          },
          {
            id: "tent-setup-supplies",
            title: "Check the entrance supply bin before setup",
            ownerName: "Megan",
            status: "owned",
          },
        ],
      },
      {
        slug: "beer-service",
        name: "Beer Service",
        description: "Serving flow, cooler restock, and keeping the line moving smoothly.",
        tasks: [
          {
            id: "beer-restock",
            title: "Write down the cooler restock plan for Saturday",
            status: "open",
          },
          {
            id: "beer-setup",
            title: "Check cups, wristband stamp, and serving table setup",
            ownerName: "Chris",
            status: "owned",
          },
        ],
      },
      {
        slug: "tickets-money",
        name: "Tickets / Money",
        description: "Ticket sales, cash handling, and nightly reconciliation.",
        tasks: [],
      },
      {
        slug: "entertainment",
        name: "Entertainment",
        description: "Band and performer scheduling, stage coordination, and sound support.",
        tasks: [],
      },
      {
        slug: "parade-stage",
        name: "Parade & Stage",
        description: "Parade lineup, timing windows, and stage handoff flow.",
        tasks: [],
      },
      {
        slug: "raffle-licensing",
        name: "Raffle / Licensing",
        description: "Raffle ticket sales, licensing confirmations, porta-potty coordination, and vendor paperwork.",
        tasks: [
          {
            id: "raffle-toilets",
            title: "Portable toilets for the event",
            status: "open",
          },
          {
            id: "raffle-paperwork",
            title: "Share vendor paperwork with the treasurer",
            ownerName: "Pat",
            status: "owned",
          },
        ],
      },
      {
        slug: "food-pork-chop",
        name: "Food / Pork Chop",
        description: "Pork chop dinner coordination, Friday prep, cook count, and Saturday meal rush.",
        tasks: [],
      },
    ],
    openNeeds: [
      {
        id: "osd-open-1",
        title: "Portable toilets for the event",
        status: "open",
        eventSlug: "old-settlers-days",
        eventTitle: "Old Settlers Days / Beer Tent",
        areaSlug: "raffle-licensing",
        areaName: "Raffle / Licensing",
      },
      {
        id: "osd-open-2",
        title: "Refresh entrance signs and wristband table plan",
        status: "open",
        eventSlug: "old-settlers-days",
        eventTitle: "Old Settlers Days / Beer Tent",
        areaSlug: "tent-setup",
        areaName: "Tent / Setup",
      },
      {
        id: "osd-open-3",
        title: "Confirm beer tent restock plan for Saturday",
        status: "open",
        eventSlug: "old-settlers-days",
        eventTitle: "Old Settlers Days / Beer Tent",
        areaSlug: "beer-service",
        areaName: "Beer Service",
      },
    ],
    discussion: [
      {
        id: "osd-thread-1",
        title: "Friday setup notes and who can arrive early",
        updatedLabel: "Updated today",
        href: "/forum",
      },
      {
        id: "osd-thread-2",
        title: "Vendor call list for beer tent support items",
        updatedLabel: "Updated this week",
        href: "/forum",
      },
    ],
  },
];

export function getMemberHubEvent(
  eventSlug: string,
  fallback?: Partial<MemberEventPreview>,
): MemberHubEvent {
  const knownEvent = memberHubEvents.find((event) => event.slug === eventSlug);

  if (knownEvent) {
    return knownEvent;
  }

  const title = fallback?.title ?? eventSlug.replace(/-/g, " ");
  const description =
    fallback?.description ??
    "A lightweight event page to keep ownership visible and help members coordinate around real work.";

  return {
    slug: eventSlug,
    title,
    description,
    dateLabel: fallback?.dateLabel ?? "Date coming soon",
    location: fallback?.location,
    areas: buildGenericAreas(),
    openNeeds: buildGenericOpenNeeds(),
    discussion: [
      {
        id: `${eventSlug}-discussion-1`,
        title: `Quick planning notes for ${title}`,
        updatedLabel: "Start a thread when needed",
        href: "/forum",
      },
    ],
  };
}

export function getMemberArea(eventSlug: string, areaSlug: string, fallback?: Partial<MemberEventPreview>) {
  const event = getMemberHubEvent(eventSlug, fallback);
  return event.areas.find((area) => area.slug === areaSlug) ?? null;
}
