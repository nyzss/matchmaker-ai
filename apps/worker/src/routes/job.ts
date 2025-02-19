import { Hono } from "hono";
import { createDb, jobTable } from "@repo/database";
import { env } from "hono/adapter";
import { HonoType } from "../index.js";

export const job = new Hono<HonoType>();

const route = job.get("/", async (c) => {
    const user = c.get("user");

    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const db = createDb(env(c));
    const jobs = await db.select().from(jobTable);

    return c.json({ jobs });
});

export default route;
