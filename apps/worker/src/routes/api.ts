import { Hono } from "hono";

export const api = new Hono();

const route = api
    .get("/", (c) => {
        return c.json({ message: "Hello Hono!" });
    })
    .post("/", (c) => {
        return c.json({ message: "Hello Hono, method: POST!" });
    })
    .get("/posts", (c) => {
        return c.json({ message: "This is a test post" });
    });

export default route;
