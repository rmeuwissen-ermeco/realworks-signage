import { prisma } from "../src/db/prisma";

async function main() {
  const r = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log("DB OK:", r);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
