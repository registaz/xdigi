import { apiClient } from "./client";
import type { Skill } from "../types";

export const skillsApi = {
  list: (): Promise<Skill[]> => apiClient.get<Skill[]>("/skills"),
};
