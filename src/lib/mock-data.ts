/**
 * Static fallback data used when DATABASE_URL is not configured.
 * This lets the public site render locally without a database connection.
 * In production (DATABASE_URL is set), this file is never used.
 */

const now = new Date();

export type SiteEvent = {
  id: string;
  title: string;
  dateLabel: string;
  description: string;
  location?: string;
  image?: string;
  featuredOnHome?: boolean;
};

const monthOrder: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function getEventSortKey(dateLabel: string): [number, number] {
  const match = dateLabel.match(/^([A-Za-z]+)\s+(\d{1,2})/);
  if (!match) {
    return [99, 99];
  }

  const [, monthName, dayValue] = match;
  return [monthOrder[monthName.toLowerCase()] ?? 99, Number(dayValue)];
}

export const mockEvents: SiteEvent[] = [
  {
    id: "say-no-to-snow",
    title: "Say No To Snow 5K Race to Benefit the Lanark Community of Churches",
    dateLabel: "February 27",
    description:
      "A community 5K that supports the Lanark Community of Churches and brings neighbors together in the winter season.",
    location: "Lanark Parks & Recreation",
  },
  {
    id: "old-settlers-days",
    title: "Old Settlers Days Music and Beer Tent",
    dateLabel: "June 26 & 27",
    description:
      "Live music, a welcoming beer tent, and one of Lanark's signature summer community gatherings.",
    location: "Lanark Community Grounds",
    image: "/images/events/old-settlers-poster.jpg",
    featuredOnHome: true,
  },
  {
    id: "fall-fest",
    title: "Fall Fest – Cooking and Fun",
    dateLabel: "October 10",
    description:
      "A festive fall gathering centered on good food, cooking, and family-friendly fun.",
    location: "Central Park Pavilion",
    featuredOnHome: true,
  },
  {
    id: "haunted-house",
    title: "Citywide Haunted House",
    dateLabel: "October 31",
    description:
      "Lanark's Halloween tradition returns with a citywide haunted house experience for the community.",
    location: "Historic Downtown Building",
    featuredOnHome: true,
  },
  {
    id: "youth-basketball",
    title: "Youth Basketball Camp with the Athletic Club",
    dateLabel: "December 11",
    description:
      "A youth camp focused on skill-building and teamwork in partnership with the Athletic Club.",
    location: "Lanark High School Gymnasium",
  },
];

export function sortEventsByMonth(events: SiteEvent[]): SiteEvent[] {
  return [...events].sort((a, b) => {
    const [aMonth, aDay] = getEventSortKey(a.dateLabel);
    const [bMonth, bDay] = getEventSortKey(b.dateLabel);
    if (aMonth !== bMonth) return aMonth - bMonth;
    return aDay - bDay;
  });
}

export const mockHighlights = [
  {
    id: "mock-highlight-1",
    heading: "Community Events",
    body: "We host regular events throughout the year — dinners, fundraisers, and community service days. Everyone is welcome.",
    linkText: "View Events",
    linkHref: "/events",
    sortOrder: 1,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-highlight-2",
    heading: "Local Projects",
    body: "From park improvements to scholarship programs, the Lanark Community Club invests in the people and places we love.",
    linkText: "See Projects",
    linkHref: "/projects",
    sortOrder: 2,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-highlight-3",
    heading: "Scholarships",
    body: "Each year we award scholarships to deserving local students. Learn about our scholarship program and past recipients.",
    linkText: "Learn More",
    linkHref: "/scholarships",
    sortOrder: 3,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * Get featured events for homepage preview, sorted chronologically.
 * Returns events marked with featuredOnHome: true.
 */
export function getFeaturedEvents(events: SiteEvent[]): SiteEvent[] {
  return sortEventsByMonth(events.filter((event) => event.featuredOnHome));
}

export const mockFeaturedProjects = [
  {
    id: "mock-project-1",
    title: "Main Street Beautification",
    description: "Planted trees, installed flower boxes, and repainted benches along Main Street to brighten downtown Lanark.",
    status: "completed",
    year: now.getFullYear() - 1,
    imageUrl: null,
    isFeatured: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-project-2",
    title: "Annual Student Scholarships",
    description: "We award scholarships each spring to graduating seniors who demonstrate academic excellence and community involvement.",
    status: "ongoing",
    year: now.getFullYear(),
    imageUrl: null,
    isFeatured: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-project-3",
    title: "Community Food Pantry Support",
    description: "Regular donations and volunteer hours to support the local food pantry serving families in need throughout Carroll County.",
    status: "ongoing",
    year: now.getFullYear(),
    imageUrl: null,
    isFeatured: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockProjects = [
  {
    id: "mock-project-park-restroom",
    title: "Public Park Restroom Project",
    description:
      "Coordinated fundraising, local contractor support, and volunteer labor to add safe, accessible restroom facilities at Lanark City Park.",
    status: "completed",
    year: now.getFullYear() - 1,
    imageUrl: null,
    isFeatured: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-project-gagaball-pit",
    title: "Gagaball Pit",
    description:
      "Built a durable gagaball pit near the playground to give elementary and middle school students a fun, active recreation option.",
    status: "completed",
    year: now.getFullYear() - 2,
    imageUrl: null,
    isFeatured: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-project-splash-pad-study",
    title: "Community Splash Pad Feasibility Study",
    description:
      "An active planning effort to evaluate location options, utility needs, and grant opportunities for a future splash pad project.",
    status: "ongoing",
    year: now.getFullYear(),
    imageUrl: null,
    isFeatured: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-project-future-community-initiatives",
    title: "Future Community Project Pipeline",
    description:
      "Reserved planning space for upcoming neighborhood priorities, including trail improvements, event infrastructure, and youth activity areas.",
    status: "planned",
    year: now.getFullYear() + 1,
    imageUrl: null,
    isFeatured: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
];

export type StickyTopic = {
  id: string;
  title: string;
  description: string;
  href: string;
  updatedLabel: string;
  pinned: true;
};

export const stickyTopics: StickyTopic[] = [
  {
    id: "sticky-club-rules",
    title: "Club Rules",
    description:
      "Start with our bylaws, member expectations, and practical guidelines for participating in meetings, events, and club discussions.",
    href: "/members/topics/club-rules",
    updatedLabel: "Reference topic",
    pinned: true,
  },
  {
    id: "sticky-meeting-notes",
    title: "Meeting Notes & Updates",
    description:
      "Catch up on key decisions, open action items, and officer updates from recent monthly meetings so you can jump back in quickly.",
    href: "/members/topics/meeting-notes",
    updatedLabel: "Catch up here first",
    pinned: true,
  },
  {
    id: "sticky-event-coordination",
    title: "Upcoming Event Coordination",
    description:
      "Find current event plans, volunteer sign-up needs, and day-of coordination notes so everyone knows what is covered and what still needs help.",
    href: "/members/topics/upcoming-event-coordination",
    updatedLabel: "Planning in progress",
    pinned: true,
  },
  {
    id: "sticky-volunteer-needs",
    title: "Volunteer Needs",
    description:
      "See open volunteer requests across club projects and events, including who to contact and where one extra set of hands can help most.",
    href: "/members/topics/volunteer-needs",
    updatedLabel: "Open ways to help",
    pinned: true,
  },
];
