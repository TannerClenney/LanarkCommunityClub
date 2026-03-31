/**
 * Static fallback data used when DATABASE_URL is not configured.
 * This lets the public site render locally without a database connection.
 * In production (DATABASE_URL is set), this file is never used.
 */

const now = new Date();

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
    id: "mock-event-1",
    title: "Annual Community Dinner",
    description: "Join your neighbors for our annual potluck dinner and member meeting. Bring a dish to share!",
    location: "Lanark Community Hall",
    startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 18, 0),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 21, 0),
    isPublic: true,
    isFeatured: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-event-2",
    title: "Park Cleanup Day",
    description: "Help us keep Lanark beautiful! Gloves and bags provided. All ages welcome.",
    location: "City Park – Main Entrance",
    startDate: new Date(now.getFullYear(), now.getMonth() + 2, 5, 9, 0),
    endDate: new Date(now.getFullYear(), now.getMonth() + 2, 5, 12, 0),
    isPublic: true,
    isFeatured: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-event-3",
    title: "Scholarship Fundraiser",
    description: "A fun evening of silent auction and raffle to raise money for our annual student scholarships.",
    location: "Lanark VFW Hall",
    startDate: new Date(now.getFullYear(), now.getMonth() + 3, 20, 17, 30),
    endDate: null,
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
