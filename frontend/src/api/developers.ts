import { apiClient } from "./client";
import type { Developer } from "../types";

export const developersApi = {
  list: (): Promise<Developer[]> => apiClient.get<Developer[]>("/developers"),
};
