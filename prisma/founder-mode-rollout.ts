import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

const dryRun = process.env.DRY_RUN !== "false";
const founderTempPassword = process.env.FOUNDER_TEMP_PASSWORD;

const EVENT_SLUGS_TO_DELETE = ["annual-summer-picnic", "fall-community-cleanup"] as const;
const ANNOUNCEMENT_TITLE_TO_DELETE = "Summer Picnic Planning Volunteers Needed";

const FOUNDER_USERS = [
  {
    name: "Tanner Clenney",
    email: "tanner.clenney@gmail.com",
    role: "PRESIDENT" as const,
    sourceEmails: ["admin@lanarkcommunityclub.com", "admin@lanark.com"],
  },
  {
    name: "Kevin Barnes",
    email: "kevinamy@mchsi.com",
    role: "VICE_PRESIDENT" as const,
    sourceEmails: ["officer@lanarkcommunityclub.com"],
  },
  {
    name: "Randy Beverley",
    email: "r08181962@yahoo.com",
    role: "SECRETARY" as const,
    sourceEmails: ["admin@lanark.com"],
  },
  {
    name: "Lynn Landherr",
    email: "lynn.landherr@gmail.com",
    role: "MEMBER" as const,
    sourceEmails: ["member@lanarkcommunityclub.com"],
  },
] as const;

type SummaryEntry = {
  type: string;
  identifier: string;
  action?: string;
  reason?: string;
  details?: string;
};

type Summary = {
  mode: "dry-run" | "apply";
  deleted: SummaryEntry[];
  updated: SummaryEntry[];
  created: SummaryEntry[];
  skipped: SummaryEntry[];
  notes: string[];
};

function pushEntry(collection: SummaryEntry[], entry: SummaryEntry) {
  collection.push(entry);
}

async function deleteFakeEvents(summary: Summary) {
  for (const slug of EVENT_SLUGS_TO_DELETE) {
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            areas: true,
            tasks: true,
          },
        },
      },
    });

    if (!event) {
      pushEntry(summary.skipped, {
        type: "event",
        identifier: slug,
        reason: "not found",
      });
      continue;
    }

    if (event._count.areas > 0 || event._count.tasks > 0) {
      pushEntry(summary.skipped, {
        type: "event",
        identifier: event.slug,
        reason: "has related operational data",
        details: `${event._count.areas} area(s), ${event._count.tasks} task(s)`,
      });
      continue;
    }

    if (dryRun) {
      pushEntry(summary.deleted, {
        type: "event",
        identifier: event.slug,
        action: "would delete",
        details: event.title,
      });
      continue;
    }

    await prisma.event.delete({ where: { id: event.id } });
    pushEntry(summary.deleted, {
      type: "event",
      identifier: event.slug,
      action: "deleted",
      details: event.title,
    });
  }
}

async function deleteFakeAnnouncement(summary: Summary) {
  const announcements = await prisma.announcement.findMany({
    where: { title: ANNOUNCEMENT_TITLE_TO_DELETE },
    select: { id: true, title: true },
  });

  if (announcements.length === 0) {
    pushEntry(summary.skipped, {
      type: "announcement",
      identifier: ANNOUNCEMENT_TITLE_TO_DELETE,
      reason: "not found",
    });
    return;
  }

  if (dryRun) {
    pushEntry(summary.deleted, {
      type: "announcement",
      identifier: ANNOUNCEMENT_TITLE_TO_DELETE,
      action: "would delete",
      details: `${announcements.length} matching record(s)`,
    });
    return;
  }

  await prisma.announcement.deleteMany({
    where: { title: ANNOUNCEMENT_TITLE_TO_DELETE },
  });

  pushEntry(summary.deleted, {
    type: "announcement",
    identifier: ANNOUNCEMENT_TITLE_TO_DELETE,
    action: "deleted",
    details: `${announcements.length} matching record(s)`,
  });
}

