-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "developers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer_skills" (
    "developerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "developer_skills_pkey" PRIMARY KEY ("developerId","skillId")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "developerId" TEXT,
    "parentTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_skills" (
    "taskId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "task_skills_pkey" PRIMARY KEY ("taskId","skillId")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "tasks_developerId_idx" ON "tasks"("developerId");

-- CreateIndex
CREATE INDEX "tasks_parentTaskId_idx" ON "tasks"("parentTaskId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- AddForeignKey
ALTER TABLE "developer_skills" ADD CONSTRAINT "developer_skills_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_skills" ADD CONSTRAINT "developer_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_skills" ADD CONSTRAINT "task_skills_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_skills" ADD CONSTRAINT "task_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
