import { hc } from "hono/client";
import { AppType } from "worker";

export const client = hc<AppType>("http://localhost:8787", {
    init: {
        credentials: "include",
    },
});
