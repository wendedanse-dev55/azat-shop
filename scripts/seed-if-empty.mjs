import { PrismaClient } from "@prisma/client";
import { seed } from "../prisma/seed.mjs";

const prisma = new PrismaClient();

async function main() {
  let count = 0;
  try {
    count = await prisma.product.count();
  } catch {
    // Table may not exist yet on a brand-new database.
    count = 0;
  } finally {
    await prisma.$disconnect();
  }

  if (count === 0) {
    console.log("Database is empty — seeding demo data...");
    await seed();
  } else {
    console.log(`Database already has ${count} products — skipping seed.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
