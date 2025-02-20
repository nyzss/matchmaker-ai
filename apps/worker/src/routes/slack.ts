import { applicationsTable, createDb } from "@repo/database";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HonoType } from "../index.js";
import { WebClient } from "@slack/web-api";
export const slack = new Hono<HonoType>();

const route = slack
    .get("/", async (c) => {
        const text: { payload: string } = await c.req.parseBody();

        const json = JSON.parse(text.payload);
        console.log("SLACK GET RECEIVED, GET", json);
        return c.json({
            message: "Slack message received",
            body: json,
        });
    })
    .post("/", async (c) => {
        const text: { payload: string } = await c.req.parseBody();
        const json = JSON.parse(text.payload).actions;

        const applicationId = json[0].action_id;
        const feedback = json[0].value;

        const db = createDb(env(c));
        const applications = await db
            .update(applicationsTable)
            .set({ status: "done", feedback })
            .where(
                and(
                    eq(applicationsTable.id, applicationId),
                    eq(applicationsTable.status, "in_review")
                )
            )
            .returning();
        const slack = new WebClient(env(c).SLACK_BOT_TOKEN);

        if (!applications || applications.length === 0) {
            await slack.chat.postMessage({
                channel: "C08E9RZARB5",
                text: `Application '${applicationId}' was cancelled due to no feedback within the 2 minutes window.`,
            });

            return c.json({ error: "Application not found" }, 404);
        }

        await slack.chat.postMessage({
            channel: "C08E9RZARB5",
            text: `Application '${applicationId}' was approved with the following feedback: "${feedback}"`,
        });

        return c.json({
            message: "Slack message received",
            body: json,
        });
    });

export default route;
