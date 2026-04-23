import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { inspectionsTable, roomsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const inspections = await db
    .select({
      id: inspectionsTable.id,
      roomId: inspectionsTable.roomId,
      roomName: roomsTable.name,
      inspector: inspectionsTable.inspector,
      findings: inspectionsTable.findings,
      mouldFound: inspectionsTable.mouldFound,
      mouldArea: inspectionsTable.mouldArea,
      actionsTaken: inspectionsTable.actionsTaken,
      nextInspectionDate: inspectionsTable.nextInspectionDate,
      createdAt: inspectionsTable.createdAt,
    })
    .from(inspectionsTable)
    .leftJoin(roomsTable, eq(inspectionsTable.roomId, roomsTable.id))
    .orderBy(desc(inspectionsTable.createdAt));

  res.json(inspections.map(i => ({
    ...i,
    createdAt: i.createdAt?.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const { roomId, inspector, findings, mouldFound, mouldArea, actionsTaken, nextInspectionDate } = req.body;
  if (!roomId || !inspector || !findings) {
    return res.status(400).json({ error: "roomId, inspector, and findings are required" });
  }

  const [inspection] = await db.insert(inspectionsTable).values({
    roomId,
    inspector,
    findings,
    mouldFound: mouldFound ?? false,
    mouldArea,
    actionsTaken,
    nextInspectionDate,
  }).returning();

  const [room] = await db.select({ name: roomsTable.name }).from(roomsTable).where(eq(roomsTable.id, roomId));

  res.status(201).json({
    ...inspection,
    roomName: room?.name ?? "",
    createdAt: inspection.createdAt.toISOString(),
  });
});

export default router;
