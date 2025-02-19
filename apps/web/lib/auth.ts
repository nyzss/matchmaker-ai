import { createAuthClient } from "@repo/auth";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
    {
        baseURL: "http://localhost:8787",
    }
);

export const useSession: ReturnType<typeof createAuthClient>["useSession"] =
    authClient.useSession;
