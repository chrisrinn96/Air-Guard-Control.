import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { roomsTable, readingsTable, alertsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/summary", async (_req, res) => {
  const [roomCount] = await db.select({ count: db.$count(roomsTable) }).from(roomsTable);
  const [alertCount] = await db.select({ count: db.$count(alertsTable) })
    .from(alertsTable)
    .where(eq(alertsTable.status, "active"));

  const rooms = await db.select().from(roomsTable);
  const criticalRooms = rooms.filter(r => r.mouldRiskLevel === "critical" || r.mouldRiskLevel === "high").length;

  const recentReadings = await db.select().from(readingsTable)
    .orderBy(desc(readingsTable.recordedAt))
    .limit(20);

  const humidities = recentReadings.map(r => r.humidity);
  const temperatures = recentReadings.map(r => r.temperature);
  const risks = recentReadings.map(r => r.mouldRiskScore);

  const avgHumidity = humidities.length ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0;
  const avgTemperature = temperatures.length ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0;
  const avgMouldRisk = risks.length ? risks.reduce((a, b) => a + b, 0) / risks.length : 0;

  res.json({
    totalRooms: Number(roomCount?.count ?? 0),
    activeAlerts: Number(alertCount?.count ?? 0),
    criticalRooms,
    avgHumidity: Math.round(avgHumidity * 10) / 10,
    avgTemperature: Math.round(avgTemperature * 10) / 10,
    avgMouldRisk: Math.round(avgMouldRisk * 10) / 10,
    lastUpdated: new Date().toISOString(),
  });
});

export default router;
