import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
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

const eventTitle = "Old Settlers Days / Beer Tent";
const eventSlug = "old-settlers-days";
const now = new Date();
const pilotYear = now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();

type PilotAreaSeed = {
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

const areaSeeds: PilotAreaSeed[] = [
  {
    name: "Tent / Setup",
    slug: "tent-setup",
    description: "Tent layout, entrance table, wristbands, signs, and first-contact flow for guests.",
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
    name: "Tickets / Money",
    slug: "tickets-money",
    description: "Ticket sales, cash handling, and nightly reconciliation.",
    displayOrder: 2,
    tasks: [],
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    description: "Band and performer scheduling, stage coordination, and sound support.",
    displayOrder: 3,
    tasks: [],
  },
  {
    name: "Parade & Stage",
    slug: "parade-stage",
    description: "Parade lineup, timing windows, and stage handoff flow.",
    displayOrder: 4,
    tasks: [],
  },
  {
    name: "Raffle / Licensing",
    slug: "raffle-licensing",
    description: "Raffle ticket sales, licensing confirmations, porta-potty coordination, and vendor paperwork.",
    displayOrder: 5,
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
  {
    name: "Food / Pork Chop",
    slug: "food-pork-chop",
    description: "Pork chop dinner coordination, Friday prep, cook count, and Saturday meal rush.",
    displayOrder: 6,
    tasks: [],
  },
];

async function main() {
  let event =
    (await prisma.event.findFirst({
      where: {
        OR: [{ slug: eventSlug }, { title: eventTitle }, { title: { contains: "Old Settlers" } }],
        archived: false,
      },
      orderBy: { startDate: "asc" },
    })) ??
    (await prisma.event.create({
      data: {
        title: eventTitle,
        slug: eventSlug,
        description:
          "A simple working hub for the OSD beer tent so members can see what is open, what is owned, and what still needs follow-through.",
        location: "Lanark Community Grounds",
        startDate: new Date(pilotYear, 5, 26, 17, 0),
        endDate: new Date(pilotYear, 5, 27, 23, 0),
        isPublic: false,
        isFeatured: true,
        showInMemberHub: true,
      },
    }));

  if (event.slug !== eventSlug || !event.showInMemberHub) {
    event = await prisma.event.update({
      where: { id: event.id },
      data: { slug: eventSlug, showInMemberHub: true },
    });
  }

  for (const areaSeed of areaSeeds) {
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
        ? await prisma.user.findUnique({ where: { email: taskSeed.ownerEmail }, select: { id: true } })
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
          eventId: event.id,
        },
        create: {
          eventId: event.id,
          eventAreaId: area.id,
          title: taskSeed.title,
          description: taskSeed.description,
          displayOrder: taskSeed.displayOrder,
          status: owner ? taskSeed.status : TaskStatus.OPEN,
          ownerId: owner?.id,
        },
      });
    }
  }

  const [areas, tasks] = await Promise.all([
    prisma.eventArea.findMany({
      where: { eventId: event.id },
      orderBy: { displayOrder: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.task.findMany({
      where: { eventId: event.id },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        title: true,
        status: true,
        owner: { select: { name: true } },
      },
    }),
  ]);

  console.log(JSON.stringify({ event: event.title, areaCount: areas.length, taskCount: tasks.length, areas, tasks }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
