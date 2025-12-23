"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
function maskUrl(u) {
    return u.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}
function makePrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString)
        throw new Error("DATABASE_URL is not set (check Render env vars)");
    console.log("[DB] Using DATABASE_URL:", maskUrl(connectionString));
    const pool = new pg_1.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    return new client_1.PrismaClient({
        adapter,
        log: ["error", "warn"],
    });
}
exports.prisma = global.prisma ?? makePrismaClient();
if (process.env.NODE_ENV !== "production")
    global.prisma = exports.prisma;
