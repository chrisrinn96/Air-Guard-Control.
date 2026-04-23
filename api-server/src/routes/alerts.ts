import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { alertsTable, roomsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const status = (req.query.status as string) || "active";

  const query = db
    .select({
      id: alertsTable.id,
      roomId: alertsTable.roomId,
      roomName: roomsTable.name,
      type: alertsTable.type,
      severity: alertsTable.severity,
      message: alertsTable.message,
      status: alertsTable.status,
      createdAt: alertsTable.createdAt,
      resolvedAt: alertsTable.resolvedAt,
    })
    .from(alertsTable)
    .leftJoin(roomsTable, eq(alertsTable.roomId, roomsTable.id));

  let alerts;
  if (status === "all") {
    alerts = await query;
  } else {
    alerts = await query.where(eq(alertsTable.status, status as "active" | "resolved"));
  }

  res.json(alerts.map(a => ({
    ...a,
    createdAt: a.createdAt?.toISOString(),
    resolvedAt: a.resolvedAt?.toISOString() ?? null,
  })));
});

router.put("/:id/resolve", async (req, res) => {
  const id = parseInt(req.params.id);
  const [alert] = await db.update(alertsTable)
    .set({ status: "resolved", resolvedAt: new Date() })
    .where(eq(alertsTable.id, id))
    .returning();

  if (!alert) return res.status(404).json({ error: "Alert not found" });

  const [room] = await db.select({ name: roomsTable.name }).from(roomsTable).where(eq(roomsTable.id, alert.roomId));

  res.json({
    ...alert,
    roomName: room?.name ?? "",
    createdAt: alert.createdAt.toISOString(),
    resolvedAt: alert.resolvedAt?.toISOString() ?? null,
  });
});

export default router;
