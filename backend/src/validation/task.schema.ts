import { z } from "zod";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export type TaskStatusInput = z.infer<typeof taskStatusSchema>;

export interface CreateTaskInput {
  title: string;
  status?: TaskStatusInput;
  developerId?: string;
  skills?: string[];
  subtasks?: CreateTaskInput[];
}

export const createTaskSchema: z.ZodType<CreateTaskInput> = z.lazy(() =>
  z.object({
    title: z.string().trim().min(1, "title is required"),
    status: taskStatusSchema.optional(),
    developerId: z.string().uuid("developerId must be a valid uuid").optional(),
    skills: z.array(z.string().trim().min(1)).optional(),
    subtasks: z.array(createTaskSchema).optional(),
  }),
);

export const updateTaskSchema = z
  .object({
    status: taskStatusSchema.optional(),
    developerId: z.string().uuid("developerId must be a valid uuid").nullable().optional(),
  })
  .refine((data) => data.status !== undefined || data.developerId !== undefined, {
    message: "At least one of status or developerId must be provided",
  });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
