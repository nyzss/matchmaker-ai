import { hc } from "hono/client";
import { AppType } from "../../worker/src";

export const client = hc<AppType>("http://localhost:8787");
