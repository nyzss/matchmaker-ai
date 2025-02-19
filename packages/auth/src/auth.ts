import {
    userTable,
    sessionTable,
    accountTable,
    verificationTable,
} from "@repo/database";
import { betterAuth } from "better-auth";
import { DB, drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthClient } from "better-auth/react";
import "dotenv/config";

const createAuth = ({
    db,
    secret,
    baseURL,
}: {
    db: DB;
    secret: string;
    baseURL: string;
}) => {
    const auth = betterAuth({
        database: drizzleAdapter(db, {
            provider: "pg",
            schema: {
                user: userTable,
                session: sessionTable,
                account: accountTable,
                verification: verificationTable,
            },
        }),
        emailAndPassword: {
            enabled: true,
        },
        trustedOrigins: ["http://localhost:3000", "http://localhost:8787"],
        secret: secret,
        baseURL: baseURL,
    });
    return auth;
};

export { createAuth, createAuthClient };
