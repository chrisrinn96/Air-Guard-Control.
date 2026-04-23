import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { roomsTable } from "./rooms";

export const alertTypeEnum = pgEnum("alert_type", [
  "high_humidity",
  "low_humidity",
  "high_temperature",
  "low_temperature",
  "high_mould_risk",
  "critical_mould_risk",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "warning",
  "danger",
  "critical",
]);

export const alertStatusEnum = pgEnum("alert_status", ["active", "resolved"]);

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => roomsTable.id, { onDelete: "cascade" }),
  type: alertTypeEnum("type").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  message: text("message").notNull(),
  status: alertStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
  status: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
