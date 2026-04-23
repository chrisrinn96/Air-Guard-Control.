import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { readingsTable, roomsTable, alertsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

function calcMouldRiskScore(humidity: number, temperature: number): number {
  let score = 0;
  if (humidity >= 80) score += 50;
  else if (humidity >= 70) score += 35;
  else if (humidity >= 60) score += 20;
  else score += 5;

  if (temperature < 10 || temperature > 30) score += 20;
  else if (temperature < 15 || temperature > 25) score += 10;

  return Math.min(100, score);
}

router.get("/", async (req, res) => {
  const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

  const query = db
    .select({
      id: readingsTable.id,
      roomId: readingsTable.roomId,
      roomName: roomsTable.name,
      humidity: readingsTable.humidity,
      temperature: readingsTable.temperature,
      co2: readingsTable.co2,
      vocLevel: readingsTable.vocLevel,
      mouldRiskScore: readingsTable.mouldRiskScore,
      source: readingsTable.source,
      recordedAt: readingsTable.recordedAt,
    })
    .from(readingsTable)
    .leftJoin(roomsTable, eq(readingsTable.roomId, roomsTable.id))
    .orderBy(desc(readingsTable.recordedAt))
    .limit(limit);

  const readings = roomId
    ? await query.where(eq(readingsTable.roomId, roomId))
    : await query;

  res.json(readings.map(r => ({ ...r, recordedAt: r.recordedAt?.toISOString() })));
});

router.get("/latest", async (_req, res) => {
  const rooms = await db.select().from(roomsTable);
  const latestReadings = await Promise.all(
    rooms.map(async (room) => {
      const [reading] = await db
        .select({
          id: readingsTable.id,
          roomId: readingsTable.roomId,
          roomName: roomsTable.name,
          humidity: readingsTable.humidity,
          temperature: readingsTable.temperature,
          co2: readingsTable.co2,
          vocLevel: readingsTable.vocLevel,
          mouldRiskScore: readingsTable.mouldRiskScore,
          source: readingsTable.source,
          recordedAt: readingsTable.recordedAt,
        })
        .from(readingsTable)
        .leftJoin(roomsTable, eq(readingsTable.roomId, roomsTable.id))
        .where(eq(readingsTable.roomId, room.id))
        .orderBy(desc(readingsTable.recordedAt))
        .limit(1);
      return reading;
    })
  );
  res.json(latestReadings
    .filter(Boolean)
    .map(r => ({ ...r, recordedAt: r!.recordedAt?.toISOString() })));
});

router.post("/", async (req, res) => {
  const { roomId, humidity, temperature, co2, vocLevel, source } = req.body;
  if (!roomId || humidity == null || temperature == null) {
    return res.status(400).json({ error: "roomId, humidity, and temperature are required" });
  }

  const mouldRiskScore = calcMouldRiskScore(humidity, temperature);

  const [reading] = await db.insert(readingsTable).values({
    roomId,
    humidity,
    temperature,
    co2,
    vocLevel,
    mouldRiskScore,
    source: source || "manual",
  }).returning();

  // Update room risk level
  let newRisk: "low" | "medium" | "high" | "critical" = "low";
  if (mouldRiskScore >= 75) newRisk = "critical";
  else if (mouldRiskScore >= 50) newRisk = "high";
  else if (mouldRiskScore >= 25) newRisk = "medium";

  await db.update(roomsTable)
    .set({ mouldRiskLevel: newRisk })
    .where(eq(roomsTable.id, roomId));

  // Auto-create alert if needed
  if (humidity > 70) {
    const severity = humidity > 80 ? "critical" : humidity > 75 ? "danger" : "warning";
    await db.insert(alertsTable).values({
      roomId,
      type: "high_humidity",
      severity: severity as "warning" | "danger" | "critical",
      message: `High humidity detected: ${humidity}% in room`,
    }).onConflictDoNothing();
  }

  const [room] = await db.select({ name: roomsTable.name }).from(roomsTable).where(eq(roomsTable.id, roomId));
  
  res.status(201).json({
    ...reading,
    roomName: room?.name ?? "",
    recordedAt: reading.recordedAt.toISOString(),
  });
});

export default router;
