import { Env, Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "@repo/auth";
import { createDb } from "@repo/database";
import applications from "./routes/applications";
import jobs from "./routes/job";
import { functions } from "./lib/inngest";
import { inngest } from "./lib/inngest";
import { serve } from "inngest/hono";
import slack from "./routes/slack";

export interface HonoType extends Env {
    Bindings: {
        DATABASE_URL: string;
        BETTER_AUTH_SECRET: string;
        BETTER_AUTH_URL: string;
        OPENAI_API_KEY: string;
        SLACK_BOT_TOKEN: string;
    };
    Variables: {
        user: ReturnType<typeof createAuth>["$Infer"]["Session"]["user"] | null;
        session:
            | ReturnType<typeof createAuth>["$Infer"]["Session"]["session"]
            | null;
    };
}

const app = new Hono<HonoType>().basePath("/api");

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
app.use("*", async (c, next) => {
    const db = createDb(c.env);
    const auth = createAuth({
        db,
        secret: c.env.BETTER_AUTH_SECRET,
        baseURL: c.env.BETTER_AUTH_URL,
    });
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        c.set("user", null);
        c.set("session", null);
        return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
});

app.on(["POST", "GET"], "/auth/**", (c) => {
    const db = createDb(c.env);
    const auth = createAuth({
        db,
        secret: c.env.BETTER_AUTH_SECRET,
        baseURL: c.env.BETTER_AUTH_URL,
    });
    return auth.handler(c.req.raw);
});

app.on(
    ["GET", "PUT", "POST"],
    "/inngest",
    serve({
        client: inngest,
        functions,
    })
);

const router = app
    .route("/applications", applications)
    .route("/jobs", jobs)
    .route("/slack", slack);

export default router;

export type AppType = typeof router;
