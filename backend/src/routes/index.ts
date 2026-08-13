import { Router } from "express";
import { healthRouter } from "./health.routes";
import { taskRouter } from "./tasks.routes";
import { developerRouter } from "./developers.routes";
import { skillRouter } from "./skills.routes";

export const router = Router();

router.use("/health", healthRouter);
router.use("/tasks", taskRouter);
router.use("/developers", developerRouter);
router.use("/skills", skillRouter);
