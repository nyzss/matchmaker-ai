import { createDb } from ".";
import { jobTable } from "./db/schema";

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined");
    }
    const db = createDb({ DATABASE_URL: process.env.DATABASE_URL });

    // customer support at Doctolib
    const job: typeof jobTable.$inferInsert = {
        title: "Customer Support",
        description:
            "You will be responsible for providing support to our customers.",
        company: "Doctolib",
    };

    await db.insert(jobTable).values(job);
    console.log("New job created!");

    const jobs = await db.select().from(jobTable);
    console.log("Getting all jobs from the database: ", jobs);
}

main();
