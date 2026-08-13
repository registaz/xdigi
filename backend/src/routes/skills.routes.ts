import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getSkillHandler, listSkillsHandler } from "../controllers/skills.controller";

export const skillRouter = Router();

skillRouter.get("/", asyncHandler(listSkillsHandler));
skillRouter.get("/:id", asyncHandler(getSkillHandler));
