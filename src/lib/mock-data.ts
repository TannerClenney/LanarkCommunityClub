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
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  image?: string;
  monthDay: [number, number]; // [month: 1-12, day: 1-31] for sorting
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
      "A friendly 5K race organized by the Lanark Community of Churches to promote fitness and community spirit.",
    date: "February 27",
    location: "Lanark Parks & Recreation",
    monthDay: [2, 27],
  },
  {
    id: "old-settlers-days",
    title: "Old Settlers Days Music and Beer Tent",
    description:
      "Join us for live music, local beer, and community celebrations at the annual Old Settlers Days.",
    date: "June 26–27",
    location: "Lanark Community Grounds",
    image: "/images/events/old-settlers-poster.jpg",
    monthDay: [6, 26],
  },
  {
    id: "fall-fest",
    title: "Fall Fest – Cooking and Fun",
    description:
      "Celebrate autumn with community cooking demonstrations, food tastings, and family-friendly activities.",
    date: "October 10",
    location: "Central Park Pavilion",
    monthDay: [10, 10],
  },
  {
    id: "haunted-house",
    title: "Citywide Haunted House",
    description:
      "Experience thrills and chills at the annual community haunted house, perfect for all who dare to enter.",
    date: "October 31",
    location: "Historic Downtown Building",
    monthDay: [10, 31],
  },
  {
    id: "youth-basketball",
    title: "Youth Basketball Camp",
    description:
      "A fun and instructional basketball camp for community youth, organized with the Lanark Athletic Club.",
    date: "December 11",
    location: "Lanark High School Gymnasium",
    monthDay: [12, 11],
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

export const mockUpcomingEvents = [
  {
    id: "mock-event-spring-breakfast",
    title: "Spring Pancake Breakfast",
    description:
      "Kick off spring with pancakes, coffee, and conversation. Breakfast proceeds support local youth programs.",
    location: "Lanark Community Hall",
    startDate: new Date(now.getFullYear(), now.getMonth() + 1, 12, 8, 30),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 12, 11, 0),
    isPublic: true,
    isFeatured: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-event-cleanup-day",
    title: "Community Cleanup Day",
    description:
      "Join neighbors to clean parks and downtown blocks. Gloves, trash bags, and water stations will be provided.",
    location: "Lincoln Park Main Entrance",
    startDate: new Date(now.getFullYear(), now.getMonth() + 1, 26, 9, 0),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 26, 12, 30),
    isPublic: true,
    isFeatured: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-event-spring-member-meeting",
    title: "Quarterly Member Meeting",
    description:
      "Members review current projects, vote on spring initiatives, and hear committee updates.",
    location: "Club Meeting Room",
    startDate: new Date(now.getFullYear(), now.getMonth() + 2, 4, 18, 30),
    endDate: new Date(now.getFullYear(), now.getMonth() + 2, 4, 20, 0),
    isPublic: false,
    isFeatured: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-event-scholarship-night",
    title: "Scholarship Fundraiser Night",
    description:
      "An evening of dinner, raffle baskets, and a silent auction to raise scholarship funds for graduating seniors.",
    location: "Lanark VFW Hall",
    startDate: new Date(now.getFullYear(), now.getMonth() + 2, 22, 17, 30),
    endDate: new Date(now.getFullYear(), now.getMonth() + 2, 22, 21, 30),
    isPublic: true,
    isFeatured: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-event-summer-picnic",
    title: "Summer Family Picnic",
    description:
      "Bring lawn chairs and enjoy games, music, and a shared picnic with families from across the community.",
    location: "North Shelter, Lanark City Park",
    startDate: new Date(now.getFullYear(), now.getMonth() + 3, 14, 11, 0),
    endDate: new Date(now.getFullYear(), now.getMonth() + 3, 14, 15, 0),
    isPublic: true,
    isFeatured: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
];

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
