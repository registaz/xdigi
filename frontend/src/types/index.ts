export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface DeveloperRef {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  developer: DeveloperRef | null;
  skills: string[];
  subtasks: Task[];
}

export interface Developer {
  id: string;
  name: string;
  skills: string[];
  tasks: { id: string; title: string; status: TaskStatus; skills: string[] }[];
}

export interface Skill {
  id: string;
  name: string;
  developers: DeveloperRef[];
  tasks: { id: string; title: string; status: TaskStatus }[];
}

export interface CreateTaskPayload {
  title: string;
  status?: TaskStatus;
  developerId?: string;
  skills?: string[];
  subtasks?: CreateTaskPayload[];
}

export interface UpdateTaskPayload {
  status?: TaskStatus;
  developerId?: string | null;
}
