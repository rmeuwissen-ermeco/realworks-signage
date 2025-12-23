import "dotenv/config";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function maskUrl(u: string) {
  return u.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

function makePrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (check Render env vars)");

  console.log("[DB] Using DATABASE_URL:", maskUrl(connectionString));

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export const prisma = global.prisma ?? makePrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
