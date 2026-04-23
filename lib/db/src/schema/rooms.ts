import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomTypeEnum = pgEnum("room_type", [
  "bedroom",
  "bathroom",
  "kitchen",
  "living_room",
  "basement",
  "attic",
  "garage",
  "other",
]);

export const mouldRiskEnum = pgEnum("mould_risk_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const roomsTable = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: roomTypeEnum("type").notNull().default("other"),
  location: text("location").notNull(),
  mouldRiskLevel: mouldRiskEnum("mould_risk_level").notNull().default("low"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(roomsTable).omit({
  id: true,
  createdAt: true,
  mouldRiskLevel: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof roomsTable.$inferSelect;
