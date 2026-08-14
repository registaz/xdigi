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
  isLast?: boolean;
  ancestorContinues?: boolean[];
}

function countSubtasks(task: Task): number {
  return task.subtasks.reduce((sum, sub) => sum + 1 + countSubtasks(sub), 0);
}

export function TaskRow({
  task,
  depth,
  developers,
  onChanged,
  isLast = true,
  ancestorContinues = [],
}: TaskRowProps) {
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
  const [expanded, setExpanded] = useState(true);
  const hasSubtasks = task.subtasks.length > 0;

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

  const childAncestorContinues = [...ancestorContinues, !isLast];

  return (
    <>
      <tr className={depth > 0 ? "task-row--nested" : undefined}>
        <td className="task-title-cell">
          {depth > 0 && (
            <span className="tree-guides" aria-hidden="true">
              {ancestorContinues.map((continues, i) => (
                <span key={i} className={`tree-guide${continues ? " tree-guide--line" : ""}`} />
              ))}
              <span className={`tree-guide tree-guide--${isLast ? "elbow" : "tee"}`} />
            </span>
          )}
          {hasSubtasks ? (
            <button
              type="button"
              className={`task-toggle${expanded ? "" : " task-toggle--collapsed"}`}
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
            >
              ▶
            </button>
          ) : (
            <span className="task-toggle-spacer" aria-hidden="true" />
          )}
          <span className={`task-title-text${depth === 0 ? " task-title-text--root" : ""}`}>{task.title}</span>
          {hasSubtasks && !expanded && <span className="task-collapsed-count">{countSubtasks(task)}</span>}
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
      {expanded &&
        task.subtasks.map((sub, index) => (
          <TaskRow
            key={sub.id}
            task={sub}
            depth={depth + 1}
            isLast={index === task.subtasks.length - 1}
            ancestorContinues={childAncestorContinues}
            developers={developers}
            onChanged={onChanged}
          />
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
