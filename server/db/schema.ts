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
export const typeEnum = pgEnum("type", ["todo", "note"]);

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  content: text("content").notNull(),
  type: typeEnum("type"),
});
