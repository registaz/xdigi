import { useState } from "react";
import type { Developer, Task, TaskStatus } from "../types";
import { StatusSelect } from "./StatusSelect";
import { DeveloperSelect } from "./DeveloperSelect";
import { SkillBadges } from "./SkillBadges";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { tasksApi } from "../api/tasks";
import { useAsyncAction } from "../hooks/useAsync";

interface TaskRowProps {
  task: Task;
  depth: number;
  developers: Developer[];
  onChanged: () => void;
}

function countSubtasks(task: Task): number {
  return task.subtasks.reduce((sum, sub) => sum + 1 + countSubtasks(sub), 0);
}

export function TaskRow({ task, depth, developers, onChanged }: TaskRowProps) {
  const { run, loading, error } = useAsyncAction((payload: { status?: TaskStatus; developerId?: string | null }) =>
    tasksApi.update(task.id, payload),
  );
  const {
    run: runDelete,
    loading: deleting,
    error: deleteError,
  } = useAsyncAction(async () => {
    await tasksApi.remove(task.id);
    return true;
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function handleStatusChange(status: TaskStatus) {
    const result = await run({ status });
    if (result) onChanged();
  }

  async function handleDeveloperChange(developerId: string | null) {
    const result = await run({ developerId });
    if (result) onChanged();
  }

  async function handleConfirmDelete() {
    const result = await runDelete();
    if (result) {
      setShowDeleteModal(false);
      onChanged();
    }
  }

  return (
    <>
      <tr>
        <td className="task-title-cell" style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}>
          {depth > 0 ? <span className="subtask-marker">↳</span> : null}
          {task.title}
        </td>
        <td>
          <SkillBadges skills={task.skills} />
        </td>
        <td>
          <StatusSelect value={task.status} disabled={loading} onChange={handleStatusChange} />
        </td>
        <td>
          <DeveloperSelect
            developers={developers}
            requiredSkills={task.skills}
            value={task.developer?.id ?? null}
            disabled={loading}
            onChange={handleDeveloperChange}
          />
        </td>
        <td>{countSubtasks(task)}</td>
        <td>
          <button type="button" className="button button--danger" onClick={() => setShowDeleteModal(true)}>
            Delete
          </button>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={6} className="row-error">
            {error}
          </td>
        </tr>
      )}
      {task.subtasks.map((sub) => (
        <TaskRow key={sub.id} task={sub} depth={depth + 1} developers={developers} onChanged={onChanged} />
      ))}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        taskTitle={task.title}
        descendantCount={countSubtasks(task)}
        loading={deleting}
        error={deleteError}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
