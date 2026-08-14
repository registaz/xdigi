import { Request, Response } from "express";
import { createTaskSchema, updateTaskSchema } from "../validation/task.schema";
import * as taskService from "../services/task.service";

export async function createTaskHandler(req: Request, res: Response): Promise<void> {
  const input = createTaskSchema.parse(req.body);
  const task = await taskService.createTask(input);
  res.status(201).json(task);
}

export async function listTasksHandler(_req: Request, res: Response): Promise<void> {
  const tasks = await taskService.listTasks();
  res.json(tasks);
}

export async function getTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await taskService.getTaskById(req.params.id);
  res.json(task);
}

export async function updateTaskHandler(req: Request, res: Response): Promise<void> {
  const input = updateTaskSchema.parse(req.body);
  const task = await taskService.updateTask(req.params.id, input);
  res.json(task);
}

export async function deleteTaskHandler(req: Request, res: Response): Promise<void> {
  await taskService.deleteTask(req.params.id);
  res.status(204).send();
}
