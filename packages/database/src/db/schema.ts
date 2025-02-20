import { relations } from "drizzle-orm";
import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp,
    pgEnum,
    uuid,
    boolean,
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

export const candidatesTable = pgTable("candidates", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    experience: text().notNull(),
    skills: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

export const applicationsTable = pgTable("applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id").references(() => jobTable.id),
    candidateId: uuid("candidate_id").references(() => candidatesTable.id),
    status: applicationStatus().default("in_review").notNull(),
    aiAnalysis: text().notNull(),
    matchScore: integer().notNull(),
    feedback: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

export const applicationsRelations = relations(
    applicationsTable,
    ({ one }) => ({
        job: one(jobTable, {
            fields: [applicationsTable.jobId],
            references: [jobTable.id],
        }),
        candidate: one(candidatesTable, {
            fields: [applicationsTable.candidateId],
            references: [candidatesTable.id],
        }),
    })
);

export const candidatesRelations = relations(candidatesTable, ({ many }) => ({
    applications: many(applicationsTable),
}));

export const jobsRelations = relations(jobTable, ({ many }) => ({
    applications: many(applicationsTable),
}));

// ########## Better Auth Schema ##########

export const userTable = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
});

export const accountTable = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verificationTable = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});
