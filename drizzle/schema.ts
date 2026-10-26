import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow. Login is not required by the dedication archive,
 * but the starter's existing auth schema is preserved for future use.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const dedications = mysqlTable("dedications", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  title: varchar("title", { length: 120 }),
  message: text("message").notNull(),
  category: mysqlEnum("category", ["lost", "cherished", "one-sided", "obsession", "unattainable"]).notNull(),
  authorName: varchar("authorName", { length: 80 }),
  recipientName: varchar("recipientName", { length: 80 }),
  anonymous: boolean("anonymous").default(true).notNull(),
  visibility: mysqlEnum("visibility", ["public", "private"]).default("private").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("dedications_visibility_created_idx").on(table.visibility, table.createdAt),
  index("dedications_category_idx").on(table.category),
]);

export type Dedication = typeof dedications.$inferSelect;
export type InsertDedication = typeof dedications.$inferInsert;

export const dedicationReports = mysqlTable("dedication_reports", {
  id: int("id").autoincrement().primaryKey(),
  dedicationId: int("dedicationId").notNull().references(() => dedications.id, { onDelete: "cascade" }),
  reason: mysqlEnum("reason", ["harmful", "abusive", "inappropriate", "other"]).notNull(),
  details: varchar("details", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("dedication_reports_dedication_idx").on(table.dedicationId),
]);

export type DedicationReport = typeof dedicationReports.$inferSelect;
