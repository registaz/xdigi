import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  createTaskHandler,
  deleteTaskHandler,
  getTaskHandler,
  listTasksHandler,
  updateTaskHandler,
} from "../controllers/tasks.controller";

export const taskRouter = Router();

taskRouter.post("/", asyncHandler(createTaskHandler));
taskRouter.get("/", asyncHandler(listTasksHandler));
taskRouter.get("/:id", asyncHandler(getTaskHandler));
taskRouter.patch("/:id", asyncHandler(updateTaskHandler));
taskRouter.delete("/:id", asyncHandler(deleteTaskHandler));
