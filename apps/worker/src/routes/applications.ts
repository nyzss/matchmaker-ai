import { Hono } from "hono";
import { applicationsTable, createDb, jobTable } from "@repo/database";
import { env } from "hono/adapter";
import { HonoType } from "../index.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";

export const applications = new Hono<HonoType>();

const route = applications
    .get(
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

            const applications = await db.query.applications.findMany({
                with: {
                    job: true,
                    candidate: true,
                },
                where: status
                    ? eq(applicationsTable.status, status)
                    : undefined,
                orderBy: desc(applicationsTable.createdAt),
            });

            return c.json({ applications });
        }
    )
    .post(
        "/",
        zValidator(
            "json",
            z.object({
                applicationId: z.string(),
                feedback: z.string().min(1).max(1000),
            })
        ),
        async (c) => {
            const user = c.get("user");
            if (!user) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            const db = createDb(env(c));

            const { applicationId, feedback } = c.req.valid("json");

            const applications = await db
                .update(applicationsTable)
                .set({ status: "done", feedback })
                .where(eq(applicationsTable.id, applicationId))
                .returning();

            if (!applications || applications.length === 0) {
                return c.json({ error: "Application not found" }, 404);
            }

            return c.json({ application: applications });
        }
    );

export default route;
