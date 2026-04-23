import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { roomsTable, readingsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

function calcMouldRisk(humidity: number, temperature: number): number {
  let score = 0;
  if (humidity >= 80) score += 50;
  else if (humidity >= 70) score += 35;
  else if (humidity >= 60) score += 20;
  else score += 5;

  if (temperature < 10 || temperature > 30) score += 20;
  else if (temperature < 15 || temperature > 25) score += 10;

  return Math.min(100, score);
}

function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

router.get("/", async (_req, res) => {
  const rooms = await db.select().from(roomsTable).orderBy(roomsTable.createdAt);
  res.json(rooms.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const { name, type, location, notes } = req.body;
  if (!name || !type || !location) {
    return res.status(400).json({ error: "name, type, and location are required" });
  }
  const [room] = await db.insert(roomsTable).values({
    name,
    type,
    location,
    notes,
    mouldRiskLevel: "low",
  }).returning();
  res.status(201).json({ ...room, createdAt: room.createdAt.toISOString() });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ ...room, createdAt: room.createdAt.toISOString() });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, type, location, notes } = req.body;
  const [updated] = await db.update(roomsTable)
    .set({ name, type, location, notes })
    .where(eq(roomsTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Room not found" });
  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(roomsTable).where(eq(roomsTable.id, id));
  res.status(204).send();
});

router.get("/dashboard/summary", async (_req, res) => {
  const rooms = await db.select().from(roomsTable);
  const latestReadings = await db.select().from(readingsTable)
    .orderBy(desc(readingsTable.recordedAt))
    .limit(rooms.length * 2);

  const totalRooms = rooms.length;
  const criticalRooms = rooms.filter(r => r.mouldRiskLevel === "critical" || r.mouldRiskLevel === "high").length;
  
  const humidities = latestReadings.map(r => r.humidity);
  const temperatures = latestReadings.map(r => r.temperature);
  const risks = latestReadings.map(r => r.mouldRiskScore);
  
  const avgHumidity = humidities.length ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0;
  const avgTemperature = temperatures.length ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0;
  const avgMouldRisk = risks.length ? risks.reduce((a, b) => a + b, 0) / risks.length : 0;

  res.json({
    totalRooms,
    activeAlerts: 0,
    criticalRooms,
    avgHumidity: Math.round(avgHumidity * 10) / 10,
    avgTemperature: Math.round(avgTemperature * 10) / 10,
    avgMouldRisk: Math.round(avgMouldRisk * 10) / 10,
    lastUpdated: new Date().toISOString(),
  });
});

export { calcMouldRisk, getRiskLevel };
export default router;
