import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getDeveloperHandler, listDevelopersHandler } from "../controllers/developers.controller";

export const developerRouter = Router();

developerRouter.get("/", asyncHandler(listDevelopersHandler));
developerRouter.get("/:id", asyncHandler(getDeveloperHandler));
