import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { TaskStatus } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}
const adapterUrl = new URL(connectionString);
adapterUrl.searchParams.delete("sslmode");

const adapter = new PrismaPg({
  connectionString: adapterUrl.toString(),
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

type MemberHubAreaSeed = {
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  tasks: Array<{
    title: string;
    description: string;
    displayOrder: number;
    status: TaskStatus;
    ownerEmail?: string;
  }>;
};

type MemberHubEventSeed = {
  slug: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  isPublic: boolean;
  isFeatured: boolean;
  showInMemberHub: boolean;
  areas: MemberHubAreaSeed[];
};

async function main() {
  console.log("Seeding database…");

  // ─── Local test admin user ─────────────────────────────────────────────────
  const localAdminPassword = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "admin@lanark.com" },
    update: {
      password: localAdminPassword,
      role: "ADMIN",
    },
    create: {
      name: "Local Admin",
      email: "admin@lanark.com",
      password: localAdminPassword,
      role: "ADMIN",
    },
  });

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
      slug: "annual-summer-picnic",
      title: "Annual Summer Picnic",
      description:
        "Join the LCC for our beloved annual summer picnic! Food, games, and great company for the whole family.",
      location: "City Park, Lanark",
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 11, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 15, 0),
      isPublic: true,
      isFeatured: true,
      showInMemberHub: false,
    },
    {
      slug: "fall-community-cleanup",
      title: "Fall Community Cleanup",
      description:
        "Help us keep Lanark beautiful! Volunteers meet at City Hall. Gloves and bags provided.",
      location: "City Hall, Lanark",
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 5, 9, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 5, 12, 0),
      isPublic: true,
      isFeatured: false,
      showInMemberHub: false,
    },
    {
      slug: "lcc-monthly-meeting",
      title: "LCC Monthly Meeting",
      description:
        "Regular monthly meeting for LCC members. Agenda includes upcoming events and project updates.",
      location: "Lanark Community Center",
      startDate: new Date(now.getFullYear(), now.getMonth(), 20, 18, 30),
      endDate: new Date(now.getFullYear(), now.getMonth(), 20, 20, 0),
      isPublic: false,
      isFeatured: false,
      showInMemberHub: true,
    },
    {
      slug: "old-settlers-days",
      title: "Old Settlers Days / Beer Tent",
      description:
        "A simple working hub for the OSD beer tent so members can see what is open, what is owned, and what still needs follow-through.",
      location: "Lanark Community Grounds",
      startDate: new Date(now.getFullYear(), 5, 26, 17, 0),
      endDate: new Date(now.getFullYear(), 5, 27, 23, 0),
      isPublic: true,
      isFeatured: true,
      showInMemberHub: true,
    },
    {
      slug: "fall-fest",
      title: "Fall Fest",
      description:
        "A practical coordination hub for vendor support, family activities, and day-of volunteer follow-through.",
      location: "Downtown Lanark",
      startDate: new Date(now.getFullYear(), 8, 28, 10, 0),
      endDate: new Date(now.getFullYear(), 8, 28, 18, 0),
      isPublic: true,
      isFeatured: false,
      showInMemberHub: true,
    },
    {
      slug: "haunted-house",
      title: "Haunted House",
      description:
        "A lightweight work hub for setup, volunteer rotations, and safe event flow through the haunted house weekend.",
      location: "Lanark Community Hall",
      startDate: new Date(now.getFullYear(), 9, 25, 17, 30),
      endDate: new Date(now.getFullYear(), 9, 26, 22, 0),
      isPublic: true,
      isFeatured: false,
      showInMemberHub: true,
    },
  ];

  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: e,
      create: e,
    });
  }

  const memberHubEventSeeds: MemberHubEventSeed[] = [
    {
      slug: "lcc-monthly-meeting",
      title: "LCC Monthly Meeting",
      description:
        "A simple planning hub for monthly club operations, member updates, and practical follow-through between meetings.",
      location: "Lanark Community Center",
      startDate: new Date(now.getFullYear(), now.getMonth(), 20, 18, 30),
      endDate: new Date(now.getFullYear(), now.getMonth(), 20, 20, 0),
      isPublic: false,
      isFeatured: false,
      showInMemberHub: true,
      areas: [
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
              description: "Quick setup before members arrive.",
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
              description: "Share key decisions and next steps after adjournment.",
              displayOrder: 0,
              status: TaskStatus.OPEN,
            },
          ],
        },
      ],
    },
    {
      slug: "old-settlers-days",
      title: "Old Settlers Days / Beer Tent",
      description:
        "A simple working hub for the OSD beer tent so members can see what is open, what is owned, and what still needs follow-through.",
      location: "Lanark Community Grounds",
      startDate: new Date(now.getFullYear(), 5, 26, 17, 0),
      endDate: new Date(now.getFullYear(), 5, 27, 23, 0),
      isPublic: true,
      isFeatured: true,
      showInMemberHub: true,
      areas: [
        {
          name: "Entrance",
          slug: "entrance",
          description: "Welcome table, wristbands, signs, and first-contact flow for guests.",
          displayOrder: 0,
          tasks: [
            {
              title: "Refresh entrance signs and wristband table plan",
              description: "Make sure the signs are easy to read and the welcome setup is ready to go.",
              displayOrder: 0,
              status: TaskStatus.OPEN,
            },
            {
              title: "Check the entrance supply bin before setup",
              description: "Give the supply tote a quick once-over so setup is not scrambling day-of.",
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
              description: "Write down the simple restock handoff so volunteers know what to watch.",
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
              description: "Check rental options, confirm delivery/service timing, and keep the baseline count in mind.",
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
      ],
    },
    {
      slug: "fall-fest",
      title: "Fall Fest",
      description:
        "A practical coordination hub for vendor support, family activities, and day-of volunteer follow-through.",
      location: "Downtown Lanark",
      startDate: new Date(now.getFullYear(), 8, 28, 10, 0),
      endDate: new Date(now.getFullYear(), 8, 28, 18, 0),
      isPublic: true,
      isFeatured: false,
      showInMemberHub: true,
      areas: [
        {
          name: "Vendor Row",
          slug: "vendor-row",
          description: "Local vendors, layout support, and booth communication.",
          displayOrder: 0,
          tasks: [
            {
              title: "Confirm vendor booth map",
              description: "Make sure setup locations are clear before load-in.",
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
              description: "Keep at least one person assigned to each activity block.",
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
              description: "Confirm coverage for peak foot traffic windows.",
              displayOrder: 0,
              status: TaskStatus.OPEN,
            },
          ],
        },
      ],
    },
    {
      slug: "haunted-house",
      title: "Haunted House",
      description:
        "A lightweight work hub for setup, volunteer rotations, and safe event flow through the haunted house weekend.",
      location: "Lanark Community Hall",
      startDate: new Date(now.getFullYear(), 9, 25, 17, 30),
      endDate: new Date(now.getFullYear(), 9, 26, 22, 0),
      isPublic: true,
      isFeatured: false,
      showInMemberHub: true,
      areas: [
        {
          name: "Set Design",
          slug: "set-design",
          description: "Decor zones, prop placement, and setup safety checks.",
          displayOrder: 0,
          tasks: [
            {
              title: "Finalize room-by-room setup checklist",
              description: "Keep setup simple and repeatable for volunteers.",
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
              description: "Share clear start/end windows for each role.",
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
              description: "Confirm routes are clear and volunteers know procedures.",
              displayOrder: 0,
              status: TaskStatus.OPEN,
            },
          ],
        },
      ],
    },
  ];

  for (const eventSeed of memberHubEventSeeds) {
    const event = await prisma.event.upsert({
      where: { slug: eventSeed.slug },
      update: {
        title: eventSeed.title,
        description: eventSeed.description,
        location: eventSeed.location,
        startDate: eventSeed.startDate,
        endDate: eventSeed.endDate,
        isPublic: eventSeed.isPublic,
        isFeatured: eventSeed.isFeatured,
        showInMemberHub: eventSeed.showInMemberHub,
      },
      create: {
        slug: eventSeed.slug,
        title: eventSeed.title,
        description: eventSeed.description,
        location: eventSeed.location,
        startDate: eventSeed.startDate,
        endDate: eventSeed.endDate,
        isPublic: eventSeed.isPublic,
        isFeatured: eventSeed.isFeatured,
        showInMemberHub: eventSeed.showInMemberHub,
      },
    });

    for (const areaSeed of eventSeed.areas) {
      const area = await prisma.eventArea.upsert({
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

      for (const taskSeed of areaSeed.tasks) {
        const owner = taskSeed.ownerEmail
          ? await prisma.user.findUnique({
              where: { email: taskSeed.ownerEmail },
              select: { id: true },
            })
          : null;

        await prisma.task.upsert({
          where: {
            eventAreaId_title: {
              eventAreaId: area.id,
              title: taskSeed.title,
            },
          },
          update: {
            description: taskSeed.description,
            displayOrder: taskSeed.displayOrder,
            status: owner ? taskSeed.status : TaskStatus.OPEN,
            ownerId: owner?.id ?? null,
            eventId: event.id,
          },
          create: {
            eventId: event.id,
            eventAreaId: area.id,
            title: taskSeed.title,
            description: taskSeed.description,
            displayOrder: taskSeed.displayOrder,
            status: owner ? taskSeed.status : TaskStatus.OPEN,
            ownerId: owner?.id ?? null,
          },
        });
      }
    }
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
  console.log("  admin@lanark.com / password123");
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
