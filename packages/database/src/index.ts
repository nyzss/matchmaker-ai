import { drizzle } from "drizzle-orm/neon-http";
import {
    applicationsTable,
    candidatesTable,
    jobTable,
    userTable,
    sessionTable,
    accountTable,
    verificationTable,
} from "./db/schema";
import { neon } from "@neondatabase/serverless";

type Env = {
    DATABASE_URL: string;
};

const createDb = (env: Env) => {
    if (!env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined");
    }
    const sql = neon(env.DATABASE_URL);
    const db = drizzle(sql);
    return db;
};

export {
    jobTable,
    candidatesTable,
    applicationsTable,
    createDb,
    userTable,
    sessionTable,
    accountTable,
    verificationTable,
};
