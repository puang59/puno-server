import {
  varchar,
  pgTable,
  serial,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["system", "user"]);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  content: text("content").notNull(),
  role: roleEnum("role").notNull(),
});