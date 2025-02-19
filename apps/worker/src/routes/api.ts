import { Hono } from "hono";
import { createDb, jobTable } from "@repo/database";
import { env } from "hono/adapter";
export const api = new Hono();

const route = api
    .get("/", (c) => {
        return c.json({ message: "Hello Hono!" });
    })
    .post("/", (c) => {
        return c.json({ message: "Hello Hono, method: POST!" });
    })
    .get("/posts", async (c) => {
        const db = createDb(env(c));
        const jobs = await db.select().from(jobTable);
        return c.json({ message: "This is a test post", job: jobs });
    });

export default route;
