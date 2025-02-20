import { Hono } from "hono";
import { applicationsTable, createDb, jobTable } from "@repo/database";
import { env } from "hono/adapter";
import { HonoType } from "../index.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";

export const applications = new Hono<HonoType>();

const route = applications.get(
    "/",
    zValidator(
        "query",
        z.object({
            status: z.enum(["in_review", "done", "canceled"]).optional(),
        })
    ),
    async (c) => {
        const user = c.get("user");
        const status = c.req.valid("query").status;

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const db = createDb(env(c));
        const applications = await db
            .select()
            .from(applicationsTable)
            .where(status ? eq(applicationsTable.status, status) : undefined)
            .orderBy(desc(applicationsTable.createdAt));

        return c.json({ applications });
    }
);

export default route;
