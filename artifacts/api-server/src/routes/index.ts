import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sensorRouter from "./sensor";
import deviceRouter from "./device";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sensorRouter);
router.use(deviceRouter);

export default router;
