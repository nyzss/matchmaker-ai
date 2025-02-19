import { createDb } from "@repo/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

export const auth = betterAuth({
    database: drizzleAdapter(
        createDb({ DATABASE_URL: process.env.DATABASE_URL }),
        {
            provider: "pg",
        }
    ),
    emailAndPassword: {
        enabled: true,
    },
});
