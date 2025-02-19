import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { applicationTable, userTable, jobTable } from "./db/schema";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

export default db;

export { jobTable, userTable, applicationTable, db };
