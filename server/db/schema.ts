import {
  varchar,
  pgTable,
  serial,
  timestamp,
  text,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["system", "user"]);

export const entries = pgTable("messages", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  content: text("content").notNull(),
  role: roleEnum("role").notNull(),
  tagId: integer("tag_id")
    .references(() => tags.id)
    .notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
});
