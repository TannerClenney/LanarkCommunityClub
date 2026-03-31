/**
 * Static fallback data used when DATABASE_URL is not configured.
 * This lets the public site render locally without a database connection.
 * In production (DATABASE_URL is set), this file is never used.
 */

const now = new Date();

/**
 * Event interface for both homepage and events page.
 * @property date - Human-readable date string (e.g., "June 26–27, 2026")
 * @property monthDay - [month, day] tuple for chronological sorting across all events
 * @property featuredOnHome - Show this event in the homepage curated preview
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  image?: string;
  monthDay: [number, number]; // [month: 1-12, day: 1-31] for sorting
  featuredOnHome: boolean;
}

/**
 * All community events throughout the year.
 * Sorted chronologically for consistent ordering across all pages.
 */
export const mockEvents: Event[] = [
  {
    id: "say-no-to-snow",
    title: "Say No To Snow 5K Race",
    description:
      "A friendly 5K run to benefit the Lanark Community of Churches. Join neighbors and promote fitness and community spirit.",
    date: "February 27",
    location: "Lanark Parks & Recreation",
    monthDay: [2, 27],
    featuredOnHome: false,
  },
  {
    id: "old-settlers-days",
    title: "Old Settlers Days Music and Beer Tent",
    description:
      "Join us for live music, local beer, and community celebrations at the annual Old Settlers Days festival.",
    date: "June 26–27",
    location: "Lanark Community Grounds",
    image: "/images/events/old-settlers-poster.jpg",
    monthDay: [6, 26],
    featuredOnHome: true,
  },
  {
    id: "fall-fest",
    title: "Fall Fest – Cooking and Fun",
    description:
      "Celebrate autumn with cooking demonstrations, food tastings, and family-friendly activities throughout the day.",
    date: "October 10",
    location: "Central Park Pavilion",
    monthDay: [10, 10],
    featuredOnHome: true,
  },
  {
    id: "haunted-house",
    title: "Citywide Haunted House",
    description:
      "Experience thrills and chills at the annual community haunted house. A classic Halloween tradition for all ages.",
    date: "October 31",
    location: "Historic Downtown Building",
    monthDay: [10, 31],
    featuredOnHome: true,
  },
  {
    id: "youth-basketball",
    title: "Youth Basketball Camp",
    description:
      "A fun and instructional camp for community youth, organized in partnership with the Lanark Athletic Club.",
    date: "December 11",
    location: "Lanark High School Gymnasium",
    monthDay: [12, 11],
    featuredOnHome: false,
  },
];

/**
 * Sort events chronologically by month and day.
 */
export function sortEventsByMonth(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const [aMonth, aDay] = a.monthDay;
    const [bMonth, bDay] = b.monthDay;
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
export function getFeaturedEvents(events: Event[]): Event[] {
  return events
    .filter((e) => e.featuredOnHome)
    .sort((a, b) => {
      const [aMonth, aDay] = a.monthDay;
      const [bMonth, bDay] = b.monthDay;
      if (aMonth !== bMonth) return aMonth - bMonth;
      return aDay - bDay;
    });
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
