import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import "dotenv/config";
import { createDb } from ".";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const db = createDb({ DATABASE_URL: process.env.DATABASE_URL });

const main = async () => {
    try {
        console.log("⏳ Running migrations...");
        const start = Date.now();

        await migrate(db, { migrationsFolder: "drizzle" });

        const end = Date.now();
        console.log(`✅ Migrations completed in ${end - start}ms`);
    } catch (error) {
        console.error("❌ Migration failed");
        console.error(error);
        process.exit(1);
    }
    process.exit(0);
};

main();