async function deleteScholarships(summary: Summary) {
  const scholarships = await prisma.scholarship.findMany({
    orderBy: [{ year: "desc" }, { recipientName: "asc" }],
    select: {
      id: true,
      recipientName: true,
      year: true,
    },
  });

  if (scholarships.length === 0) {
    pushEntry(summary.skipped, {
      type: "scholarship",
      identifier: "all scholarships",
      reason: "no records found",
    });
    return;
  }

  if (dryRun) {
    for (const scholarship of scholarships) {
      pushEntry(summary.deleted, {
        type: "scholarship",
        identifier: scholarship.id,
        action: "would delete",
        details: `${scholarship.recipientName} (${scholarship.year})`,
      });
    }
    return;
  }

  await prisma.scholarship.deleteMany({});

  for (const scholarship of scholarships) {
    pushEntry(summary.deleted, {
      type: "scholarship",
      identifier: scholarship.id,
      action: "deleted",
      details: `${scholarship.recipientName} (${scholarship.year})`,
    });
  }
}

async function upsertFounderUsers(summary: Summary) {
  const existingUsers = await prisma.user.findMany({
    where: {
      OR: [
        ...FOUNDER_USERS.map((user) => ({ email: user.email })),
        ...FOUNDER_USERS.flatMap((user) => user.sourceEmails.map((email) => ({ email }))),
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const existingByEmail = new Map(existingUsers.map((user) => [user.email.toLowerCase(), user]));
  const consumedSourceEmails = new Set<string>();

  let hashedPassword: string | null = null;
  if (!dryRun) {
    if (!founderTempPassword) {
      throw new Error("FOUNDER_TEMP_PASSWORD is required when DRY_RUN=false so the initial real users can sign in securely.");
    }
    hashedPassword = await bcrypt.hash(founderTempPassword, 12);
  }

  for (const founder of FOUNDER_USERS) {
    const existingRealUser = existingByEmail.get(founder.email.toLowerCase());

    if (existingRealUser) {
      const updateData = {
        name: founder.name,
        role: founder.role,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      };

      if (dryRun) {
        pushEntry(summary.updated, {
          type: "user",
          identifier: founder.email,
          action: "would update existing real user",
          details: `${existingRealUser.name ?? "Unnamed user"} → ${founder.name} (${founder.role})`,
        });
      } else {
        await prisma.user.update({
          where: { id: existingRealUser.id },
          data: updateData,
        });
        pushEntry(summary.updated, {
          type: "user",
          identifier: founder.email,
          action: "updated existing real user",
          details: `${founder.name} (${founder.role})`,
        });
      }
      continue;
    }

    const reusableSource = founder.sourceEmails
      .map((email) => existingByEmail.get(email.toLowerCase()))
      .find((user) => user && !consumedSourceEmails.has(user.email.toLowerCase()));

    if (reusableSource) {
      consumedSourceEmails.add(reusableSource.email.toLowerCase());

      if (dryRun) {
        pushEntry(summary.updated, {
          type: "user",
          identifier: reusableSource.email,
          action: "would repurpose sample user",
          details: `${reusableSource.name ?? "Unnamed user"} → ${founder.name} (${founder.email}, ${founder.role})`,
        });
      } else {
        await prisma.user.update({
          where: { id: reusableSource.id },
          data: {
            name: founder.name,
            email: founder.email,
            role: founder.role,
            password: hashedPassword,
          },
        });
        pushEntry(summary.updated, {
          type: "user",
          identifier: founder.email,
          action: "repurposed sample user",
          details: `${founder.name} (${founder.role})`,
        });
      }
      continue;
    }

    if (dryRun) {
      pushEntry(summary.created, {
        type: "user",
        identifier: founder.email,
        action: "would create",
        details: `${founder.name} (${founder.role})`,
      });
    } else {
      await prisma.user.create({
        data: {
          name: founder.name,
          email: founder.email,
          role: founder.role,
          password: hashedPassword,
        },
      });
      pushEntry(summary.created, {
        type: "user",
        identifier: founder.email,
        action: "created",
        details: `${founder.name} (${founder.role})`,
      });
    }
  }
}

async function main() {
  const summary: Summary = {
    mode: dryRun ? "dry-run" : "apply",
    deleted: [],
    updated: [],
    created: [],
    skipped: [],
    notes: [],
  };

  summary.notes.push("Tanner is assigned the PRESIDENT role; PRESIDENT already has board/admin access in the current role system.");
  summary.notes.push(
    dryRun
      ? "Dry run mode is enabled by default. No database changes will be written unless DRY_RUN=false is supplied."
      : "Apply mode is enabled. Database changes will be written.",
  );

  await deleteFakeEvents(summary);
  await deleteFakeAnnouncement(summary);
  await deleteScholarships(summary);
  await upsertFounderUsers(summary);

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
