import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp,
    pgEnum,
    uuid,
} from "drizzle-orm/pg-core";

export const applicationStatus = pgEnum("application_status", [
    "in_review",
    "done",
    "canceled",
]);

export const jobTable = pgTable("jobs", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    company: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

export const userTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    experience: text().notNull(),
    skills: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

export const applicationTable = pgTable("applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id").references(() => jobTable.id),
    userId: uuid("user_id").references(() => userTable.id),
    status: applicationStatus().default("in_review").notNull(),
    aiAnalysis: text().notNull(),
    matchScore: integer().notNull(),
    feedback: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});
