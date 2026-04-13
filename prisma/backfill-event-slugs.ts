import "dotenv/config";
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

function slugifyEventTitle(title: string): string {
  const normalizedTitle = title.trim().toLowerCase();

  if (normalizedTitle.includes("old settlers")) return "old-settlers-days";
  if (normalizedTitle.includes("fall fest")) return "fall-fest";
  if (normalizedTitle.includes("say no to snow")) return "say-no-to-snow";
  if (normalizedTitle.includes("haunted house")) return "haunted-house";

  return normalizedTitle.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  const events = await prisma.event.findMany({
    orderBy: [{ createdAt: "asc" }, { title: "asc" }],
    select: { id: true, title: true, slug: true },
  });

  const usedSlugs = new Set(events.map((event) => event.slug).filter((slug): slug is string => Boolean(slug)));
  const updated: Array<{ title: string; slug: string }> = [];

  for (const event of events) {
    if (event.slug && event.slug.trim().length > 0) {
      continue;
    }

    const baseSlug = slugifyEventTitle(event.title) || "event";
    let candidateSlug = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(candidateSlug)) {
      candidateSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    await prisma.event.update({
      where: { id: event.id },
      data: { slug: candidateSlug },
    });

    usedSlugs.add(candidateSlug);
    updated.push({ title: event.title, slug: candidateSlug });
  }

  const remainingEmptySlugCount = await prisma.event.count({
    where: {
      slug: "",
    },
  });

  console.log(
    JSON.stringify(
      {
        updatedCount: updated.length,
        updated,
        remainingEmptySlugCount,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
