import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SKILLS = ["Frontend", "Backend"] as const;

const DEVELOPERS: { name: string; skills: string[] }[] = [
  { name: "Alice", skills: ["Frontend"] },
  { name: "Bob", skills: ["Backend"] },
  { name: "Carol", skills: ["Frontend", "Backend"] },
  { name: "Dave", skills: ["Backend"] },
];

async function main() {
  const skillByName = new Map<string, string>();

  for (const name of SKILLS) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skillByName.set(name, skill.id);
  }

  for (const dev of DEVELOPERS) {
    const existing = await prisma.developer.findFirst({ where: { name: dev.name } });
    const developer =
      existing ??
      (await prisma.developer.create({
        data: { name: dev.name },
      }));

    for (const skillName of dev.skills) {
      const skillId = skillByName.get(skillName);
      if (!skillId) continue;
      await prisma.developerSkill.upsert({
        where: { developerId_skillId: { developerId: developer.id, skillId } },
        update: {},
        create: { developerId: developer.id, skillId },
      });
    }
  }

  console.log("Seed complete: skills =", SKILLS.join(", "), "developers =", DEVELOPERS.map((d) => d.name).join(", "));
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
