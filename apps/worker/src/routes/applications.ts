import { Hono } from "hono";
import { applicationsTable, createDb, jobTable } from "@repo/database";
import { env } from "hono/adapter";
import { HonoType } from "../index.js";

export const applications = new Hono<HonoType>();

const route = applications.get("/", async (c) => {
    const user = c.get("user");

    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const db = createDb(env(c));
    const applications = await db.select().from(applicationsTable);

    return c.json({ user, applications });
});

export default route;
