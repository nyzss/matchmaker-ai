import { Hono } from "hono";
import { createDb, jobTable } from "@repo/database";
import { env } from "hono/adapter";
import { HonoType } from "../index.js";

export const slack = new Hono<HonoType>();

const route = slack
    .get("/", async (c) => {
        const text = await c.req.text();
        console.log("SLACK GET RECEIVED", text);
        return c.json({
            message: "Slack message received",
            body: text,
        });
    })
    .post("/", async (c) => {
        const text = await c.req.text();
        console.log("SLACK MESSAGE RECEIVED", text);
        // const db = createDb(env(c));

        // const jobs = await db.select().from(jobTable);

        return c.json({
            message: "Slack message received",
            body: text,
        });
    });

export default route;
