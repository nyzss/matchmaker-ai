import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

export const postsTable = pgTable("posts", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    tag: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});
