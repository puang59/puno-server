import {
  varchar,
  pgTable,
  serial,
  timestamp,
  text,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const stateEnum = pgEnum("state", ["pending", "completed"]);

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  content: text("content").notNull(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  content: text("content").notNull(),
  state: stateEnum("state").default("pending"),
});
