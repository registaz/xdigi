import { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/AppError";
import { CreateTaskInput, UpdateTaskInput } from "../validation/task.schema";
import { normalizeSkillNames } from "../utils/skillNames";
import { inferSkills } from "../llm/skillInference";
import {
  assertAllSubtasksDone,
  assertDeveloperHasRequiredSkills,
  assertValidStatusTransition,
} from "./taskRules";

type TxClient = Prisma.TransactionClient;

const taskWithRelations = Prisma.validator<Prisma.TaskDefaultArgs>()({
  include: {
    skills: { include: { skill: true } },
    developer: true,
  },
});

type TaskRow = Prisma.TaskGetPayload<typeof taskWithRelations>;

export interface TaskDTO {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  developer: { id: string; name: string } | null;
  skills: string[];
  subtasks: TaskDTO[];
}

interface ResolvedTaskInput {
  title: string;
  status?: TaskStatus;
  developerId?: string;
  skills: string[];
  subtasks: ResolvedTaskInput[];
}

function toDto(row: TaskRow): Omit<TaskDTO, "subtasks"> {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    developer: row.developer ? { id: row.developer.id, name: row.developer.name } : null,
    skills: row.skills.map((s) => s.skill.name),
  };
}

/**
 * Builds a parent/child tree from a flat list of task rows. Used by both
 * listTasks (all root tasks) and getTaskById (a single subtree), since
 * Prisma cannot express an arbitrarily deep recursive `include`.
 */
function buildTree(rows: TaskRow[]): { map: Map<string, TaskDTO>; roots: TaskDTO[] } {
  const map = new Map<string, TaskDTO>();
  for (const row of rows) {
    map.set(row.id, { ...toDto(row), subtasks: [] });
  }
  const roots: TaskDTO[] = [];
  for (const row of rows) {
    const node = map.get(row.id);
    if (!node) continue;
    const parent = row.parentTaskId ? map.get(row.parentTaskId) : undefined;
    if (parent) {
      parent.subtasks.push(node);
    } else {
      roots.push(node);
    }
  }
  return { map, roots };
}

async function fetchAllTaskRows(): Promise<TaskRow[]> {
  return prisma.task.findMany({
    ...taskWithRelations,
    orderBy: { createdAt: "asc" },
  });
}

export async function listTasks(): Promise<TaskDTO[]> {
  const rows = await fetchAllTaskRows();
  return buildTree(rows).roots;
}

export async function getTaskById(id: string): Promise<TaskDTO> {
  const rows = await fetchAllTaskRows();
  const { map } = buildTree(rows);
  const node = map.get(id);
  if (!node) throw AppError.notFound(`Task ${id} not found`);
  return node;
}

/**
 * Walks the (potentially nested) create-task input and fills in `skills`
 * for any node that omitted them via LLM inference. Done ahead of the DB
 * transaction so network calls never hold a transaction open.
 */
async function resolveSkillsForTree(input: CreateTaskInput): Promise<ResolvedTaskInput> {
  const skills =
    input.skills && input.skills.length > 0 ? normalizeSkillNames(input.skills) : await inferSkills(input.title);

  const subtasks = input.subtasks ? await Promise.all(input.subtasks.map(resolveSkillsForTree)) : [];

  return {
    title: input.title,
    status: input.status,
    developerId: input.developerId,
    skills,
    subtasks,
  };
}

async function resolveSkillIds(tx: TxClient, names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const skill = await tx.skill.upsert({ where: { name }, update: {}, create: { name } });
    ids.push(skill.id);
  }
  return ids;
}

async function persistTaskTree(tx: TxClient, input: ResolvedTaskInput, parentTaskId: string | null): Promise<string> {
  if (input.developerId) {
    const developer = await tx.developer.findUnique({
      where: { id: input.developerId },
      include: { skills: { include: { skill: true } } },
    });
    if (!developer) throw AppError.notFound(`Developer ${input.developerId} not found`);
    assertDeveloperHasRequiredSkills(
      input.skills,
      developer.skills.map((s) => s.skill.name),
    );
  }

  const status: TaskStatus = input.status ?? "TODO";
  if (status !== "TODO") {
    assertValidStatusTransition("TODO", status);
  }

  const skillIds = await resolveSkillIds(tx, input.skills);

  const task = await tx.task.create({
    data: {
      title: input.title,
      status,
      developerId: input.developerId ?? null,
      parentTaskId,
      skills: { create: skillIds.map((skillId) => ({ skillId })) },
    },
  });

  for (const subtask of input.subtasks) {
    await persistTaskTree(tx, subtask, task.id);
  }

  return task.id;
}

export async function createTask(input: CreateTaskInput): Promise<TaskDTO> {
  const resolved = await resolveSkillsForTree(input);
  const id = await prisma.$transaction((tx) => persistTaskTree(tx, resolved, null));
  return getTaskById(id);
}

/**
 * Deletes a task by id. Descendant subtasks and their task-skill links are
 * removed automatically at the database level via the `onDelete: Cascade`
 * self-relation on `Task.parentTask`, which Postgres applies transitively.
 */
export async function deleteTask(id: string): Promise<void> {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound(`Task ${id} not found`);
  await prisma.task.delete({ where: { id } });
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<TaskDTO> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.task.findUnique({
      where: { id },
      include: { skills: { include: { skill: true } } },
    });
    if (!existing) throw AppError.notFound(`Task ${id} not found`);

    if (input.developerId !== undefined) {
      if (input.developerId === null) {
        await tx.task.update({ where: { id }, data: { developerId: null } });
      } else {
        const developer = await tx.developer.findUnique({
          where: { id: input.developerId },
          include: { skills: { include: { skill: true } } },
        });
        if (!developer) throw AppError.notFound(`Developer ${input.developerId} not found`);
        assertDeveloperHasRequiredSkills(
          existing.skills.map((s) => s.skill.name),
          developer.skills.map((s) => s.skill.name),
        );
        await tx.task.update({ where: { id }, data: { developerId: input.developerId } });
      }
    }

    if (input.status !== undefined) {
      assertValidStatusTransition(existing.status, input.status);
      if (input.status === "DONE") {
        await assertAllSubtasksDone(tx, id);
      }
      await tx.task.update({ where: { id }, data: { status: input.status } });
    }
  });

  return getTaskById(id);
}
