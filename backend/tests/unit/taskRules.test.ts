import {
  assertAllSubtasksDone,
  assertDeveloperHasRequiredSkills,
  assertValidStatusTransition,
} from "../../src/services/taskRules";
import { AppError } from "../../src/errors/AppError";
import { TaskStatus } from "@prisma/client";

describe("assertValidStatusTransition", () => {
  it("allows TODO -> IN_PROGRESS", () => {
    expect(() => assertValidStatusTransition("TODO", "IN_PROGRESS")).not.toThrow();
  });

  it("allows IN_PROGRESS -> DONE", () => {
    expect(() => assertValidStatusTransition("IN_PROGRESS", "DONE")).not.toThrow();
  });

  it("allows IN_PROGRESS -> TODO (reopen)", () => {
    expect(() => assertValidStatusTransition("IN_PROGRESS", "TODO")).not.toThrow();
  });

  it("allows DONE -> IN_PROGRESS (reopen)", () => {
    expect(() => assertValidStatusTransition("DONE", "IN_PROGRESS")).not.toThrow();
  });

  it("treats same-status changes as a no-op", () => {
    expect(() => assertValidStatusTransition("TODO", "TODO")).not.toThrow();
  });

  it("rejects TODO -> DONE directly", () => {
    expect(() => assertValidStatusTransition("TODO", "DONE")).toThrow(AppError);
  });

  it("rejects DONE -> TODO directly", () => {
    expect(() => assertValidStatusTransition("DONE", "TODO")).toThrow(AppError);
  });
});

describe("assertDeveloperHasRequiredSkills", () => {
  it("passes when the developer has a superset of the required skills", () => {
    expect(() => assertDeveloperHasRequiredSkills(["Frontend"], ["Frontend", "Backend"])).not.toThrow();
  });

  it("passes when the task requires no skills", () => {
    expect(() => assertDeveloperHasRequiredSkills([], [])).not.toThrow();
  });

  it("throws when the developer is missing a required skill", () => {
    expect(() => assertDeveloperHasRequiredSkills(["Backend"], ["Frontend"])).toThrow(AppError);
  });

  it("throws listing every missing skill", () => {
    try {
      assertDeveloperHasRequiredSkills(["Frontend", "Backend"], []);
      throw new Error("expected assertDeveloperHasRequiredSkills to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).message).toContain("Frontend");
      expect((err as AppError).message).toContain("Backend");
    }
  });
});

describe("assertAllSubtasksDone", () => {
  function mockTx(childrenByParent: Record<string, { id: string; status: TaskStatus }[]>) {
    return {
      task: {
        findMany: jest.fn(({ where }: { where: { parentTaskId: string } }) =>
          Promise.resolve(childrenByParent[where.parentTaskId] ?? []),
        ),
      },
    } as any;
  }

  it("resolves when there are no subtasks", async () => {
    const tx = mockTx({});
    await expect(assertAllSubtasksDone(tx, "root")).resolves.toBeUndefined();
  });

  it("resolves when all nested subtasks (any depth) are DONE", async () => {
    const tx = mockTx({
      root: [{ id: "child1", status: "DONE" }],
      child1: [{ id: "grandchild1", status: "DONE" }],
    });
    await expect(assertAllSubtasksDone(tx, "root")).resolves.toBeUndefined();
  });

  it("rejects when a direct subtask is not DONE", async () => {
    const tx = mockTx({
      root: [{ id: "child1", status: "TODO" }],
    });
    await expect(assertAllSubtasksDone(tx, "root")).rejects.toThrow(AppError);
  });

  it("rejects when a deeply nested grandchild subtask is not DONE", async () => {
    const tx = mockTx({
      root: [{ id: "child1", status: "DONE" }],
      child1: [{ id: "grandchild1", status: "IN_PROGRESS" }],
    });
    await expect(assertAllSubtasksDone(tx, "root")).rejects.toThrow(AppError);
  });
});
