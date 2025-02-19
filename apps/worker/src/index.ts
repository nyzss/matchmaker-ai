import { Hono } from "hono";
import api from "./routes/api";
import { cors } from "hono/cors";
import { createAuth } from "@repo/auth";
import { createDb } from "@repo/database";

const app = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        BETTER_AUTH_SECRET: string;
        BETTER_AUTH_URL: string;
    };
}>();

app.use(
    "*",
    cors({
        origin: "http://localhost:3000",
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => {
    const db = createDb(c.env);
    const auth = createAuth({
        db,
        secret: c.env.BETTER_AUTH_SECRET,
        baseURL: c.env.BETTER_AUTH_URL,
    });
    return auth.handler(c.req.raw);
});

const router = app.route("/api", api);

export default app;

export type AppType = typeof router;
