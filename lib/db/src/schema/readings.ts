import { pgTable, serial, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { roomsTable } from "./rooms";

export const readingSourceEnum = pgEnum("reading_source", [
  "manual",
  "bluetooth",
  "api",
]);

export const readingsTable = pgTable("readings", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => roomsTable.id, { onDelete: "cascade" }),
  humidity: real("humidity").notNull(),
  temperature: real("temperature").notNull(),
  co2: real("co2"),
  vocLevel: real("voc_level"),
  mouldRiskScore: real("mould_risk_score").notNull().default(0),
  source: readingSourceEnum("source").notNull().default("manual"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertReadingSchema = createInsertSchema(readingsTable).omit({
  id: true,
  recordedAt: true,
  mouldRiskScore: true,
});

export type InsertReading = z.infer<typeof insertReadingSchema>;
export type Reading = typeof readingsTable.$inferSelect;
