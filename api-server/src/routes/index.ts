import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roomsRouter from "./rooms";
import readingsRouter from "./readings";
import alertsRouter from "./alerts";
import inspectionsRouter from "./inspections";
import recommendationsRouter from "./recommendations";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/rooms", roomsRouter);
router.use("/readings", readingsRouter);
router.use("/alerts", alertsRouter);
router.use("/inspections", inspectionsRouter);
router.use("/recommendations", recommendationsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
