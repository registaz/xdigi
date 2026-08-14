import { apiClient } from "./client";
import type { CreateTaskPayload, Task, UpdateTaskPayload } from "../types";

export const tasksApi = {
  list: (): Promise<Task[]> => apiClient.get<Task[]>("/tasks"),
  get: (id: string): Promise<Task> => apiClient.get<Task>(`/tasks/${id}`),
  create: (payload: CreateTaskPayload): Promise<Task> => apiClient.post<Task>("/tasks", payload),
  update: (id: string, payload: UpdateTaskPayload): Promise<Task> =>
    apiClient.patch<Task>(`/tasks/${id}`, payload),
  remove: (id: string): Promise<void> => apiClient.delete<void>(`/tasks/${id}`),
};
