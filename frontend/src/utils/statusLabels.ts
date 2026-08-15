import type { TaskStatus } from "../types";

export const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To-do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};
