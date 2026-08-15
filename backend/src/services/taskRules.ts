import { Prisma, TaskStatus } from "@prisma/client";
import { AppError } from "../errors/AppError";

type TxClient = Prisma.TransactionClient;

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ["IN_PROGRESS"],
  IN_PROGRESS: ["TODO", "DONE"],
  DONE: ["IN_PROGRESS", "TODO"],
};

/**
 * Validates that a task status change follows an allowed transition.
 * Same-status "changes" are treated as no-ops and always allowed.
 */
export function assertValidStatusTransition(current: TaskStatus, next: TaskStatus): void {
  if (current === next) return;
  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw AppError.invalidTransition(`Cannot transition task status from ${current} to ${next}`);
  }
}

/**
 * Ensures a developer has every skill required by a task before allowing
 * assignment (developer skill set must be a superset of task skills).
 */
export function assertDeveloperHasRequiredSkills(
  taskSkillNames: string[],
  developerSkillNames: string[],
): void {
  const developerSkillSet = new Set(developerSkillNames);
  const missing = taskSkillNames.filter((skill) => !developerSkillSet.has(skill));
  if (missing.length > 0) {
    throw AppError.skillMismatch(`Developer is missing required skill(s): ${missing.join(", ")}`);
  }
}

async function hasIncompleteDescendant(tx: TxClient, taskId: string): Promise<boolean> {
  const children = await tx.task.findMany({
    where: { parentTaskId: taskId },
    select: { id: true, status: true },
  });
  for (const child of children) {
    if (child.status !== "DONE") return true;
    if (await hasIncompleteDescendant(tx, child.id)) return true;
  }
  return false;
}

/**
 * Recursively checks all descendant subtasks (any depth) are DONE before a
 * task is allowed to be marked DONE.
 */
export async function assertAllSubtasksDone(tx: TxClient, taskId: string): Promise<void> {
  if (await hasIncompleteDescendant(tx, taskId)) {
    throw AppError.subtasksIncomplete(
      "Cannot mark task as DONE while a subtask (at any depth) is not DONE",
    );
  }
}
