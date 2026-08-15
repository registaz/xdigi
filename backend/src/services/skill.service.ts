import { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/AppError";

const skillWithRelations = Prisma.validator<Prisma.SkillDefaultArgs>()({
  include: {
    developers: { include: { developer: true } },
    tasks: { include: { task: true } },
  },
});

type SkillRow = Prisma.SkillGetPayload<typeof skillWithRelations>;

export interface SkillDTO {
  id: string;
  name: string;
  developers: { id: string; name: string }[];
  tasks: { id: string; title: string; status: TaskStatus }[];
}

function toDto(skill: SkillRow): SkillDTO {
  return {
    id: skill.id,
    name: skill.name,
    developers: skill.developers.map((d) => ({ id: d.developer.id, name: d.developer.name })),
    tasks: skill.tasks.map((t) => ({ id: t.task.id, title: t.task.title, status: t.task.status })),
  };
}

export async function listSkills(): Promise<SkillDTO[]> {
  const skills = await prisma.skill.findMany({
    ...skillWithRelations,
    orderBy: { name: "asc" },
  });
  return skills.map(toDto);
}

export async function getSkillById(id: string): Promise<SkillDTO> {
  const skill = await prisma.skill.findUnique({
    where: { id },
    ...skillWithRelations,
  });
  if (!skill) throw AppError.notFound(`Skill ${id} not found`);
  return toDto(skill);
}
