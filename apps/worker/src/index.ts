import { Hono } from "hono";
import api from "./routes/api";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

const router = app.route("/api", api);

export default app;

export type AppType = typeof router;
