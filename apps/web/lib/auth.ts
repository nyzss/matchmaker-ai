import { createAuthClient } from "@repo/auth";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
    {
        baseURL: "http://localhost:8787",
    }
);
