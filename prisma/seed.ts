import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database…");

  // ─── Admin user ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lanarkcommunityclub.com" },
    update: {},
    create: {
      name: "Club Admin",
      email: "admin@lanarkcommunityclub.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const officerPassword = await bcrypt.hash("officer123!", 12);
  const officer = await prisma.user.upsert({
    where: { email: "officer@lanarkcommunityclub.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "officer@lanarkcommunityclub.com",
      password: officerPassword,
      role: "OFFICER",
    },
  });

  const memberPassword = await bcrypt.hash("member123!", 12);
  await prisma.user.upsert({
    where: { email: "member@lanarkcommunityclub.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "member@lanarkcommunityclub.com",
      password: memberPassword,
      role: "MEMBER",
      bio: "Lifelong Lanark resident and LCC member.",
    },
  });

  // ─── Homepage highlights ─────────────────────────────────────────────────────
  const highlights = [
    {
      heading: "Community Events",
      body: "Join us for seasonal events, neighborhood gatherings, and community celebrations throughout the year.",
      linkText: "View events",
      linkHref: "/events",
      sortOrder: 0,
    },
    {
      heading: "Park Improvements",
      body: "Thanks to member donations, we recently completed new restroom facilities at City Park, open to all.",
      linkText: "Our projects",
      linkHref: "/projects",
      sortOrder: 1,
    },
    {
      heading: "Local Scholarships",
      body: "Each year the LCC awards scholarships to outstanding local students. We've supported over 80 recipients since 1972.",
      linkText: "Learn more",
      linkHref: "/scholarships",
      sortOrder: 2,
    },
  ];

  for (const h of highlights) {
    await prisma.homepageHighlight.create({ data: h });
  }

  // ─── Events ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const events = [
    {
      title: "Annual Summer Picnic",
      description:
        "Join the LCC for our beloved annual summer picnic! Food, games, and great company for the whole family.",
      location: "City Park, Lanark",
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 11, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 15, 0),
      isPublic: true,
      isFeatured: true,
    },
    {
      title: "Fall Community Cleanup",
      description:
        "Help us keep Lanark beautiful! Volunteers meet at City Hall. Gloves and bags provided.",
      location: "City Hall, Lanark",
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 5, 9, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 5, 12, 0),
      isPublic: true,
      isFeatured: false,
    },
    {
      title: "LCC Monthly Meeting",
      description:
        "Regular monthly meeting for LCC members. Agenda includes upcoming events and project updates.",
      location: "Lanark Community Center",
      startDate: new Date(now.getFullYear(), now.getMonth(), 20, 18, 30),
      endDate: new Date(now.getFullYear(), now.getMonth(), 20, 20, 0),
      isPublic: false,
      isFeatured: false,
    },
  ];

  for (const e of events) {
    await prisma.event.create({ data: e });
  }

  // ─── Projects ────────────────────────────────────────────────────────────────
  const projects = [
    {
      title: "City Park Restroom Renovation",
      description:
        "The LCC funded and coordinated the renovation of the public restroom facilities at City Park. The project included new fixtures, improved accessibility, and better lighting. Now open year-round.",
      status: "completed",
      year: 2023,
      isFeatured: true,
    },
    {
      title: "Gaga Ball Pit",
      description:
        "Working with local youth groups, the LCC donated and installed a Gaga Ball pit at the park. Gaga Ball is a fast-paced, low-impact sport great for kids of all ages.",
      status: "completed",
      year: 2022,
      isFeatured: true,
    },
    {
      title: "Park Bench Restoration",
      description:
        "Restored and repainted park benches throughout Lanark's public spaces, giving them new life for residents and visitors to enjoy.",
      status: "completed",
      year: 2021,
      isFeatured: false,
    },
    {
      title: "Downtown Flower Planting",
      description:
        "Volunteer planting and maintenance of flower beds in the downtown area, brightening the community spaces that residents walk through every day.",
      status: "ongoing",
      year: now.getFullYear(),
      isFeatured: true,
    },
  ];

  for (const p of projects) {
    await prisma.project.create({ data: p });
  }

  // ─── Scholarships ────────────────────────────────────────────────────────────
  const scholarships = [
    { recipientName: "Emily Johnson", year: 2024, amount: 1000, description: "University of Illinois, Pre-Med" },
    { recipientName: "Marcus Williams", year: 2024, amount: 1000, description: "Illinois State University, Education" },
    { recipientName: "Sophia Chen", year: 2023, amount: 750, description: "Rock Valley College, Business" },
    { recipientName: "Tyler Anderson", year: 2023, amount: 750, description: "UW-Madison, Engineering" },
    { recipientName: "Olivia Martinez", year: 2022, amount: 500, description: "Northern Illinois University" },
    { recipientName: "James Thompson", year: 2022, amount: 500, description: "Community College of Illinois" },
  ];

  for (const s of scholarships) {
    await prisma.scholarship.create({ data: s });
  }

  // ─── Announcements ───────────────────────────────────────────────────────────
  const announcements = [
    {
      title: "Welcome to the New LCC Website!",
      body: "We're excited to launch our new members area. Use the discussion board to connect with fellow members, check the calendar for upcoming events, and update your profile. If you have questions, reach out to any officer.",
      isPinned: true,
      authorId: admin.id,
    },
    {
      title: "Summer Picnic Planning Volunteers Needed",
      body: "We need help planning this year's Summer Picnic! Specifically looking for: setup crew, food coordinator, and kids activities organizer. Reply to this announcement or reach out directly.",
      isPinned: false,
      authorId: officer.id,
    },
  ];

  for (const a of announcements) {
    await prisma.announcement.create({ data: a });
  }

  // ─── Forum threads ───────────────────────────────────────────────────────────
  const thread = await prisma.thread.create({
    data: {
      title: "Ideas for next year's community projects?",
      body: "We're starting to plan next year's projects and would love to hear from members! What improvements would you like to see in Lanark? Any ideas for fundraisers or community events?",
      authorId: officer.id,
    },
  });

  await prisma.post.create({
    data: {
      body: "I'd love to see new picnic tables added to the park. The current ones are getting pretty worn. Maybe a fundraiser car wash could raise the funds?",
      threadId: thread.id,
      authorId: admin.id,
    },
  });

  console.log("✅ Seed complete.");
  console.log("\nSample logins:");
  console.log("  admin@lanarkcommunityclub.com / admin123!");
  console.log("  officer@lanarkcommunityclub.com / officer123!");
  console.log("  member@lanarkcommunityclub.com / member123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
