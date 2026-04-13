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

async function main() {
  await prisma.event.updateMany({
    where: { title: { in: ["Annual Summer Picnic", "Fall Community Cleanup"] } },
    data: { showInMemberHub: false },
  });

  await prisma.event.updateMany({
    where: { title: "Annual Summer Picnic" },
    data: { slug: "annual-summer-picnic" },
  });

  await prisma.event.updateMany({
    where: { title: "Fall Community Cleanup" },
    data: { slug: "fall-community-cleanup" },
  });

  await prisma.event.updateMany({
    where: { title: "LCC Monthly Meeting" },
    data: { slug: "lcc-monthly-meeting" },
  });

  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    select: {
      title: true,
      slug: true,
      isPublic: true,
      showInMemberHub: true,
      archived: true,
    },
  });

  console.log(JSON.stringify(events, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
