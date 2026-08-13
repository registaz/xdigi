import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/AppError";

const developerWithRelations = Prisma.validator<Prisma.DeveloperDefaultArgs>()({
  include: {
    skills: { include: { skill: true } },
    tasks: { include: { skills: { include: { skill: true } } } },
  },
});

type DeveloperRow = Prisma.DeveloperGetPayload<typeof developerWithRelations>;

export interface DeveloperDTO {
  id: string;
  name: string;
  skills: string[];
  tasks: { id: string; title: string; status: string; skills: string[] }[];
}

function toDto(developer: DeveloperRow): DeveloperDTO {
  return {
    id: developer.id,
    name: developer.name,
    skills: developer.skills.map((s) => s.skill.name),
    tasks: developer.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      skills: t.skills.map((s) => s.skill.name),
    })),
  };
}

export async function listDevelopers(): Promise<DeveloperDTO[]> {
  const developers = await prisma.developer.findMany({
    ...developerWithRelations,
    orderBy: { name: "asc" },
  });
  return developers.map(toDto);
}

export async function getDeveloperById(id: string): Promise<DeveloperDTO> {
  const developer = await prisma.developer.findUnique({
    where: { id },
    ...developerWithRelations,
  });
  if (!developer) throw AppError.notFound(`Developer ${id} not found`);
  return toDto(developer);
}
