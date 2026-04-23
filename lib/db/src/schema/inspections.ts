import { pgTable, serial, integer, text, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { roomsTable } from "./rooms";

export const inspectionsTable = pgTable("inspections", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => roomsTable.id, { onDelete: "cascade" }),
  inspector: text("inspector").notNull(),
  findings: text("findings").notNull(),
  mouldFound: boolean("mould_found").notNull().default(false),
  mouldArea: text("mould_area"),
  actionsTaken: text("actions_taken"),
  nextInspectionDate: date("next_inspection_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInspectionSchema = createInsertSchema(inspectionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspectionsTable.$inferSelect;
