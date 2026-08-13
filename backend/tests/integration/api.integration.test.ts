import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

const app = createApp();

async function resetDatabase(): Promise<void> {
  await prisma.taskSkill.deleteMany();
  await prisma.task.deleteMany();
  await prisma.developerSkill.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.skill.deleteMany();
}

describe("API integration", () => {
  let frontendDevId: string;
  let backendDevId: string;

  beforeAll(async () => {
    await resetDatabase();

    const frontendDev = await prisma.developer.create({ data: { name: "Test Alice" } });
    const backendDev = await prisma.developer.create({ data: { name: "Test Bob" } });
    const frontendSkill = await prisma.skill.create({ data: { name: "Frontend" } });
    const backendSkill = await prisma.skill.create({ data: { name: "Backend" } });

    await prisma.developerSkill.create({
      data: { developerId: frontendDev.id, skillId: frontendSkill.id },
    });
    await prisma.developerSkill.create({
      data: { developerId: backendDev.id, skillId: backendSkill.id },
    });

    frontendDevId = frontendDev.id;
    backendDevId = backendDev.id;
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("GET /api/v1/health reports ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("rejects task creation with a missing title", async () => {
    const res = await request(app).post("/api/v1/tasks").send({ skills: ["Frontend"] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates a task with explicit skills and nested subtasks", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .send({
        title: "Build settings page",
        skills: ["Frontend"],
        subtasks: [{ title: "Style settings form", skills: ["Frontend"] }],
      });

    expect(res.status).toBe(201);
    expect(res.body.skills).toEqual(["Frontend"]);
    expect(res.body.subtasks).toHaveLength(1);
    expect(res.body.subtasks[0].title).toBe("Style settings form");
  });

  it("infers skills automatically via fallback heuristic when omitted", async () => {
    const res = await request(app).post("/api/v1/tasks").send({ title: "Design a new UI page" });
    expect(res.status).toBe(201);
    expect(res.body.skills).toEqual(["Frontend"]);
  });

  it("rejects assigning a developer who lacks the required skill", async () => {
    const created = await request(app)
      .post("/api/v1/tasks")
      .send({ title: "API task", skills: ["Backend"] });

    const res = await request(app)
      .patch(`/api/v1/tasks/${created.body.id}`)
      .send({ developerId: frontendDevId });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("SKILL_MISMATCH");
  });

  it("allows assigning a developer who has the required skill", async () => {
    const created = await request(app)
      .post("/api/v1/tasks")
      .send({ title: "Another API task", skills: ["Backend"] });

    const res = await request(app)
      .patch(`/api/v1/tasks/${created.body.id}`)
      .send({ developerId: backendDevId });

    expect(res.status).toBe(200);
    expect(res.body.developer.id).toBe(backendDevId);
  });

  it("rejects an invalid direct TODO -> DONE transition", async () => {
    const created = await request(app).post("/api/v1/tasks").send({ title: "Simple task", skills: [] });
    const res = await request(app).patch(`/api/v1/tasks/${created.body.id}`).send({ status: "DONE" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INVALID_STATUS_TRANSITION");
  });

  it("blocks marking a task DONE while a nested subtask is incomplete, then allows it once complete", async () => {
    const created = await request(app)
      .post("/api/v1/tasks")
      .send({
        title: "Parent task",
        skills: ["Frontend"],
        subtasks: [{ title: "Child task", skills: ["Frontend"] }],
      });
    const parentId = created.body.id;
    const childId = created.body.subtasks[0].id;

    const toInProgress = await request(app).patch(`/api/v1/tasks/${parentId}`).send({ status: "IN_PROGRESS" });
    expect(toInProgress.status).toBe(200);

    const blocked = await request(app).patch(`/api/v1/tasks/${parentId}`).send({ status: "DONE" });
    expect(blocked.status).toBe(409);
    expect(blocked.body.error.code).toBe("SUBTASKS_INCOMPLETE");

    await request(app).patch(`/api/v1/tasks/${childId}`).send({ status: "IN_PROGRESS" });
    await request(app).patch(`/api/v1/tasks/${childId}`).send({ status: "DONE" });

    const allowed = await request(app).patch(`/api/v1/tasks/${parentId}`).send({ status: "DONE" });
    expect(allowed.status).toBe(200);
    expect(allowed.body.status).toBe("DONE");
  });

  it("GET /api/v1/tasks and /api/v1/tasks/:id return matching nested data", async () => {
    const list = await request(app).get("/api/v1/tasks");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThan(0);

    const first = list.body[0];
    const single = await request(app).get(`/api/v1/tasks/${first.id}`);
    expect(single.status).toBe(200);
    expect(single.body.id).toBe(first.id);
  });

  it("returns 404 for an unknown task id", async () => {
    const res = await request(app).get("/api/v1/tasks/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });

  it("GET /api/v1/developers/:id includes nested skills and tasks", async () => {
    const res = await request(app).get(`/api/v1/developers/${backendDevId}`);
    expect(res.status).toBe(200);
    expect(res.body.skills).toContain("Backend");
  });

  it("GET /api/v1/skills/:id includes related developers", async () => {
    const skillsList = await request(app).get("/api/v1/skills");
    const backendSkill = skillsList.body.find((s: { name: string }) => s.name === "Backend");

    const res = await request(app).get(`/api/v1/skills/${backendSkill.id}`);
    expect(res.status).toBe(200);
    expect(res.body.developers.some((d: { id: string }) => d.id === backendDevId)).toBe(true);
  });
});
