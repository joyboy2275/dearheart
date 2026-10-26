import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, dedicationReports, dedications, users, type InsertDedication } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { DedicationCategory, ReportReason } from "../shared/dedications";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

function hideAnonymousAuthor<T extends { anonymous: boolean; authorName: string | null }>(row: T): T {
  return row.anonymous ? { ...row, authorName: null } : row;
}

export async function listPublicDedications(category: DedicationCategory | undefined, limit: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const visibilityFilter = eq(dedications.visibility, "public");
  const where = category ? and(visibilityFilter, eq(dedications.category, category)) : visibilityFilter;
  const rows = await db.select().from(dedications).where(where).orderBy(desc(dedications.createdAt)).limit(limit);
  return rows.map(hideAnonymousAuthor);
}

export async function getDedicationBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select().from(dedications).where(eq(dedications.slug, slug)).limit(1);
  return rows[0] ? hideAnonymousAuthor(rows[0]) : null;
}

export async function createDedication(input: Omit<InsertDedication, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(dedications).values(input);
  const rows = await db.select().from(dedications).where(eq(dedications.slug, input.slug)).limit(1);
  return rows[0] ? hideAnonymousAuthor(rows[0]) : null;
}

export async function createDedicationReport(input: { dedicationId: number; reason: ReportReason; details: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(dedicationReports).values(input);
  return { submitted: true as const };
}
